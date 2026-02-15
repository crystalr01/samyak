import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaQrcode, FaUpload, FaEnvelope, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getDatabase, ref, set, push, get } from 'firebase/database';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const SubscriptionPlans = ({ onClose, onLoginSuccess }) => {
    const { user, login, hasActiveSubscription } = useAuth();
    
    // Static subscription plans - Marathi and English
    const SUBSCRIPTION_PLANS = [
        {
            id: 'silver',
            nameMarathi: 'सिल्व्हर',
            nameEnglish: 'Silver',
            price: 2999,
            validityMonths: 3,
            validityDays: 90,
            biodataLimit: 18,
            color: '#94a3b8',
            icon: '🥈'
        },
        {
            id: 'platinum',
            nameMarathi: 'प्लॅटिनम',
            nameEnglish: 'Platinum',
            price: 4999,
            validityMonths: 5,
            validityDays: 150,
            biodataLimit: 30,
            color: '#e5e7eb',
            icon: '💎',
            popular: true
        },
        {
            id: 'gold',
            nameMarathi: 'गोल्ड',
            nameEnglish: 'Gold',
            price: 9999,
            validityMonths: 12,
            validityDays: 365,
            biodataLimit: 50,
            color: '#fbbf24',
            icon: '👑'
        }
    ];
    
    // Check if user already has active subscription on mount
    useEffect(() => {
        if (user && hasActiveSubscription && hasActiveSubscription()) {
            console.log('SubscriptionPlans: User already has active subscription, closing modal');
            if (onClose) {
                onClose();
            }
        }
    }, [user, hasActiveSubscription, onClose]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Login states
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    
    // Use static plans instead of fetching from Firebase
    const plans = SUBSCRIPTION_PLANS;
    
    const [qrDetails, setQrDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch QR details on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const db = getDatabase();
            
            // Fetch QR details
            const qrRef = ref(db, 'Matrimony/Qr');
            const qrSnapshot = await get(qrRef);
            if (qrSnapshot.exists()) {
                setQrDetails(qrSnapshot.val());
            }
            
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        if (!user) {
            setSelectedPlan(plan);
            setShowLoginModal(true);
            return;
        }
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const setupRecaptcha = () => {
        const auth = getAuth();
        
        // Force clear any existing verifier
        if (window.recaptchaVerifierPlans) {
            try {
                window.recaptchaVerifierPlans.clear();
                delete window.recaptchaVerifierPlans;
            } catch (error) {
                console.log('Error clearing existing verifier:', error);
            }
        }
        
        // Clear the container HTML
        const container = document.getElementById('recaptcha-container-plans');
        if (container) {
            container.innerHTML = '';
        }
        
        // Create new RecaptchaVerifier with proper configuration
        window.recaptchaVerifierPlans = new RecaptchaVerifier(auth, 'recaptcha-container-plans', {
            'size': 'invisible', // Use invisible for production
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber
                console.log('reCAPTCHA solved successfully', response);
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again
                setLoginMessage('reCAPTCHA expired. Please try again.');
                setLoginLoading(false);
            },
            'error-callback': (error) => {
                // Handle reCAPTCHA errors
                console.error('reCAPTCHA error:', error);
                setLoginMessage('reCAPTCHA error. Please try again.');
                setLoginLoading(false);
            }
        });
        
        return window.recaptchaVerifierPlans;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (!phoneNumber || phoneNumber.length !== 10) {
            setLoginMessage('Please enter a valid 10-digit phone number.');
            return;
        }

        setLoginLoading(true);
        setLoginMessage('Sending OTP...');

        try {
            // Setup reCAPTCHA verifier
            const appVerifier = setupRecaptcha();
            const auth = getAuth();
            
            // Format phone number with country code
            const formattedPhone = `+91${phoneNumber}`;
            
            console.log('Attempting to send OTP to:', formattedPhone);
            
            // Send OTP using Firebase Phone Authentication
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            
            // Store confirmation result for verification
            setConfirmationResult(confirmation);
            setShowOtpInput(true);
            setLoginMessage('OTP sent successfully! Please check your phone.');
            
            console.log('OTP sent successfully');
        } catch (error) {
            console.error('Error sending OTP:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            // Handle specific error cases
            let errorMessage = 'Failed to send OTP. ';
            
            switch (error.code) {
                case 'auth/invalid-phone-number':
                    errorMessage = 'Invalid phone number format. Please check and try again.';
                    break;
                case 'auth/missing-phone-number':
                    errorMessage = 'Phone number is required.';
                    break;
                case 'auth/quota-exceeded':
                    errorMessage = 'SMS quota exceeded. Please try again later.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This phone number has been disabled.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Phone authentication is not enabled. Please contact support.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many requests. Please try again after some time.';
                    break;
                case 'auth/invalid-app-credential':
                    errorMessage = 'Firebase Phone Auth is not properly configured. Please enable it in Firebase Console under Authentication > Sign-in method > Phone.';
                    break;
                case 'auth/captcha-check-failed':
                    errorMessage = 'reCAPTCHA verification failed. Please try again.';
                    break;
                default:
                    errorMessage += error.message || 'Please try again.';
            }
            
            setLoginMessage(errorMessage);
            
            // Reset reCAPTCHA verifier on error
            if (window.recaptchaVerifierPlans) {
                try {
                    window.recaptchaVerifierPlans.clear();
                } catch (clearError) {
                    console.log('Error clearing verifier:', clearError);
                }
                window.recaptchaVerifierPlans = null;
            }
        } finally {
            setLoginLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        // Validate OTP
        if (!otp || otp.length !== 6) {
            setLoginMessage('Please enter a valid 6-digit OTP.');
            return;
        }

        // Check if confirmation result exists
        if (!confirmationResult) {
            setLoginMessage('Session expired. Please request a new OTP.');
            setShowOtpInput(false);
            return;
        }

        setLoginLoading(true);
        setLoginMessage('Verifying OTP...');

        try {
            // Verify the OTP code
            const result = await confirmationResult.confirm(otp);
            const firebaseUser = result.user;
            
            console.log('User authenticated successfully:', firebaseUser.uid);
            console.log('Phone number:', firebaseUser.phoneNumber);
            
            // Create user data object - use the cleaned phone number without country code
            let cleanPhoneNumber = phoneNumber;
            if (firebaseUser.phoneNumber) {
                // Extract from Firebase phone number
                const fbPhone = firebaseUser.phoneNumber;
                if (fbPhone.startsWith('+91')) {
                    cleanPhoneNumber = fbPhone.substring(3);
                } else if (fbPhone.startsWith('91') && fbPhone.length === 12) {
                    cleanPhoneNumber = fbPhone.substring(2);
                }
            }
            
            const userData = {
                phoneNumber: cleanPhoneNumber,  // Store clean 10-digit number
                uid: firebaseUser.uid,
                fullPhoneNumber: firebaseUser.phoneNumber
            };
            
            console.log('SubscriptionPlans: Created userData:', userData);
            
            // Use AuthContext login if available
            if (login) {
                console.log('SubscriptionPlans: Calling login with userData');
                await login(userData);
                console.log('SubscriptionPlans: Login completed, checking localStorage...');
                console.log('SubscriptionPlans: localStorage matrimony_user:', localStorage.getItem('matrimony_user'));
            } else {
                // Fallback to localStorage
                console.log('SubscriptionPlans: No login function, saving to localStorage directly');
                localStorage.setItem('matrimony_user', JSON.stringify(userData));
            }
            
            setLoginMessage('Login successful!');
            
            // Close login modal and let parent handle subscription check
            setTimeout(() => {
                setShowLoginModal(false);
                setShowOtpInput(false);
                setPhoneNumber('');
                setOtp('');
                setLoginMessage('');
                setConfirmationResult(null);
                
                // Clear reCAPTCHA
                if (window.recaptchaVerifierPlans) {
                    try {
                        window.recaptchaVerifierPlans.clear();
                    } catch (error) {
                        console.log('Error clearing verifier:', error);
                    }
                    window.recaptchaVerifierPlans = null;
                }
                
                // Notify parent about login success
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
                
                // Force page reload to refresh auth state
                console.log('SubscriptionPlans: Reloading page to refresh auth state');
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            console.error('Error code:', error.code);
            
            // Handle specific verification errors
            let errorMessage = 'Failed to verify OTP. ';
            
            switch (error.code) {
                case 'auth/invalid-verification-code':
                    errorMessage = 'Invalid OTP. Please check and try again.';
                    break;
                case 'auth/code-expired':
                    errorMessage = 'OTP has expired. Please request a new one.';
                    setShowOtpInput(false);
                    setOtp('');
                    setConfirmationResult(null);
                    break;
                case 'auth/session-expired':
                    errorMessage = 'Session expired. Please request a new OTP.';
                    setShowOtpInput(false);
                    setOtp('');
                    setConfirmationResult(null);
                    break;
                case 'auth/invalid-verification-id':
                    errorMessage = 'Invalid session. Please request a new OTP.';
                    setShowOtpInput(false);
                    setOtp('');
                    setConfirmationResult(null);
                    break;
                default:
                    errorMessage += error.message || 'Please try again.';
            }
            
            setLoginMessage(errorMessage);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentScreenshot(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitPayment = async () => {
        if (!transactionId.trim()) {
            alert('Please enter transaction ID');
            return;
        }
        if (!paymentScreenshot) {
            alert('Please upload payment screenshot');
            return;
        }

        setUploading(true);
        try {
            const db = getDatabase();
            const paymentRef = push(ref(db, 'Matrimony/pendingPayments'));
            
            const paymentData = {
                userId: user.phoneNumber,
                phoneNumber: user.phoneNumber,
                planId: selectedPlan.id,
                planTitle: `${selectedPlan.nameMarathi} / ${selectedPlan.nameEnglish}`,
                amount: selectedPlan.price,
                validityDays: selectedPlan.validityDays,
                biodataLimit: selectedPlan.biodataLimit,
                transactionId: transactionId,
                paymentScreenshot: paymentScreenshot,
                submittedAt: Date.now(),
                status: 'pending'
            };

            await set(paymentRef, paymentData);
            
            alert(`Payment submitted successfully!\n\nYour payment will be verified within 2-4 hours.\n\nFor queries, contact: hrswrajyasangam@gmail.com`);
            
            setShowPaymentModal(false);
            setSelectedPlan(null);
            setTransactionId('');
            setPaymentScreenshot(null);
            
            if (onClose) onClose();
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert('Failed to submit payment. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.overlay}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading subscription plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <button onClick={onClose} style={styles.closeButton}>
                    <FaTimes />
                </button>

                {/* Check if user already has subscription */}
                {user && hasActiveSubscription && hasActiveSubscription() ? (
                    <div style={styles.header}>
                        <h1 style={styles.title}>✅ You Already Have an Active Subscription!</h1>
                        <p style={styles.subtitle}>You can unlock profiles now. Close this modal and try again.</p>
                        <button 
                            onClick={onClose}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '30px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '2rem'
                            }}
                        >
                            Close and Continue
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={styles.header}>
                            <h1 style={styles.title}>Choose Your Plan</h1>
                            <p style={styles.subtitle}>Select the perfect plan for your needs</p>
                        </div>

                <div style={styles.plansGrid}>
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            style={{
                                ...styles.planCard,
                                borderColor: plan.color,
                            }}
                        >
                            {plan.popular && (
                                <div style={{...styles.popularBadge, background: plan.color}}>
                                    Most Popular
                                </div>
                            )}
                            
                            <div style={{...styles.planIcon, color: plan.color, fontSize: '3rem'}}>
                                {plan.icon}
                            </div>
                            
                            <h3 style={styles.planTitle}>
                                {plan.nameMarathi} / {plan.nameEnglish}
                            </h3>
                            
                            <div style={styles.priceContainer}>
                                <span style={styles.discountedPrice}>₹{plan.price}</span>
                            </div>
                            
                            <div style={styles.features}>
                                <div style={styles.feature}>
                                    <FaCheck style={styles.checkIcon} />
                                    <span>वैधता / Validity: {plan.validityMonths} महिने / Months</span>
                                </div>
                                <div style={styles.feature}>
                                    <FaCheck style={styles.checkIcon} />
                                    <span>नंबर पहा / Number View: {plan.biodataLimit}</span>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                style={{
                                    ...styles.selectButton,
                                    background: plan.color,
                                }}
                            >
                                योजना निवडा / Select Plan
                            </button>
                        </div>
                    ))}
                </div>

                {/* Login Modal */}
                {showLoginModal && (
                    <div style={styles.paymentOverlay}>
                        <div style={styles.loginModal}>
                            <div id="recaptcha-container-plans"></div>
                            <button
                                onClick={() => {
                                    setShowLoginModal(false);
                                    setShowOtpInput(false);
                                    setPhoneNumber('');
                                    setOtp('');
                                    setLoginMessage('');
                                    if (window.recaptchaVerifierPlans) {
                                        window.recaptchaVerifierPlans.clear();
                                        window.recaptchaVerifierPlans = null;
                                    }
                                }}
                                style={styles.closeButton}
                            >
                                <FaTimes />
                            </button>

                            <h2 style={styles.loginTitle}>
                                {showOtpInput ? '🔐 Verify OTP' : '📱 Login to Continue'}
                            </h2>
                            <p style={styles.loginSubtitle}>
                                {showOtpInput 
                                    ? `Enter the OTP sent to +91${phoneNumber}` 
                                    : 'Enter your phone number to receive OTP'}
                            </p>

                            {!showOtpInput ? (
                                <form onSubmit={handleSendOtp} style={styles.loginForm}>
                                    <div style={styles.phoneInputContainer}>
                                        <span style={styles.countryCode}>+91</span>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            style={styles.phoneInput}
                                            placeholder="Enter 10-digit phone number"
                                            maxLength="10"
                                            disabled={loginLoading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loginLoading || phoneNumber.length !== 10}
                                        style={{
                                            ...styles.loginButton,
                                            opacity: (loginLoading || phoneNumber.length !== 10) ? 0.6 : 1,
                                            cursor: (loginLoading || phoneNumber.length !== 10) ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {loginLoading ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} style={styles.loginForm}>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        style={styles.otpInput}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                        disabled={loginLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loginLoading || otp.length !== 6}
                                        style={{
                                            ...styles.loginButton,
                                            opacity: (loginLoading || otp.length !== 6) ? 0.6 : 1,
                                            cursor: (loginLoading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {loginLoading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOtpInput(false);
                                            setOtp('');
                                            setLoginMessage('');
                                            if (window.recaptchaVerifierPlans) {
                                                window.recaptchaVerifierPlans.clear();
                                                window.recaptchaVerifierPlans = null;
                                            }
                                        }}
                                        style={styles.changeNumberButton}
                                    >
                                        Change Phone Number
                                    </button>
                                </form>
                            )}

                            {loginMessage && (
                                <div style={{
                                    ...styles.loginMessage,
                                    background: loginMessage.includes('success') ? '#d4edda' : '#f8d7da',
                                    color: loginMessage.includes('success') ? '#155724' : '#721c24',
                                    borderColor: loginMessage.includes('success') ? '#c3e6cb' : '#f5c6cb',
                                }}>
                                    {loginMessage}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && selectedPlan && (
                    <div style={styles.paymentOverlay}>
                        <div style={styles.paymentModal}>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSelectedPlan(null);
                                    setTransactionId('');
                                    setPaymentScreenshot(null);
                                }}
                                style={styles.closeButton}
                            >
                                <FaTimes />
                            </button>

                            <h2 style={styles.paymentTitle}>
                                <FaQrcode /> Complete Payment
                            </h2>

                            <div style={styles.planSummary}>
                                <h3>{selectedPlan.name}</h3>
                                <p style={styles.amount}>₹{selectedPlan.discountedPrice}</p>
                            </div>

                            {qrDetails && (
                                <div style={styles.qrSection}>
                                    <h4 style={styles.sectionTitle}>Scan QR Code to Pay</h4>
                                    {qrDetails.imageUrl && (
                                        <img
                                            src={qrDetails.imageUrl}
                                            alt="Payment QR Code"
                                            style={styles.qrImage}
                                        />
                                    )}
                                    <div style={styles.paymentDetails}>
                                        <p><strong>Bank Name:</strong> Indian Bank</p>
                                        <p><strong>Account Name:</strong> Atm Business Solutions</p>
                                        <p><strong>Account Number:</strong> 7625719979</p>
                                        <p><strong>IFSC Code:</strong> IDIB000A168</p>
                                        <p><strong>Account Type:</strong> Current Account</p>
                                    </div>
                                </div>
                            )}

                            <div style={styles.supportSection}>
                                <h4 style={styles.sectionTitle}>Support Contact</h4>
                                <div style={styles.supportInfo}>
                                    <p><FaEnvelope /> hrswrajyasangam@gmail.com</p>
                                    <p><FaClock /> 9:00 AM - 9:00 PM (Mon-Sat)</p>
                                </div>
                            </div>

                            <div style={styles.uploadSection}>
                                <h4 style={styles.sectionTitle}>Payment Proof</h4>
                                
                                <input
                                    type="text"
                                    placeholder="Enter Transaction ID"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    style={styles.input}
                                />

                                <div style={styles.fileUpload}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        id="screenshot-upload"
                                    />
                                    <label htmlFor="screenshot-upload" style={styles.uploadLabel}>
                                        <FaUpload /> Upload Payment Screenshot
                                    </label>
                                </div>

                                {paymentScreenshot && (
                                    <div style={styles.previewContainer}>
                                        <img
                                            src={paymentScreenshot}
                                            alt="Payment Screenshot"
                                            style={styles.previewImage}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmitPayment}
                                    disabled={uploading}
                                    style={{
                                        ...styles.submitButton,
                                        opacity: uploading ? 0.6 : 1,
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {uploading ? 'Submitting...' : 'Submit Payment'}
                                </button>

                                <p style={styles.note}>
                                    ⏱️ Your subscription will be activated within 2-4 hours after verification
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                    </>
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
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
    },
    container: {
        background: '#fff',
        borderRadius: '20px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative',
    },
    loadingContainer: {
        background: '#fff',
        padding: '3rem',
        borderRadius: '20px',
        textAlign: 'center',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #6a11cb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem',
    },
    closeButton: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: '#ef4444',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        zIndex: 10,
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#64748b',
    },
    plansGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginTop: '2rem',
    },
    planCard: {
        background: '#fff',
        border: '3px solid',
        borderRadius: '15px',
        padding: '2rem',
        position: 'relative',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
    popularBadge: {
        position: 'absolute',
        top: '-12px',
        right: '20px',
        color: '#fff',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    planIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    planTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#1e293b',
    },
    planDescription: {
        color: '#64748b',
        marginBottom: '1rem',
        fontSize: '0.95rem',
    },
    priceContainer: {
        marginBottom: '1.5rem',
    },
    originalPrice: {
        textDecoration: 'line-through',
        color: '#94a3b8',
        fontSize: '1.2rem',
        marginRight: '0.5rem',
    },
    discountedPrice: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1e293b',
    },
    features: {
        marginBottom: '1.5rem',
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        color: '#475569',
    },
    checkIcon: {
        color: '#10b981',
        fontSize: '1rem',
    },
    selectButton: {
        width: '100%',
        padding: '1rem',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    paymentOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '20px',
    },
    paymentModal: {
        background: '#fff',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative',
    },
    paymentTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    planSummary: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: '#fff',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    amount: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        margin: '0.5rem 0',
    },
    qrSection: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '10px',
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem',
    },
    qrImage: {
        maxWidth: '250px',
        height: 'auto',
        margin: '1rem auto',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
    },
    paymentDetails: {
        textAlign: 'left',
        marginTop: '1rem',
    },
    supportSection: {
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f0fdf4',
        borderRadius: '10px',
    },
    supportInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    uploadSection: {
        marginTop: '1.5rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        marginBottom: '1rem',
        boxSizing: 'border-box',
    },
    fileUpload: {
        marginBottom: '1rem',
    },
    uploadLabel: {
        display: 'inline-block',
        padding: '0.75rem 1.5rem',
        background: '#3b82f6',
        color: '#fff',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
    previewContainer: {
        marginBottom: '1rem',
        textAlign: 'center',
    },
    previewImage: {
        maxWidth: '100%',
        maxHeight: '200px',
        borderRadius: '10px',
        border: '2px solid #e2e8f0',
    },
    submitButton: {
        width: '100%',
        padding: '1rem',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginBottom: '1rem',
    },
    note: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.9rem',
        fontStyle: 'italic',
    },
    loginModal: {
        background: '#fff',
        borderRadius: '20px',
        maxWidth: '450px',
        width: '100%',
        padding: '2.5rem',
        position: 'relative',
    },
    loginTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    loginSubtitle: {
        fontSize: '1rem',
        color: '#64748b',
        marginBottom: '2rem',
        textAlign: 'center',
    },
    loginForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    phoneInputContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
    },
    countryCode: {
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        color: '#64748b',
        fontWeight: '600',
        borderRight: '2px solid #e2e8f0',
    },
    phoneInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: 'none',
        fontSize: '1rem',
        outline: 'none',
    },
    otpInput: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '1.2rem',
        textAlign: 'center',
        letterSpacing: '0.5rem',
        outline: 'none',
        boxSizing: 'border-box',
    },
    loginButton: {
        width: '100%',
        padding: '1rem',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    changeNumberButton: {
        width: '100%',
        padding: '0.75rem',
        background: 'none',
        color: '#6a11cb',
        border: '2px solid #6a11cb',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    loginMessage: {
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.9rem',
        border: '1px solid',
    },
    demoNotice: {
        background: '#fef3c7',
        border: '1px solid #fbbf24',
        color: '#92400e',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
};

export default SubscriptionPlans;
