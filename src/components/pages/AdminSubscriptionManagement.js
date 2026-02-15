import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, update, remove } from 'firebase/database';
import { FaSearch, FaCheck, FaTimes, FaCrown, FaUser, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';

const AdminSubscriptionManagement = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'active', 'assign'
    const [pendingPayments, setPendingPayments] = useState([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [searchPhone, setSearchPhone] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchedUser, setSearchedUser] = useState(null);

const SUBSCRIPTION_PLANS = [
    {
        id: 'silver',
        title: 'सिल्व्हर / Silver',
        nameMarathi: 'सिल्व्हर',
        nameEnglish: 'Silver',
        originalPrice: 2999,
        discountedPrice: 2999,
        biodataLimit: 18,
        validityDays: 90,
        targetAudience: 'user',
        planType: 'premium'
    },
    {
        id: 'platinum',
        title: 'प्लॅटिनम / Platinum',
        nameMarathi: 'प्लॅटिनम',
        nameEnglish: 'Platinum',
        originalPrice: 4999,
        discountedPrice: 4999,
        biodataLimit: 30,
        validityDays: 150,
        targetAudience: 'user',
        planType: 'premium'
    },
    {
        id: 'gold',
        title: 'गोल्ड / Gold',
        nameMarathi: 'गोल्ड',
        nameEnglish: 'Gold',
        originalPrice: 9999,
        discountedPrice: 9999,
        biodataLimit: 50,
        validityDays: 365,
        targetAudience: 'user',
        planType: 'premium'
    }
];

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingPayments();
        } else if (activeTab === 'active') {
            fetchActiveSubscriptions();
        }
    }, [activeTab]);

    const fetchPendingPayments = async () => {
        setLoading(true);
        try {
            const db = getDatabase();
            const paymentsRef = ref(db, 'Matrimony/pendingPayments');
            const snapshot = await get(paymentsRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                const paymentsArray = Object.entries(data).map(([id, payment]) => ({
                    id,
                    ...payment
                }));
                setPendingPayments(paymentsArray.sort((a, b) => 
                    new Date(b.submittedAt) - new Date(a.submittedAt)
                ));
            } else {
                setPendingPayments([]);
            }
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            alert('Failed to fetch pending payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveSubscriptions = async () => {
        setLoading(true);
        try {
            const db = getDatabase();
            
            // Fetch from new structure: Matrimony/users/{phone}/subscriptions
            const usersRef = ref(db, 'Matrimony/users');
            const usersSnapshot = await get(usersRef);
            
            const subsArray = [];
            
            if (usersSnapshot.exists()) {
                const usersData = usersSnapshot.val();
                
                // Iterate through all users
                for (const [phoneNumber, userData] of Object.entries(usersData)) {
                    if (userData.subscriptions) {
                        // Get all subscriptions for this user
                        const userSubscriptions = Object.entries(userData.subscriptions);
                        
                        // Get the most recent active subscription
                        const activeSubscription = userSubscriptions
                            .map(([subId, subData]) => ({
                                subscriptionId: subId,
                                userId: `user_${phoneNumber}`,
                                phoneNumber: phoneNumber,
                                ...subData
                            }))
                            .filter(sub => sub.status === 'active')
                            .sort((a, b) => b.startDate - a.startDate)[0];
                        
                        if (activeSubscription) {
                            subsArray.push(activeSubscription);
                        }
                    }
                }
            }
            
            // Sort by activation date (most recent first)
            subsArray.sort((a, b) => b.activatedAt - a.activatedAt);
            
            setActiveSubscriptions(subsArray);
        } catch (error) {
            console.error('Error fetching active subscriptions:', error);
            alert('Failed to fetch active subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const approvePayment = async (payment) => {
        if (!window.confirm(`Approve payment of ₹${payment.amount} for ${payment.phoneNumber}?`)) {
            return;
        }

        setLoading(true);
        try {
            const db = getDatabase();
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === payment.planId);
            
            if (!plan) {
                alert('Invalid plan');
                return;
            }

            const startDate = Date.now();
            const endDate = startDate + (plan.validityDays * 24 * 60 * 60 * 1000);
            const subscriptionId = `sub_${startDate}`;

            // Create subscription data following the documentation structure
            const subscriptionData = {
                planName: plan.title,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                viewLimit: plan.biodataLimit,
                viewsUsed: 0,
                purchasePrice: payment.amount,
                paymentMethod: 'UPI_QR',
                activatedBy: 'admin',
                activatedAt: startDate,
                planType: plan.planType,
                targetAudience: plan.targetAudience,
                phoneNumber: payment.phoneNumber,
                transactionId: payment.transactionId,
                paymentId: payment.id
            };

            // Save to user's subscriptions node (primary location)
            await set(ref(db, `Matrimony/users/${payment.phoneNumber}/subscriptions/${subscriptionId}`), subscriptionData);

            // Save to active subscriptions for admin view
            const userId = `user_${payment.phoneNumber}`;
            await set(ref(db, `Matrimony/activeSubscriptions/${userId}`), {
                ...subscriptionData,
                userId: userId,
                approvedAt: new Date().toISOString()
            });

            // Remove from pending payments
            await remove(ref(db, `Matrimony/pendingPayments/${payment.id}`));

            // Save to payment history
            await set(ref(db, `Matrimony/paymentHistory/${payment.id}`), {
                ...payment,
                status: 'approved',
                approvedAt: new Date().toISOString(),
                approvedBy: 'admin',
                subscriptionId: subscriptionId
            });

            alert(`Payment approved and subscription activated!\n\nDetails:\n- Plan: ${plan.title}\n- Validity: ${plan.validityDays} days\n- Views: ${plan.biodataLimit}\n- User: ${payment.phoneNumber}`);
            fetchPendingPayments();
        } catch (error) {
            console.error('Error approving payment:', error);
            alert('Failed to approve payment');
        } finally {
            setLoading(false);
        }
    };

    const rejectPayment = async (payment) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;

        setLoading(true);
        try {
            const db = getDatabase();

            // Remove from pending payments
            await remove(ref(db, `Matrimony/pendingPayments/${payment.id}`));

            // Save to payment history
            await set(ref(db, `Matrimony/paymentHistory/${payment.id}`), {
                ...payment,
                status: 'rejected',
                rejectedAt: new Date().toISOString(),
                rejectedBy: 'admin',
                rejectionReason: reason
            });

            alert('Payment rejected');
            fetchPendingPayments();
        } catch (error) {
            console.error('Error rejecting payment:', error);
            alert('Failed to reject payment');
        } finally {
            setLoading(false);
        }
    };

    const searchUser = async () => {
        if (!searchPhone || searchPhone.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            const db = getDatabase();
            
            // Check if user has active subscription in new structure
            const userSubsRef = ref(db, `Matrimony/users/${searchPhone}/subscriptions`);
            const userSubsSnapshot = await get(userSubsRef);

            let activeSubscription = null;
            
            if (userSubsSnapshot.exists()) {
                const subscriptions = userSubsSnapshot.val();
                // Find the most recent active subscription
                const activeSubs = Object.entries(subscriptions)
                    .map(([subId, subData]) => ({ subId, ...subData }))
                    .filter(sub => sub.status === 'active' && sub.endDate > Date.now())
                    .sort((a, b) => b.startDate - a.startDate);
                
                if (activeSubs.length > 0) {
                    activeSubscription = activeSubs[0];
                }
            }

            setSearchedUser({
                phoneNumber: searchPhone,
                userId: `user_${searchPhone}`,
                hasSubscription: activeSubscription !== null,
                subscription: activeSubscription
            });
        } catch (error) {
            console.error('Error searching user:', error);
            alert('Failed to search user');
        } finally {
            setLoading(false);
        }
    };

    const assignPlanToUser = async () => {
        if (!searchedUser || !selectedPlan) {
            alert('Please search for a user and select a plan');
            return;
        }

        if (!window.confirm(`Assign ${selectedPlan} to ${searchedUser.phoneNumber}?`)) {
            return;
        }

        setLoading(true);
        try {
            const db = getDatabase();
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

            const startDate = Date.now();
            const endDate = startDate + (plan.validityDays * 24 * 60 * 60 * 1000);
            const subscriptionId = `sub_${startDate}`;

            const subscriptionData = {
                planName: plan.title,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                viewLimit: plan.biodataLimit,
                viewsUsed: 0,
                purchasePrice: plan.discountedPrice,
                paymentMethod: 'UPI_QR',
                activatedBy: 'admin',
                activatedAt: startDate,
                planType: plan.planType,
                targetAudience: plan.targetAudience,
                phoneNumber: searchedUser.phoneNumber
            };

            // Save to user's subscriptions node
            await set(ref(db, `Matrimony/users/${searchedUser.phoneNumber}/subscriptions/${subscriptionId}`), subscriptionData);

            // Also save to activeSubscriptions for admin view
            await set(ref(db, `Matrimony/activeSubscriptions/${searchedUser.userId}`), {
                ...subscriptionData,
                userId: searchedUser.userId,
                activatedAt: new Date().toISOString()
            });

            alert(`Plan assigned successfully!\n\nDetails:\n- Plan: ${plan.title}\n- Validity: ${plan.validityDays} days\n- Views: ${plan.biodataLimit}\n- User: ${searchedUser.phoneNumber}`);
            setSearchedUser(null);
            setSearchPhone('');
            setSelectedPlan('');
        } catch (error) {
            console.error('Error assigning plan:', error);
            alert('Failed to assign plan');
        } finally {
            setLoading(false);
        }
    };

    const revokeSubscription = async (subscription) => {
        if (!window.confirm(`Revoke subscription for ${subscription.phoneNumber}?`)) {
            return;
        }

        setLoading(true);
        try {
            const db = getDatabase();
            
            // Update subscription status to 'revoked' instead of deleting
            await update(ref(db, `Matrimony/users/${subscription.phoneNumber}/subscriptions/${subscription.subscriptionId}`), {
                status: 'revoked',
                revokedAt: Date.now(),
                revokedBy: 'admin'
            });
            
            // Also remove from activeSubscriptions if it exists there
            const userId = `user_${subscription.phoneNumber}`;
            await remove(ref(db, `Matrimony/activeSubscriptions/${userId}`));
            
            alert('Subscription revoked');
            fetchActiveSubscriptions();
        } catch (error) {
            console.error('Error revoking subscription:', error);
            alert('Failed to revoke subscription');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        // Handle both timestamp (number) and date string formats
        const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Subscription Management</h1>
                <p style={styles.subtitle}>Manage user subscriptions and payment approvals</p>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'pending' ? styles.activeTab : {})
                    }}
                >
                    Pending Payments ({pendingPayments.length})
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'active' ? styles.activeTab : {})
                    }}
                >
                    Active Subscriptions ({activeSubscriptions.length})
                </button>
                <button
                    onClick={() => setActiveTab('assign')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'assign' ? styles.activeTab : {})
                    }}
                >
                    Assign Plan
                </button>
            </div>

            {/* Content */}
            <div style={styles.content}>
                {loading && (
                    <div style={styles.loadingOverlay}>
                        <div style={styles.spinner}></div>
                    </div>
                )}

                {/* Pending Payments Tab */}
                {activeTab === 'pending' && (
                    <div>
                        {pendingPayments.length === 0 ? (
                            <div style={styles.emptyState}>
                                <FaMoneyBillWave style={styles.emptyIcon} />
                                <h3>No Pending Payments</h3>
                                <p>All payments have been processed</p>
                            </div>
                        ) : (
                            <div style={styles.grid}>
                                {pendingPayments.map((payment) => (
                                    <div key={payment.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <h3 style={styles.cardTitle}>{payment.planTitle}</h3>
                                            <span style={styles.amountBadge}>₹{payment.amount}</span>
                                        </div>
                                        
                                        <div style={styles.cardBody}>
                                            <div style={styles.infoRow}>
                                                <FaUser style={styles.icon} />
                                                <span>{payment.phoneNumber}</span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <FaCalendar style={styles.icon} />
                                                <span>{formatDate(payment.submittedAt)}</span>
                                            </div>
                                            {payment.transactionId && (
                                                <div style={styles.infoRow}>
                                                    <FaMoneyBillWave style={styles.icon} />
                                                    <span>TXN: {payment.transactionId}</span>
                                                </div>
                                            )}
                                            {payment.paymentScreenshot && (
                                                <div style={styles.screenshotContainer}>
                                                    <img 
                                                        src={payment.paymentScreenshot} 
                                                        alt="Payment proof" 
                                                        style={styles.screenshot}
                                                        onClick={() => window.open(payment.paymentScreenshot, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.cardActions}>
                                            <button
                                                onClick={() => approvePayment(payment)}
                                                style={styles.approveButton}
                                                disabled={loading}
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button
                                                onClick={() => rejectPayment(payment)}
                                                style={styles.rejectButton}
                                                disabled={loading}
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Active Subscriptions Tab */}
                {activeTab === 'active' && (
                    <div>
                        {activeSubscriptions.length === 0 ? (
                            <div style={styles.emptyState}>
                                <FaCrown style={styles.emptyIcon} />
                                <h3>No Active Subscriptions</h3>
                                <p>No users have active subscriptions</p>
                            </div>
                        ) : (
                            <div style={styles.grid}>
                                {activeSubscriptions.map((subscription) => {
                                    const isExpired = subscription.endDate < Date.now();
                                    const remainingViews = subscription.viewLimit - subscription.viewsUsed;
                                    return (
                                        <div key={subscription.subscriptionId} style={styles.card}>
                                            <div style={styles.cardHeader}>
                                                <h3 style={styles.cardTitle}>{subscription.planName}</h3>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    background: isExpired ? '#ef4444' : '#10b981'
                                                }}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </div>
                                            
                                            <div style={styles.cardBody}>
                                                <div style={styles.infoRow}>
                                                    <FaUser style={styles.icon} />
                                                    <span>{subscription.phoneNumber}</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <FaCrown style={styles.icon} />
                                                    <span>{remainingViews} / {subscription.viewLimit} remaining</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <FaCalendar style={styles.icon} />
                                                    <span>Expires: {formatDate(subscription.endDate)}</span>
                                                </div>
                                                <div style={styles.infoRow}>
                                                    <FaMoneyBillWave style={styles.icon} />
                                                    <span>₹{subscription.purchasePrice}</span>
                                                </div>
                                            </div>

                                            <div style={styles.cardActions}>
                                                <button
                                                    onClick={() => revokeSubscription(subscription)}
                                                    style={styles.revokeButton}
                                                    disabled={loading}
                                                >
                                                    <FaTimes /> Revoke
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Assign Plan Tab */}
                {activeTab === 'assign' && (
                    <div style={styles.assignContainer}>
                        <div style={styles.searchSection}>
                            <h3 style={styles.sectionTitle}>Search User by Phone Number</h3>
                            <div style={styles.searchBox}>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit phone number"
                                    value={searchPhone}
                                    onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    style={styles.searchInput}
                                    maxLength="10"
                                />
                                <button
                                    onClick={searchUser}
                                    style={styles.searchButton}
                                    disabled={loading || searchPhone.length !== 10}
                                >
                                    <FaSearch /> Search
                                </button>
                            </div>
                        </div>

                        {searchedUser && (
                            <div style={styles.userResult}>
                                <h3 style={styles.sectionTitle}>User: {searchedUser.phoneNumber}</h3>
                                
                                {searchedUser.hasSubscription ? (
                                    <div style={styles.existingSubscription}>
                                        <FaCrown style={{ fontSize: '2rem', color: '#10b981' }} />
                                        <h4>Active Subscription</h4>
                                        <p>{searchedUser.subscription.planName}</p>
                                        <p>{searchedUser.subscription.viewLimit - searchedUser.subscription.viewsUsed} / {searchedUser.subscription.viewLimit} remaining</p>
                                        <p>Expires: {formatDate(searchedUser.subscription.endDate)}</p>
                                    </div>
                                ) : (
                                    <p style={styles.noSubscription}>No active subscription</p>
                                )}

                                <div style={styles.planSelection}>
                                    <h4 style={styles.sectionTitle}>Select Plan to Assign</h4>
                                    <div style={styles.plansGrid}>
                                        {SUBSCRIPTION_PLANS.map((plan) => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setSelectedPlan(plan.id)}
                                                style={{
                                                    ...styles.planCard,
                                                    border: selectedPlan === plan.id ? '3px solid #6a11cb' : '2px solid #e2e8f0'
                                                }}
                                            >
                                                <h4>{plan.title}</h4>
                                                <p style={styles.planPrice}>₹{plan.discountedPrice}</p>
                                                <p>{plan.biodataLimit} Biodatas</p>
                                                <p>{plan.validityDays} Days</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={assignPlanToUser}
                                        style={styles.assignButton}
                                        disabled={loading || !selectedPlan}
                                    >
                                        Assign Selected Plan
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        padding: '1.5rem',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: '#f7f7f7'
    },
    header: {
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '0.5rem'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#64748b'
    },
    tabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #e2e8f0',
        flexWrap: 'wrap'
    },
    tab: {
        background: 'none',
        border: 'none',
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#64748b',
        cursor: 'pointer',
        borderBottom: '3px solid transparent',
        transition: 'all 0.3s ease'
    },
    activeTab: {
        color: '#6a11cb',
        borderBottom: '3px solid #6a11cb'
    },
    content: {
        position: 'relative',
        minHeight: '400px'
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #6a11cb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#64748b'
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        color: '#cbd5e1'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        width: '100%'
    },
    card: {
        background: 'white',
        borderRadius: '15px',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        border: '2px solid #e2e8f0'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
    },
    cardTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: 0
    },
    amountBadge: {
        background: '#10b981',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '1.1rem'
    },
    statusBadge: {
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    cardBody: {
        marginBottom: '1rem'
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.75rem',
        color: '#475569',
        fontSize: '0.95rem'
    },
    icon: {
        color: '#6a11cb',
        fontSize: '1rem'
    },
    screenshotContainer: {
        marginTop: '1rem',
        textAlign: 'center'
    },
    screenshot: {
        maxWidth: '100%',
        maxHeight: '200px',
        borderRadius: '10px',
        cursor: 'pointer',
        border: '2px solid #e2e8f0'
    },
    cardActions: {
        display: 'flex',
        gap: '0.75rem'
    },
    approveButton: {
        flex: 1,
        background: '#10b981',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease'
    },
    rejectButton: {
        flex: 1,
        background: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease'
    },
    revokeButton: {
        width: '100%',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease'
    },
    assignContainer: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    searchSection: {
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    },
    sectionTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem'
    },
    searchBox: {
        display: 'flex',
        gap: '1rem'
    },
    searchInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none'
    },
    searchButton: {
        background: '#6a11cb',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease'
    },
    userResult: {
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    existingSubscription: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        padding: '1.5rem',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#166534'
    },
    noSubscription: {
        background: '#fef3c7',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#92400e',
        marginBottom: '2rem'
    },
    planSelection: {
        marginTop: '2rem'
    },
    plansGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    planCard: {
        padding: '1.5rem',
        borderRadius: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    planPrice: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#6a11cb',
        margin: '0.5rem 0'
    },
    assignButton: {
        width: '100%',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: '1rem',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    }
};

export default AdminSubscriptionManagement;
