import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [unlockedProfiles, setUnlockedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load user data from localStorage on mount
    useEffect(() => {
        console.log('AuthContext: Loading from localStorage...');
        const savedUser = localStorage.getItem('matrimony_user');
        const savedSubscription = localStorage.getItem('matrimony_subscription');
        const savedUnlocked = localStorage.getItem('matrimony_unlocked_profiles');

        console.log('AuthContext: savedUser from localStorage:', savedUser);
        console.log('AuthContext: savedSubscription from localStorage:', savedSubscription);

        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            console.log('AuthContext: Setting user from localStorage:', parsedUser);
            setUser(parsedUser);
        } else {
            console.log('AuthContext: No saved user in localStorage');
        }
        
        if (savedSubscription) {
            const parsedSubscription = JSON.parse(savedSubscription);
            console.log('AuthContext: Setting subscription from localStorage:', parsedSubscription);
            setSubscription(parsedSubscription);
        } else {
            console.log('AuthContext: No saved subscription in localStorage');
        }
        
        if (savedUnlocked) {
            setUnlockedProfiles(JSON.parse(savedUnlocked));
        }
        setLoading(false);
    }, []);

    // Login function (used by SubscriptionPlans after OTP verification)
    const login = async (userData) => {
        console.log('AuthContext: Login called with userData:', userData);
        setUser(userData);
        localStorage.setItem('matrimony_user', JSON.stringify(userData));

        // Fetch user's subscription from Firebase
        try {
            const { getDatabase, ref, get } = await import('firebase/database');
            const db = getDatabase();
            
            // Extract phone number without country code if present
            let phoneNumber = userData.phoneNumber;
            if (phoneNumber.startsWith('+91')) {
                phoneNumber = phoneNumber.substring(3); // Remove +91
            } else if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
                phoneNumber = phoneNumber.substring(2); // Remove 91
            }
            
            console.log('AuthContext: Original phone:', userData.phoneNumber);
            console.log('AuthContext: Cleaned phone:', phoneNumber);
            console.log('AuthContext: Fetching subscription for phone:', phoneNumber);
            
            // Try to fetch from primary location: Matrimony/users/{phone}/subscriptions
            const userSubsRef = ref(db, `Matrimony/users/${phoneNumber}/subscriptions`);
            const userSubsSnapshot = await get(userSubsRef);

            let activeSubscription = null;

            if (userSubsSnapshot.exists()) {
                const subscriptions = userSubsSnapshot.val();
                console.log('AuthContext: Found subscriptions in users node:', subscriptions);
                
                // Get the most recent active subscription
                activeSubscription = Object.values(subscriptions)
                    .filter(sub => {
                        const isActive = sub.status === 'active';
                        const notExpired = sub.endDate > Date.now();
                        console.log(`AuthContext: Checking subscription - status: ${sub.status}, isActive: ${isActive}, notExpired: ${notExpired}, endDate: ${new Date(sub.endDate)}`);
                        return isActive && notExpired;
                    })
                    .sort((a, b) => b.startDate - a.startDate)[0];
            } else {
                console.log('AuthContext: No subscriptions in users node, checking activeSubscriptions...');
                
                // Fallback: Check activeSubscriptions node
                const activeSubsRef = ref(db, `Matrimony/activeSubscriptions/user_${phoneNumber}`);
                const activeSubsSnapshot = await get(activeSubsRef);
                
                if (activeSubsSnapshot.exists()) {
                    const subData = activeSubsSnapshot.val();
                    console.log('AuthContext: Found subscription in activeSubscriptions node:', subData);
                    
                    // Check if it's active and not expired
                    if (subData.status === 'active' && subData.endDate > Date.now()) {
                        activeSubscription = subData;
                    }
                } else {
                    console.log('AuthContext: No subscription found in activeSubscriptions node either');
                }
            }

            if (activeSubscription) {
                setSubscription(activeSubscription);
                localStorage.setItem('matrimony_subscription', JSON.stringify(activeSubscription));
                console.log('AuthContext: Active subscription loaded:', activeSubscription);
            } else {
                console.log('AuthContext: No active subscription found');
                setSubscription(null);
                localStorage.removeItem('matrimony_subscription');
            }
        } catch (error) {
            console.error('AuthContext: Error fetching subscription:', error);
        }
    };

    // Reload subscription data from Firebase
    const reloadSubscription = async () => {
        if (!user) return;

        try {
            const { getDatabase, ref, get } = await import('firebase/database');
            const db = getDatabase();
            
            // Extract phone number without country code if present
            let phoneNumber = user.phoneNumber;
            if (phoneNumber.startsWith('+91')) {
                phoneNumber = phoneNumber.substring(3);
            } else if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
                phoneNumber = phoneNumber.substring(2);
            }
            
            console.log('AuthContext: Reloading subscription for phone:', phoneNumber);
            
            // Try to fetch from primary location: Matrimony/users/{phone}/subscriptions
            const userSubsRef = ref(db, `Matrimony/users/${phoneNumber}/subscriptions`);
            const userSubsSnapshot = await get(userSubsRef);

            let activeSubscription = null;

            if (userSubsSnapshot.exists()) {
                const subscriptions = userSubsSnapshot.val();
                console.log('AuthContext: Found subscriptions during reload:', subscriptions);
                
                // Get the most recent active subscription
                activeSubscription = Object.values(subscriptions)
                    .filter(sub => sub.status === 'active' && sub.endDate > Date.now())
                    .sort((a, b) => b.startDate - a.startDate)[0];
            } else {
                console.log('AuthContext: No subscriptions in users node, checking activeSubscriptions...');
                
                // Fallback: Check activeSubscriptions node
                const activeSubsRef = ref(db, `Matrimony/activeSubscriptions/user_${phoneNumber}`);
                const activeSubsSnapshot = await get(activeSubsRef);
                
                if (activeSubsSnapshot.exists()) {
                    const subData = activeSubsSnapshot.val();
                    console.log('AuthContext: Found subscription in activeSubscriptions during reload:', subData);
                    
                    if (subData.status === 'active' && subData.endDate > Date.now()) {
                        activeSubscription = subData;
                    }
                }
            }

            if (activeSubscription) {
                setSubscription(activeSubscription);
                localStorage.setItem('matrimony_subscription', JSON.stringify(activeSubscription));
                console.log('Subscription reloaded:', activeSubscription);
                return activeSubscription;
            }
            
            return null;
        } catch (error) {
            console.error('Error reloading subscription:', error);
            return null;
        }
    };

    // Dummy phone authentication
    const loginWithPhone = async (phoneNumber, otp) => {
        // Simulate API call
        return new Promise(async (resolve) => {
            setTimeout(async () => {
                // For demo: accept any 6-digit OTP
                if (otp && otp.length === 6) {
                    const userData = {
                        phoneNumber,
                        id: `user_${phoneNumber}`,
                        loginTime: new Date().toISOString()
                    };
                    setUser(userData);
                    localStorage.setItem('matrimony_user', JSON.stringify(userData));

                    // Fetch user's subscription from Firebase (new structure)
                    try {
                        const { getDatabase, ref, get } = await import('firebase/database');
                        const db = getDatabase();
                        
                        // Check new structure first: Matrimony/users/{phone}/subscriptions
                        const userSubsRef = ref(db, `Matrimony/users/${phoneNumber}/subscriptions`);
                        const userSubsSnapshot = await get(userSubsRef);

                        if (userSubsSnapshot.exists()) {
                            const subscriptions = userSubsSnapshot.val();
                            // Get the most recent active subscription
                            const activeSubscription = Object.values(subscriptions)
                                .filter(sub => sub.status === 'active' && sub.endDate > Date.now())
                                .sort((a, b) => b.startDate - a.startDate)[0];

                            if (activeSubscription) {
                                setSubscription(activeSubscription);
                                localStorage.setItem('matrimony_subscription', JSON.stringify(activeSubscription));
                            }
                        } else {
                            // Fallback to old structure
                            const subsRef = ref(db, `Matrimony/activeSubscriptions/${userData.id}`);
                            const subsSnapshot = await get(subsRef);

                            if (subsSnapshot.exists()) {
                                const subscriptionData = subsSnapshot.val();
                                setSubscription(subscriptionData);
                                localStorage.setItem('matrimony_subscription', JSON.stringify(subscriptionData));
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching subscription:', error);
                    }

                    resolve({ success: true, user: userData });
                } else {
                    resolve({ success: false, error: 'Invalid OTP' });
                }
            }, 1000);
        });
    };

    // Send OTP (dummy)
    const sendOTP = async (phoneNumber) => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`OTP sent to ${phoneNumber}: 123456 (dummy)`);
                resolve({ success: true, message: 'OTP sent successfully' });
            }, 1000);
        });
    };

    // Logout
    const logout = () => {
        setUser(null);
        setSubscription(null);
        setUnlockedProfiles([]);
        localStorage.removeItem('matrimony_user');
        localStorage.removeItem('matrimony_subscription');
        localStorage.removeItem('matrimony_unlocked_profiles');
    };

    // Purchase subscription
    const purchaseSubscription = (plan) => {
        const subscriptionData = {
            planId: plan.id,
            planTitle: plan.title,
            biodataLimit: plan.biodataLimit,
            remainingBiodata: plan.biodataLimit,
            validityDays: plan.validityDays,
            purchaseDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + plan.validityDays * 24 * 60 * 60 * 1000).toISOString(),
            price: plan.discountedPrice
        };
        setSubscription(subscriptionData);
        localStorage.setItem('matrimony_subscription', JSON.stringify(subscriptionData));
        return subscriptionData;
    };

    // Check if profile is unlocked
    const isProfileUnlocked = (profileId) => {
        return unlockedProfiles.includes(profileId);
    };

    // Unlock profile
    const unlockProfile = (profileId) => {
        if (!subscription) {
            return { success: false, error: 'No active subscription' };
        }

        // Check if using new structure
        if (subscription.startDate && subscription.endDate) {
            const now = Date.now();
            
            // Check if subscription is expired
            if (now > subscription.endDate) {
                return { success: false, error: 'Subscription expired' };
            }

            // Check if already unlocked
            if (unlockedProfiles.includes(profileId)) {
                return { success: true, alreadyUnlocked: true };
            }

            // Check if limit reached
            if (subscription.viewsUsed >= subscription.viewLimit) {
                return { success: false, error: 'Biodata limit reached' };
            }

            // Unlock profile
            const updatedUnlocked = [...unlockedProfiles, profileId];
            const updatedSubscription = {
                ...subscription,
                viewsUsed: subscription.viewsUsed + 1
            };

            setUnlockedProfiles(updatedUnlocked);
            setSubscription(updatedSubscription);
            localStorage.setItem('matrimony_unlocked_profiles', JSON.stringify(updatedUnlocked));
            localStorage.setItem('matrimony_subscription', JSON.stringify(updatedSubscription));

            // Update Firebase
            if (user) {
                import('firebase/database').then(({ getDatabase, ref, update }) => {
                    const db = getDatabase();
                    // Find the subscription ID and update viewsUsed
                    // This would need the subscription ID - for now just update localStorage
                    const userSubsRef = ref(db, `Matrimony/users/${user.phoneNumber}/subscriptions`);
                    // TODO: Update specific subscription viewsUsed in Firebase
                    console.log('Subscription update ref:', userSubsRef.toString());
                });
            }

            return { success: true, remainingBiodata: subscription.viewLimit - updatedSubscription.viewsUsed };
        }

        // Fallback to old structure
        const now = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        if (now > expiryDate) {
            return { success: false, error: 'Subscription expired' };
        }

        if (unlockedProfiles.includes(profileId)) {
            return { success: true, alreadyUnlocked: true };
        }

        if (subscription.remainingBiodata <= 0) {
            return { success: false, error: 'Biodata limit reached' };
        }

        const updatedUnlocked = [...unlockedProfiles, profileId];
        const updatedSubscription = {
            ...subscription,
            remainingBiodata: subscription.remainingBiodata - 1
        };

        setUnlockedProfiles(updatedUnlocked);
        setSubscription(updatedSubscription);
        localStorage.setItem('matrimony_unlocked_profiles', JSON.stringify(updatedUnlocked));
        localStorage.setItem('matrimony_subscription', JSON.stringify(updatedSubscription));

        return { success: true, remainingBiodata: updatedSubscription.remainingBiodata };
    };

    // Save unlocked profile data to Firebase
    const saveUnlockedProfileToFirebase = async (profileId, profileData) => {
        if (!user) return { success: false, error: 'User not logged in' };

        try {
            // Import Firebase functions
            const { getDatabase, ref, set } = await import('firebase/database');
            const db = getDatabase();
            
            // Use phoneNumber as user identifier
            const userId = user.phoneNumber || user.uid;
            
            // Save to Firebase under user's unlocked profiles
            const unlockedRef = ref(db, `Matrimony/unlockedProfiles/${userId}/${profileId}`);
            await set(unlockedRef, {
                ...profileData,
                unlockedAt: new Date().toISOString(),
                userId: userId
            });

            return { success: true };
        } catch (error) {
            console.error('Error saving unlocked profile:', error);
            return { success: false, error: error.message };
        }
    };

    // Fetch unlocked profiles from Firebase
    const fetchUnlockedProfilesFromFirebase = async () => {
        if (!user) return [];

        try {
            const { getDatabase, ref, get } = await import('firebase/database');
            const db = getDatabase();
            
            const userId = user.phoneNumber || user.uid;
            const unlockedRef = ref(db, `Matrimony/unlockedProfiles/${userId}`);
            const snapshot = await get(unlockedRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Object.entries(data).map(([id, profile]) => ({
                    id,
                    ...profile
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching unlocked profiles:', error);
            return [];
        }
    };

    // Check if subscription is active
    const hasActiveSubscription = () => {
        console.log('AuthContext: hasActiveSubscription called, subscription:', subscription);
        
        if (!subscription) {
            console.log('AuthContext: No subscription object');
            return false;
        }
        
        // Check if using new structure (with startDate/endDate as timestamps)
        if (subscription.startDate && subscription.endDate) {
            const now = Date.now();
            const isNotExpired = now <= subscription.endDate;
            const hasViews = (subscription.viewsUsed || 0) < subscription.viewLimit;
            const isActive = subscription.status === 'active';
            
            console.log('AuthContext: Subscription check:', {
                isActive,
                isNotExpired,
                hasViews,
                now,
                endDate: subscription.endDate,
                endDateFormatted: new Date(subscription.endDate),
                viewsUsed: subscription.viewsUsed,
                viewLimit: subscription.viewLimit,
                status: subscription.status
            });
            
            const result = isActive && isNotExpired && hasViews;
            console.log('AuthContext: hasActiveSubscription result:', result);
            return result;
        }
        
        // Fallback to old structure
        const now = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        console.log('AuthContext: Using old structure, expiryDate:', expiryDate);
        return now <= expiryDate && subscription.remainingBiodata > 0;
    };

    const value = {
        user,
        subscription,
        unlockedProfiles,
        loading,
        login,
        loginWithPhone,
        sendOTP,
        logout,
        purchaseSubscription,
        isProfileUnlocked,
        unlockProfile,
        hasActiveSubscription,
        reloadSubscription,
        saveUnlockedProfileToFirebase,
        fetchUnlockedProfilesFromFirebase
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
