import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, query, orderByKey, limitToLast, endBefore, remove } from "firebase/database";
import { FaGraduationCap, FaBriefcase, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Global cache to persist data across component unmounts
let globalProfilesCache = null;
let globalCacheTimestamp = null;
let globalLastKey = null; // Track last loaded key for pagination
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 300; // Load 300 users at a time

const HomePage = () => {
    const navigate = useNavigate();
    const [allProfiles, setAllProfiles] = useState([]);
    const [currentPageProfiles, setCurrentPageProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [fakeUserCount, setFakeUserCount] = useState(0); // Fake count for display
    const [hasMoreData, setHasMoreData] = useState(true); // Track if more data available
    const profilesPerPage = 30; // 30 profiles per page
    const hasInitialized = useRef(false);

    // Helper function to calculate age
    const calculateAge = useCallback((dob) => {
        if (!dob) return null;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }, []);

    // Helper function to check if URL is a valid image
    const isImageUrl = useCallback((url) => {
        if (!url || typeof url !== 'string') return false;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const lowerUrl = url.toLowerCase();
        return (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) &&
            imageExtensions.some(ext => lowerUrl.includes(ext));
    }, []);

    // Check if global cache is valid
    const isCacheValid = useCallback(() => {
        if (!globalProfilesCache || !globalCacheTimestamp) return false;
        const cacheAge = Date.now() - globalCacheTimestamp;
        return cacheAge < CACHE_DURATION;
    }, []);

    // Generate fake user count between 112000-117000
    const generateFakeCount = useCallback(() => {
        return Math.floor(Math.random() * (117000 - 112000 + 1)) + 112000;
    }, []);

    // Fetch users from Firebase - load in batches of 300
    const fetchUsers = useCallback(async (loadMore = false) => {
        try {
            setLoading(true);
            const db = getDatabase();
            
            let usersQuery;
            if (loadMore && globalLastKey) {
                // Load next batch before the last key
                usersQuery = query(
                    ref(db, "Matrimony/users"), 
                    orderByKey(), 
                    endBefore(globalLastKey),
                    limitToLast(BATCH_SIZE)
                );
            } else {
                // Initial load - get latest 300 users
                usersQuery = query(
                    ref(db, "Matrimony/users"), 
                    orderByKey(), 
                    limitToLast(BATCH_SIZE)
                );
            }
            
            const snapshot = await get(usersQuery);
            
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const userEntries = Object.entries(usersData);
                
                // Store the first key for next batch
                if (userEntries.length > 0) {
                    globalLastKey = userEntries[0][0];
                }

                const processedUsers = userEntries.map(([key, value]) => {
                    const personal = value.personal || {};
                    const educational = value.educational || {};
                    
                    const fullName = [personal.firstName, personal.middleName, personal.lastName]
                        .filter(Boolean)
                        .join(" ");
                    
                    const age = personal.dateOfBirth ? calculateAge(personal.dateOfBirth) : null;
                    
                    let photo = null;
                    if (value.photos && Array.isArray(value.photos) && value.photos.length > 0) {
                        const validPhotos = value.photos.filter(photoUrl =>
                            photoUrl && typeof photoUrl === 'string' && isImageUrl(photoUrl)
                        );
                        if (validPhotos.length > 0) {
                            photo = validPhotos[0];
                        }
                    }

                    return {
                        id: key,
                        name: fullName || "Name not provided",
                        age: age || "Not specified",
                        gender: personal.gender || "Not specified",
                        location: educational.currentPlace || educational.district || educational.nativePlace || "Not specified",
                        profession: educational.profession || "Not specified",
                        education: educational.education || "Not specified",
                        photo: photo,
                        phoneNumber: personal.phoneNumber || key,
                        religion: personal.religion || "Not specified",
                        caste: personal.caste || "Not specified",
                        maritalStatus: personal.maritalStatus || "Not specified",
                        height: personal.heightFeet && personal.heightInches ? 
                               `${personal.heightFeet}'${personal.heightInches}"` : "Not specified"
                    };
                }).reverse(); // Reverse to show latest profiles first

                let combinedProfiles;
                if (loadMore) {
                    // Append new profiles to existing ones
                    combinedProfiles = [...globalProfilesCache, ...processedUsers];
                } else {
                    // Initial load
                    combinedProfiles = processedUsers;
                    // Generate fake count on first load
                    setFakeUserCount(generateFakeCount());
                }

                // Update global cache
                globalProfilesCache = combinedProfiles;
                globalCacheTimestamp = Date.now();

                // Check if we got less than batch size (means no more data)
                setHasMoreData(userEntries.length === BATCH_SIZE);

                setAllProfiles(combinedProfiles);
                setTotalPages(Math.ceil(combinedProfiles.length / profilesPerPage));
                
                return combinedProfiles;
            } else {
                setAllProfiles([]);
                setCurrentPageProfiles([]);
                setTotalPages(0);
                return [];
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setAllProfiles([]);
            setCurrentPageProfiles([]);
            setTotalPages(0);
            return [];
        } finally {
            setLoading(false);
        }
    }, [calculateAge, isImageUrl, profilesPerPage, generateFakeCount]);

    // Handle profile click
    const handleProfileClick = (profile) => {
        // Save current state
        const currentState = {
            currentPage,
            scrollPosition: window.scrollY
        };
        
        sessionStorage.setItem('adminHomePageState', JSON.stringify(currentState));
        sessionStorage.setItem('returningFromAdminDetail', 'true');
        
        navigate(`/profile/${profile.id}`);
    };

    // Handle update photos navigation
    const handleUpdatePhotos = (userId, e) => {
        e.stopPropagation();
        
        // Save current state
        const currentState = {
            currentPage,
            scrollPosition: window.scrollY
        };
        
        sessionStorage.setItem('adminHomePageState', JSON.stringify(currentState));
        sessionStorage.setItem('returningFromAdminDetail', 'true');
        
        navigate(`/edit/${userId}`);
    };

    // Handle delete user
    const handleDeleteUser = async (userId, userName, e) => {
        e.stopPropagation();
        
        if (window.confirm(`Are you sure you want to delete profile of "${userName}"? This action cannot be undone.`)) {
            try {
                setLoading(true);
                const db = getDatabase();
                await remove(ref(db, `Matrimony/users/${userId}`));

                // Update local state - remove from allProfiles
                const updatedProfiles = allProfiles.filter(user => user.id !== userId);
                setAllProfiles(updatedProfiles);
                
                // Update global cache
                globalProfilesCache = updatedProfiles;
                
                // Recalculate pages
                setTotalPages(Math.ceil(updatedProfiles.length / profilesPerPage));
                
                // Update current page profiles
                const startIndex = currentPage * profilesPerPage;
                const endIndex = startIndex + profilesPerPage;
                setCurrentPageProfiles(updatedProfiles.slice(startIndex, endIndex));

                alert('Profile deleted successfully');
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle pagination
    const handlePageChange = async (pageNumber) => {
        // Check if user is on last page and there's more data to load
        if (pageNumber === totalPages - 1 && hasMoreData && pageNumber > 0) {
            // Load more data
            await fetchUsers(true);
        }
        
        setCurrentPage(pageNumber);
        const startIndex = pageNumber * profilesPerPage;
        const endIndex = startIndex + profilesPerPage;
        setCurrentPageProfiles(allProfiles.slice(startIndex, endIndex));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Initialize component
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const returningFromDetail = sessionStorage.getItem('returningFromAdminDetail');
        
        if (returningFromDetail === 'true') {
            // Returning from detail page
            if (isCacheValid()) {
                // Use cached data instantly - no loading screen
                setAllProfiles(globalProfilesCache);
                setTotalPages(Math.ceil(globalProfilesCache.length / profilesPerPage));
                
                // Restore state
                const savedState = sessionStorage.getItem('adminHomePageState');
                if (savedState) {
                    try {
                        const state = JSON.parse(savedState);
                        const pageToShow = state.currentPage || 0;
                        
                        setCurrentPage(pageToShow);
                        const startIndex = pageToShow * profilesPerPage;
                        const endIndex = startIndex + profilesPerPage;
                        setCurrentPageProfiles(globalProfilesCache.slice(startIndex, endIndex));
                        
                        // Restore scroll position instantly
                        setTimeout(() => {
                            window.scrollTo({
                                top: state.scrollPosition || 0,
                                behavior: 'instant'
                            });
                        }, 0);
                    } catch (error) {
                        console.error('Error restoring state:', error);
                        setCurrentPage(0);
                        setCurrentPageProfiles(globalProfilesCache.slice(0, profilesPerPage));
                    }
                }
                
                setLoading(false);
                
                // Clear flags
                sessionStorage.removeItem('returningFromAdminDetail');
                sessionStorage.removeItem('adminHomePageState');
            } else {
                // Cache expired - fetch fresh data
                fetchUsers().then((profiles) => {
                    if (profiles && profiles.length > 0) {
                        const savedState = sessionStorage.getItem('adminHomePageState');
                        if (savedState) {
                            try {
                                const state = JSON.parse(savedState);
                                const pageToShow = state.currentPage || 0;
                                
                                setCurrentPage(pageToShow);
                                const startIndex = pageToShow * profilesPerPage;
                                const endIndex = startIndex + profilesPerPage;
                                setCurrentPageProfiles(profiles.slice(startIndex, endIndex));
                                
                                setTimeout(() => {
                                    window.scrollTo({
                                        top: state.scrollPosition || 0,
                                        behavior: 'instant'
                                    });
                                }, 100);
                            } catch (error) {
                                setCurrentPage(0);
                                setCurrentPageProfiles(profiles.slice(0, profilesPerPage));
                            }
                        }
                    }
                    
                    sessionStorage.removeItem('returningFromAdminDetail');
                    sessionStorage.removeItem('adminHomePageState');
                });
            }
        } else {
            // Fresh load
            if (isCacheValid()) {
                // Use cached data
                setAllProfiles(globalProfilesCache);
                setTotalPages(Math.ceil(globalProfilesCache.length / profilesPerPage));
                setCurrentPage(0);
                setCurrentPageProfiles(globalProfilesCache.slice(0, profilesPerPage));
                setLoading(false);
            } else {
                // Fetch fresh data
                fetchUsers().then((profiles) => {
                    if (profiles && profiles.length > 0) {
                        setCurrentPage(0);
                        setCurrentPageProfiles(profiles.slice(0, profilesPerPage));
                    }
                });
            }
        }
    }, [isCacheValid, fetchUsers, profilesPerPage]);

    // Update current page profiles when allProfiles or currentPage changes
    useEffect(() => {
        if (allProfiles.length > 0) {
            const startIndex = currentPage * profilesPerPage;
            const endIndex = startIndex + profilesPerPage;
            setCurrentPageProfiles(allProfiles.slice(startIndex, endIndex));
        }
    }, [allProfiles, currentPage, profilesPerPage]);

    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
            width: '100%',
            padding: '2rem',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                }}>
                    MatchMaker Matrimony
                </h1>
                <p style={{
                    color: '#64748b',
                    fontSize: '1.1rem',
                    marginBottom: '0.5rem'
                }}>
                    {fakeUserCount.toLocaleString()}+ Users Found
                </p>
                <p style={{
                    color: '#64748b',
                    fontSize: '1rem'
                }}>
                    Page {currentPage + 1} of {totalPages} • Showing {currentPageProfiles.length} profiles
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    marginBottom: '3rem'
                }}>
                    <div style={{
                        display: 'inline-block',
                        width: '50px',
                        height: '50px',
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #6a11cb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '2rem'
                    }}></div>
                    <h3 style={{ 
                        color: '#1e293b', 
                        marginBottom: '1rem',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                    }}>
                        Loading Profiles...
                    </h3>
                    <p style={{ 
                        color: '#64748b',
                        fontSize: '1.2rem'
                    }}>
                        Please wait while we fetch the latest profiles for you
                    </p>
                    <style>
                        {`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}
                    </style>
                </div>
            ) : (
                <>
                    {/* Profiles Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '3rem'
                    }}>
                        {currentPageProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                onClick={() => handleProfileClick(profile)}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    border: '1px solid transparent'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.border = '1px solid #6a11cb';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.border = '1px solid transparent';
                                }}
                            >
                                {/* Profile Image */}
                                <div style={{
                                    height: '350px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8fafc'
                                }}>
                                    {profile.photo ? (
                                        <img 
                                            src={profile.photo} 
                                            alt={profile.name}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center top'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            color: '#64748b',
                                            fontSize: '4rem',
                                            textAlign: 'center'
                                        }}>
                                            👤
                                        </div>
                                    )}
                                </div>

                                {/* Profile Details */}
                                <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1.4rem',
                                        fontWeight: 'bold',
                                        color: '#1e293b'
                                    }}>
                                        {profile.name}
                                    </h3>
                                    
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#64748b',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>Age:</span>
                                            {profile.age}
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#64748b',
                                            fontSize: '0.95rem'
                                        }}>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>Caste:</span>
                                            {profile.caste}
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#64748b',
                                            fontSize: '0.95rem'
                                        }}>
                                            <FaGraduationCap style={{ color: '#6a11cb' }} />
                                            <span>{profile.education}</span>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#64748b',
                                            fontSize: '0.95rem'
                                        }}>
                                            <FaBriefcase style={{ color: '#6a11cb' }} />
                                            <span>{profile.profession}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProfileClick(profile);
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                                color: 'white',
                                                padding: '0.75rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            👁️ View Details
                                        </button>
                                        
                                        <button
                                            onClick={(e) => handleUpdatePhotos(profile.id, e)}
                                            style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                padding: '0.6rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            📸 Update Photos
                                        </button>
                                        
                                        <button
                                            onClick={(e) => handleDeleteUser(profile.id, profile.name, e)}
                                            style={{
                                                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                                color: 'white',
                                                padding: '0.6rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            🗑️ Delete Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '3rem',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                style={{
                                    background: currentPage === 0 ? '#f3f4f6' : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                    color: currentPage === 0 ? '#9ca3af' : 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FaChevronLeft /> Previous
                            </button>

                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                            }}>
                                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 10) {
                                        pageNum = i;
                                    } else if (currentPage < 5) {
                                        pageNum = i;
                                    } else if (currentPage >= totalPages - 5) {
                                        pageNum = totalPages - 10 + i;
                                    } else {
                                        pageNum = currentPage - 4 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            style={{
                                                background: pageNum === currentPage ? 
                                                    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : 
                                                    'white',
                                                color: pageNum === currentPage ? 'white' : '#6a11cb',
                                                border: '2px solid #6a11cb',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                minWidth: '40px'
                                            }}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                style={{
                                    background: currentPage === totalPages - 1 ? '#f3f4f6' : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                    color: currentPage === totalPages - 1 ? '#9ca3af' : 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HomePage;
