import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUnlock, FaBars, FaTimes, FaGraduationCap, FaBriefcase, FaPhone, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UnlockedProfiles = () => {
    const navigate = useNavigate();
    const { user, logout, fetchUnlockedProfilesFromFirebase, subscription } = useAuth();
    const [unlockedProfiles, setUnlockedProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/user-home');
            return;
        }

        // Fetch unlocked profiles
        const loadUnlockedProfiles = async () => {
            setLoading(true);
            const profiles = await fetchUnlockedProfilesFromFirebase();
            setUnlockedProfiles(profiles);
            setLoading(false);
        };

        loadUnlockedProfiles();
    }, [user, navigate, fetchUnlockedProfilesFromFirebase]);

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

    const handleViewProfile = (profileId) => {
        navigate(`/user/${profileId}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    return (
        <div style={styles.container}>
            {/* Navigation Header */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#1e293b',
                padding: '0.75rem 0',
                position: 'sticky',
                top: 0,
                width: '100%',
                zIndex: 1000,
                boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 1rem'
                }}>
                    {/* Logo and Website Name */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: window.innerWidth > 768 ? '1rem' : '0.5rem',
                        flex: 1
                    }}>
                        <img 
                            src={require('../../assets/img1.jpeg')} 
                            alt="Swrajya Sangam Logo" 
                            style={{ 
                                width: window.innerWidth > 768 ? '50px' : '40px', 
                                height: window.innerWidth > 768 ? '50px' : '40px', 
                                borderRadius: window.innerWidth > 768 ? '10px' : '8px',
                                objectFit: 'cover',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                flexShrink: 0
                            }} 
                        />
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ 
                                margin: 0, 
                                fontSize: window.innerWidth > 768 ? '1.8rem' : '1.1rem', 
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                Swrajya Sangam
                            </h1>
                            {window.innerWidth > 768 && (
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.85rem',
                                    color: '#64748b',
                                    fontWeight: '500'
                                }}>
                                    My Unlocked Profiles
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav style={{ 
                        display: window.innerWidth > 768 ? 'flex' : 'none',
                        gap: '1rem', 
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={() => navigate('/user-home')}
                            style={{
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(106, 17, 203, 0.3)',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(106, 17, 203, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(106, 17, 203, 0.3)';
                            }}
                        >
                            Browse Profiles
                        </button>
                        {user && (
                            <>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '12px',
                                    border: '2px solid #0ea5e9'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>📱</span>
                                    <span style={{ 
                                        color: '#0c4a6e', 
                                        fontSize: '0.95rem',
                                        fontWeight: '600'
                                    }}>
                                        {user.phoneNumber}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to logout?')) {
                                            logout();
                                            navigate('/user-home');
                                        }
                                    }}
                                    style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Mobile: Browse Button + Menu */}
                    <div style={{
                        display: window.innerWidth <= 768 ? 'flex' : 'none',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={() => navigate('/user-home')}
                            style={{
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.6rem 1rem',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(106, 17, 203, 0.3)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Browse
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                padding: '0.6rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(106, 17, 203, 0.3)',
                                minWidth: '40px',
                                minHeight: '40px'
                            }}
                        >
                            {isMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        animation: 'slideDown 0.3s ease'
                    }}>
                        {user && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to logout?')) {
                                        logout();
                                        setIsMenuOpen(false);
                                        navigate('/user-home');
                                    }
                                }}
                                style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.9rem',
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                Logout
                            </button>
                        )}
                    </div>
                )}
            </header>

            <div style={styles.content}>
                {/* Subscription Info */}
                {subscription && (
                    <div style={styles.subscriptionBanner}>
                        <div style={styles.subscriptionInfo}>
                            <FaUnlock style={styles.subscriptionIcon} />
                            <div>
                                <h3 style={styles.subscriptionTitle}>Active Subscription</h3>
                                <p style={styles.subscriptionText}>
                                    {subscription.remainingBiodata} of {subscription.biodataLimit} profiles remaining
                                </p>
                            </div>
                        </div>
                        <div style={styles.subscriptionExpiry}>
                            Valid until: {formatDate(subscription.expiryDate)}
                        </div>
                    </div>
                )}

                {/* Page Title */}
                <div style={styles.pageHeader}>
                    <h2 style={styles.pageTitle}>My Unlocked Profiles</h2>
                    <p style={styles.pageSubtitle}>
                        {unlockedProfiles.length} profile{unlockedProfiles.length !== 1 ? 's' : ''} unlocked
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>Loading your unlocked profiles...</p>
                    </div>
                ) : unlockedProfiles.length === 0 ? (
                    /* Empty State */
                    <div style={styles.emptyState}>
                        <FaLock style={styles.emptyIcon} />
                        <h3 style={styles.emptyTitle}>No Unlocked Profiles Yet</h3>
                        <p style={styles.emptyText}>
                            Browse profiles and unlock them to view complete details including contact information and biodata.
                        </p>
                        <button
                            onClick={() => navigate('/user-home')}
                            style={styles.browseButton}
                        >
                            Browse Profiles
                        </button>
                    </div>
                ) : (
                    /* Profiles Grid */
                    <div style={styles.profilesGrid}>
                        {unlockedProfiles.map((profile) => {
                            const personal = profile.personal || {};
                            const educational = profile.educational || {};
                            const contact = profile.contact || {};
                            
                            const fullName = [personal.firstName, personal.middleName, personal.lastName]
                                .filter(Boolean)
                                .join(" ");
                            
                            const age = personal.dateOfBirth ? calculateAge(personal.dateOfBirth) : "Not specified";
                            
                            let photo = null;
                            if (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0) {
                                const validPhotos = profile.photos.filter(photoUrl =>
                                    photoUrl && typeof photoUrl === 'string' && isImageUrl(photoUrl)
                                );
                                if (validPhotos.length > 0) {
                                    photo = validPhotos[0];
                                }
                            }

                            return (
                                <div
                                    key={profile.id}
                                    style={styles.profileCard}
                                    onClick={() => handleViewProfile(profile.id)}
                                >
                                    {/* Unlocked Badge */}
                                    <div style={styles.unlockedBadge}>
                                        <FaUnlock style={{ marginRight: '0.3rem' }} />
                                        Unlocked
                                    </div>

                                    {/* Profile Image */}
                                    <div style={styles.profileImage}>
                                        {photo ? (
                                            <img src={photo} alt={fullName} style={styles.image} />
                                        ) : (
                                            <div style={styles.placeholderImage}>
                                                <FaUser style={{ fontSize: '4rem', color: '#64748b' }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Profile Details */}
                                    <div style={styles.profileDetails}>
                                        <h3 style={styles.profileName}>{fullName || "Name not provided"}</h3>
                                        
                                        <div style={styles.profileInfo}>
                                            <div style={styles.infoItem}>
                                                <span style={styles.infoLabel}>Age:</span>
                                                <span>{age}</span>
                                            </div>
                                            <div style={styles.infoItem}>
                                                <span style={styles.infoLabel}>Caste:</span>
                                                <span>{personal.caste || "Not specified"}</span>
                                            </div>
                                        </div>

                                        <div style={styles.profileInfo}>
                                            <div style={styles.infoItem}>
                                                <FaGraduationCap style={styles.infoIcon} />
                                                <span>{educational.education || "Not specified"}</span>
                                            </div>
                                            <div style={styles.infoItem}>
                                                <FaBriefcase style={styles.infoIcon} />
                                                <span>{educational.profession || "Not specified"}</span>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div style={styles.contactSection}>
                                            <div style={styles.contactItem}>
                                                <FaPhone style={styles.contactIcon} />
                                                <span>{personal.phoneNumber || contact.callingNumber || "Not provided"}</span>
                                            </div>
                                            <div style={styles.contactItem}>
                                                <FaMapMarkerAlt style={styles.contactIcon} />
                                                <span>{educational.currentPlace || educational.district || "Not specified"}</span>
                                            </div>
                                        </div>

                                        <div style={styles.unlockedDate}>
                                            Unlocked on: {formatDate(profile.unlockedAt)}
                                        </div>

                                        <button style={styles.viewButton}>
                                            View Full Profile
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
    },
    header: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 1000,
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    },
    headerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    backButton: {
        display: 'flex',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none'
    },
    headerTitle: {
        margin: 0,
        fontSize: '2rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    nav: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
    },
    navButton: {
        background: 'none',
        border: 'none',
        color: '#64748b',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
    },
    activeNavButton: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white'
    },
    logoutButton: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem 2rem'
    },
    subscriptionBanner: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '15px',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
    },
    subscriptionInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    subscriptionIcon: {
        fontSize: '2.5rem'
    },
    subscriptionTitle: {
        margin: '0 0 0.25rem 0',
        fontSize: '1.2rem',
        fontWeight: 'bold'
    },
    subscriptionText: {
        margin: 0,
        fontSize: '1rem',
        opacity: 0.9
    },
    subscriptionExpiry: {
        fontSize: '0.95rem',
        opacity: 0.9
    },
    pageHeader: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    pageTitle: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '0.5rem'
    },
    pageSubtitle: {
        color: '#64748b',
        fontSize: '1.1rem'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
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
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    },
    emptyIcon: {
        fontSize: '5rem',
        color: '#cbd5e1',
        marginBottom: '1.5rem'
    },
    emptyTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem'
    },
    emptyText: {
        fontSize: '1.1rem',
        color: '#64748b',
        marginBottom: '2rem',
        maxWidth: '600px',
        margin: '0 auto 2rem'
    },
    browseButton: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '25px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    profilesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem'
    },
    profileCard: {
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        border: '2px solid #10b981'
    },
    unlockedBadge: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: '#10b981',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1,
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
    },
    profileImage: {
        height: '350px',
        position: 'relative',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center top'
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    profileDetails: {
        padding: '1.5rem'
    },
    profileName: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem'
    },
    profileInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#64748b',
        fontSize: '0.95rem'
    },
    infoLabel: {
        fontWeight: '600',
        color: '#1e293b'
    },
    infoIcon: {
        color: '#6a11cb',
        fontSize: '1rem'
    },
    contactSection: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        padding: '1rem',
        borderRadius: '10px',
        marginBottom: '1rem'
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#166534',
        fontSize: '0.95rem',
        marginBottom: '0.5rem',
        fontWeight: '600'
    },
    contactIcon: {
        color: '#10b981',
        fontSize: '1rem'
    },
    unlockedDate: {
        fontSize: '0.85rem',
        color: '#94a3b8',
        marginBottom: '1rem',
        fontStyle: 'italic'
    },
    viewButton: {
        width: '100%',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    }
};

export default UnlockedProfiles;
