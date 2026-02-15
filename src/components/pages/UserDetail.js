import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { FaArrowLeft, FaUser, FaGraduationCap, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaTimes, FaLock, FaUnlock, FaCrown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import LoginModal from './LoginModal';
import SubscriptionPlans from './SubscriptionPlans';

function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser, isProfileUnlocked, unlockProfile, hasActiveSubscription, saveUnlockedProfileToFirebase, logout, reloadSubscription } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const hasReloadedSubscription = useRef(false); // Track if we've already reloaded

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const db = getDatabase();
                const userRef = ref(db, `Matrimony/users/${id}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    setUser(snapshot.val());
                    // Check if profile is unlocked
                    setIsUnlocked(isProfileUnlocked(id));
                } else {
                    console.log("User not found");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
        
        // Reload subscription data when component mounts - only once
        if (authUser && reloadSubscription && !hasReloadedSubscription.current) {
            console.log('UserDetail: Reloading subscription (first time only)');
            hasReloadedSubscription.current = true;
            reloadSubscription();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isProfileUnlocked]); // authUser and reloadSubscription intentionally excluded to prevent infinite loop

    const handleUnlockProfile = async () => {
        console.log('=== UNLOCK PROFILE CLICKED ===');
        console.log('authUser:', authUser);
        
        // Check if user is logged in
        if (!authUser) {
            console.log('No user logged in, showing login modal');
            setShowLoginModal(true);
            return;
        }

        console.log('User is logged in, checking subscription...');
        console.log('Calling hasActiveSubscription()...');
        
        // Check if user has active subscription
        const hasSubscription = hasActiveSubscription();
        console.log('hasActiveSubscription() returned:', hasSubscription);
        console.log('Type:', typeof hasSubscription);
        
        if (!hasSubscription) {
            console.log('No active subscription, showing subscription modal');
            setShowSubscriptionModal(true);
            return;
        }

        console.log('User has active subscription! Proceeding to unlock...');
        
        // Unlock the profile
        const result = unlockProfile(id);
        console.log('Unlock result:', result);
        
        if (result.success) {
            setIsUnlocked(true);
            
            // Save unlocked profile data to Firebase
            if (!result.alreadyUnlocked && user) {
                const personal = user.personal || {};
                const educational = user.educational || {};
                const contact = user.contact || {};
                
                const profileData = {
                    personal,
                    educational,
                    contact,
                    photos: user.photos || [],
                    biodata: user.biodata || null,
                    unlockedAt: new Date().toISOString()
                };
                
                await saveUnlockedProfileToFirebase(id, profileData);
                alert(`Profile unlocked! You have ${result.remainingBiodata} biodata views remaining.`);
            }
        } else {
            alert(result.error || 'Failed to unlock profile');
            if (result.error === 'Biodata limit reached' || result.error === 'Subscription expired') {
                setShowSubscriptionModal(true);
            }
        }
    };

    const handleLoginSuccess = async () => {
        // After login, reload subscription and wait for it
        console.log('UserDetail: Login successful, reloading subscription...');
        
        if (reloadSubscription) {
            await reloadSubscription();
            // Wait a bit for state to update
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Check if user has subscription
        const hasSubscription = hasActiveSubscription();
        console.log('UserDetail: After reload, hasActiveSubscription:', hasSubscription);
        
        if (!hasSubscription) {
            console.log('UserDetail: No subscription, showing subscription modal');
            setShowSubscriptionModal(true);
        } else {
            console.log('UserDetail: Has subscription, closing modals');
            setShowLoginModal(false);
        }
    };

    const handlePurchaseSuccess = (subscription) => {
        alert(`Subscription activated! You can now view ${subscription.biodataLimit} profiles.`);
    };

    const calculateAge = (dob) => {
        if (!dob) return "Not specified";
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const isImageUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const lowerUrl = url.toLowerCase();
        return (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) &&
            imageExtensions.some(ext => lowerUrl.includes(ext));
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={styles.errorContainer}>
                <h2>User not found</h2>
                <button 
                    onClick={() => {
                        sessionStorage.setItem('returningFromDetail', 'true');
                        navigate('/user-home');
                    }} 
                    style={styles.backButton}
                >
                    <FaArrowLeft /> Back to Profiles
                </button>
            </div>
        );
    }

    const personal = user.personal || {};
    const educational = user.educational || {};
    const contact = user.contact || {};
    const fullName = [personal.firstName, personal.middleName, personal.lastName].filter(Boolean).join(" ");

    // Get valid photos
    const validPhotos = user.photos ? user.photos.filter(photo => photo && isImageUrl(photo)) : [];

    // Handle image click
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // Close image modal
    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    return (
        <div style={styles.container}>
            {/* Header with Back Button */}
            <header style={styles.header}>
                <button 
                    onClick={() => {
                        sessionStorage.setItem('returningFromDetail', 'true');
                        navigate('/user-home');
                    }} 
                    style={styles.backButton}
                >
                    <FaArrowLeft /> Back
                </button>
                
                {authUser && (
                    <div style={styles.userInfo}>
                        <span style={styles.phoneNumber}>📱 {authUser.phoneNumber}</span>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to logout?')) {
                                    logout();
                                    navigate('/user-home');
                                }
                            }}
                            style={styles.logoutButton}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </header>

            {/* Profile Header */}
            <div style={styles.profileHeader}>
                <div style={styles.profileImageContainer}>
                    {validPhotos.length > 0 ? (
                        <img
                            src={validPhotos[0]}
                            alt="User avatar"
                            style={styles.profileImage}
                            onClick={() => handleImageClick(validPhotos[0])}
                        />
                    ) : (
                        <div style={styles.placeholderImage}>
                            <FaUser style={{ fontSize: '4rem', color: '#64748b' }} />
                        </div>
                    )}
                </div>
                <div style={styles.profileInfo}>
                    <h1 style={styles.name}>{fullName || "Name not provided"}</h1>
                    <div style={styles.basicInfo}>
                        <div style={styles.infoItem}>
                            <FaCalendarAlt style={styles.icon} />
                            <span>{calculateAge(personal.dateOfBirth)} years old</span>
                        </div>
                        <div style={styles.infoItem}>
                            <FaMapMarkerAlt style={styles.icon} />
                            <span>{educational.currentPlace || educational.district || "Location not specified"}</span>
                        </div>
                        <div style={styles.infoItem}>
                            <FaUser style={styles.icon} />
                            <span>{personal.gender || "Not specified"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Sections */}
            <div style={styles.sectionsContainer}>
                {/* Unlock Section - Show if not unlocked */}
                {!isUnlocked && (
                    <div style={styles.lockedSection}>
                        <div style={styles.lockedIcon}>
                            <FaLock style={{ fontSize: '3rem', color: '#f59e0b' }} />
                        </div>
                        <h2 style={styles.lockedTitle}>Unlock Complete Profile</h2>
                        <p style={styles.lockedDescription}>
                            Get access to complete contact details, address, and biodata document
                        </p>
                        <div style={styles.lockedFeatures}>
                            <div style={styles.lockedFeature}>
                                <FaPhone style={styles.lockedFeatureIcon} />
                                <span>Contact Numbers</span>
                            </div>
                            <div style={styles.lockedFeature}>
                                <FaMapMarkerAlt style={styles.lockedFeatureIcon} />
                                <span>Full Address</span>
                            </div>
                            <div style={styles.lockedFeature}>
                                <FaCrown style={styles.lockedFeatureIcon} />
                                <span>Biodata Document</span>
                            </div>
                        </div>
                        <button onClick={handleUnlockProfile} style={styles.unlockButton}>
                            <FaUnlock style={{ marginRight: '0.5rem' }} />
                            Unlock Profile Now
                        </button>
                    </div>
                )}

                {/* Personal Details */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FaUser style={styles.sectionIcon} />
                        Personal Information
                    </h2>
                    <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                            <strong>Full Name:</strong>
                            <span>{fullName || "Not provided"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Date of Birth:</strong>
                            <span>{personal.dateOfBirth || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Birth Time:</strong>
                            <span>{personal.birthTime || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Age:</strong>
                            <span>{calculateAge(personal.dateOfBirth)} years</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Height:</strong>
                            <span>
                                {personal.heightFeet && personal.heightInches 
                                    ? `${personal.heightFeet}' ${personal.heightInches}"` 
                                    : "Not specified"}
                            </span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Gender:</strong>
                            <span>{personal.gender || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Marital Status:</strong>
                            <span>{personal.maritalStatus || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Religion:</strong>
                            <span>{personal.religion || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Caste:</strong>
                            <span>{personal.caste || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Inter-Caste Marriage:</strong>
                            <span>{personal.interCasteAllowed || "Not specified"}</span>
                        </div>
                    </div>
                </div>

                {/* Educational & Professional Details */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FaGraduationCap style={styles.sectionIcon} />
                        Education & Career
                    </h2>
                    <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                            <strong>Education:</strong>
                            <span>{educational.education || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Profession:</strong>
                            <span>{educational.profession || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Current Place:</strong>
                            <span>{educational.currentPlace || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Native Place:</strong>
                            <span>{educational.nativePlace || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Taluka:</strong>
                            <span>{educational.taluka || "Not specified"}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <strong>District:</strong>
                            <span>{educational.district || "Not specified"}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Details - Locked/Unlocked */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FaPhone style={styles.sectionIcon} />
                        Contact Information
                        {!isUnlocked && <FaLock style={{ marginLeft: '0.5rem', fontSize: '1.2rem', color: '#f59e0b' }} />}
                    </h2>
                    {isUnlocked ? (
                        <div style={styles.detailsGrid}>
                            <div style={styles.detailItem}>
                                <strong>Phone Number:</strong>
                                <span>{personal.phoneNumber || "Not provided"}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <strong>WhatsApp Number:</strong>
                                <span>{contact.whatsappNumber || "Not provided"}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <strong>Calling Number:</strong>
                                <span>{contact.callingNumber || "Not provided"}</span>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.blurredContent}>
                            <div style={styles.blurredText}>
                                <FaLock style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                                <p>Contact details are locked</p>
                                <button onClick={handleUnlockProfile} style={styles.unlockButtonSmall}>
                                    Unlock to View
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Photos Gallery */}
                {validPhotos.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            📸 Photo Gallery
                        </h2>
                        <div style={styles.photoGallery}>
                            {validPhotos.map((photo, index) => (
                                <div key={index} style={styles.photoContainer}>
                                    <img 
                                        src={photo} 
                                        alt={`User ${index + 1}`} 
                                        style={styles.photo}
                                        onClick={() => handleImageClick(photo)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Biodata - Locked/Unlocked */}
                {user.biodata && isImageUrl(user.biodata) && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            📄 Biodata
                            {!isUnlocked && <FaLock style={{ marginLeft: '0.5rem', fontSize: '1.2rem', color: '#f59e0b' }} />}
                        </h2>
                        {isUnlocked ? (
                            <div style={styles.biodataContainer}>
                                <img 
                                    src={user.biodata} 
                                    alt="User document" 
                                    style={styles.biodataImage}
                                    onClick={() => handleImageClick(user.biodata)}
                                />
                            </div>
                        ) : (
                            <div style={styles.blurredContent}>
                                <div style={styles.blurredText}>
                                    <FaLock style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                                    <p>Biodata document is locked</p>
                                    <button onClick={handleUnlockProfile} style={styles.unlockButtonSmall}>
                                        Unlock to View
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />
            {/* Only show subscription modal if user doesn't have active subscription */}
            {showSubscriptionModal && (!hasActiveSubscription || !hasActiveSubscription()) && (
                <SubscriptionPlans 
                    isOpen={showSubscriptionModal} 
                    onClose={() => setShowSubscriptionModal(false)}
                    onPurchaseSuccess={handlePurchaseSuccess}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}

            {/* Image Modal */}
            {showImageModal && selectedImage && (
                <div style={styles.imageModalOverlay} onClick={closeImageModal}>
                    <div style={styles.imageModalContainer} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closeImageModal}
                            style={styles.imageModalCloseButton}
                            onMouseOver={(e) => {
                                e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                                e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            <FaTimes style={{ fontSize: '1.5rem' }} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Enlarged view"
                            style={styles.imageModalImage}
                        />
                        <div style={styles.imageModalControls}>
                            <button
                                onClick={() => window.open(selectedImage, '_blank')}
                                style={styles.imageModalButton}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(106, 17, 203, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                Open in New Tab
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #6a11cb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
    },
    loadingText: {
        fontSize: '1.2rem',
        color: '#64748b',
        fontWeight: '600'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        textAlign: 'center'
    },
    header: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: window.innerWidth > 768 ? '1rem 2rem' : '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        flexWrap: 'wrap',
        gap: '0.75rem'
    },
    backButton: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: window.innerWidth > 768 ? '0.75rem 1.5rem' : '0.6rem 1rem',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: window.innerWidth > 768 ? '1rem' : '0.85rem',
        transition: 'all 0.3s ease'
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
        fontWeight: 'bold',
        color: '#1e293b'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap'
    },
    phoneNumber: {
        color: '#64748b',
        fontSize: window.innerWidth > 768 ? '0.95rem' : '0.8rem',
        fontWeight: '600'
    },
    logoutButton: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        padding: window.innerWidth > 768 ? '0.5rem 1rem' : '0.5rem 0.75rem',
        borderRadius: '20px',
        fontWeight: '600',
        fontSize: window.innerWidth > 768 ? '0.95rem' : '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    profileHeader: {
        background: 'white',
        margin: '2rem',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    profileImageContainer: {
        position: 'relative'
    },
    profileImage: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        objectPosition: 'center center',
        border: '4px solid #6a11cb',
        boxShadow: '0 8px 25px rgba(106, 17, 203, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    placeholderImage: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid #6a11cb'
    },
    profileInfo: {
        flex: 1,
        minWidth: '300px'
    },
    name: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        margin: '0 0 1rem 0',
        color: '#1e293b',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    basicInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.1rem',
        color: '#64748b'
    },
    icon: {
        color: '#6a11cb',
        fontSize: '1.2rem'
    },
    sectionsContainer: {
        padding: '0 2rem 2rem'
    },
    section: {
        background: 'white',
        margin: '2rem 0',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
    },
    sectionIcon: {
        color: '#6a11cb',
        fontSize: '1.5rem'
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
    },
    photoGallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.5rem'
    },
    photoContainer: {
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
    },
    photo: {
        width: '100%',
        height: '350px',
        objectFit: 'cover',
        objectPosition: 'center top',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderRadius: '15px',
        backgroundColor: '#f8fafc'
    },
    biodataContainer: {
        display: 'flex',
        justifyContent: 'center'
    },
    biodataImage: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '15px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    imageModalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '2rem'
    },
    imageModalContainer: {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        background: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    imageModalCloseButton: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        transition: 'all 0.3s ease'
    },
    imageModalImage: {
        width: '100%',
        height: 'auto',
        maxHeight: '80vh',
        objectFit: 'contain',
        display: 'block'
    },
    imageModalControls: {
        padding: '1rem',
        background: 'white',
        display: 'flex',
        justifyContent: 'center'
    },
    imageModalButton: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'all 0.3s ease'
    },
    lockedSection: {
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        margin: '2rem 0',
        padding: '3rem 2rem',
        borderRadius: '20px',
        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)',
        textAlign: 'center',
        border: '2px solid #f59e0b'
    },
    lockedIcon: {
        marginBottom: '1.5rem'
    },
    lockedTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: '1rem'
    },
    lockedDescription: {
        fontSize: '1.1rem',
        color: '#78350f',
        marginBottom: '2rem'
    },
    lockedFeatures: {
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    },
    lockedFeature: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#92400e',
        fontSize: '1rem',
        fontWeight: '600'
    },
    lockedFeatureIcon: {
        fontSize: '2rem',
        color: '#f59e0b'
    },
    unlockButton: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        border: 'none',
        padding: '1rem 2.5rem',
        borderRadius: '25px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
    },
    blurredContent: {
        position: 'relative',
        minHeight: '200px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
    },
    blurredText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: '1.1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
    },
    unlockButtonSmall: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '25px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    }
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .photo-hover:hover {
        transform: scale(1.05);
    }
    
    .biodata-hover:hover {
        transform: scale(1.02);
    }
`;
document.head.appendChild(styleSheet);

export default UserDetail;