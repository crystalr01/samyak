import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, query, orderByKey, limitToLast, endBefore } from "firebase/database";
import { FaGraduationCap, FaBriefcase, FaChevronLeft, FaChevronRight, FaUnlock, FaBars, FaTimes, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import UserRegistrationModal from './UserRegistrationModal';
import './UserHomePage.css';

// Global cache to persist data across component unmounts
let globalProfilesCache = null;
let globalCacheTimestamp = null;
let globalLastKey = null; // Track last loaded key for pagination
let globalFilterOptionsCache = null; // Cache for filter dropdown options
let globalFilterCacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 300; // Load 300 users at a time

const UserHomePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [allProfiles, setAllProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [currentPageProfiles, setCurrentPageProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(true);
    const [fakeUserCount, setFakeUserCount] = useState(0); // Fake count for display
    const [hasMoreData, setHasMoreData] = useState(true); // Track if more data available
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Track loading more data
    const [allDataLoaded, setAllDataLoaded] = useState(false); // Track if all data is loaded
    
    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        gender: '',
        religion: '',
        caste: '',
        district: '',
        taluka: '',
        education: '',
        maritalStatus: '',
        ageMin: '',
        ageMax: ''
    });
    const [filterOptions, setFilterOptions] = useState({
        religions: [],
        castes: [],
        districts: [],
        talukas: [],
        educations: [],
        maritalStatuses: []
    });
    const [loadingFilters, setLoadingFilters] = useState(false);
    
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

    // Load filter options from all users
    const loadFilterOptions = useCallback(async () => {
        // Check cache first - updated to check daily instead of 24 hours
        const now = new Date();
        const today = now.toDateString(); // Get today's date string
        const cachedDate = localStorage.getItem('matrimony_filter_cache_date');
        
        if (cachedDate === today && globalFilterOptionsCache) {
            setFilterOptions(globalFilterOptionsCache);
            return;
        }

        setLoadingFilters(true);
        try {
            const db = getDatabase();
            const usersRef = ref(db, "Matrimony/users");
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const userEntries = Object.entries(usersData);
                
                const religions = new Set();
                const castes = new Set();
                const districts = new Set();
                const talukas = new Set();
                const educations = new Set();
                const maritalStatuses = new Set();

                userEntries.forEach(([key, value]) => {
                    const personal = value.personal || {};
                    const educational = value.educational || {};
                    
                    // Extract filter options with proper validation
                    if (personal.religion && personal.religion !== 'Not specified' && personal.religion.trim()) {
                        religions.add(personal.religion.trim());
                    }
                    if (personal.caste && personal.caste !== 'Not specified' && personal.caste.trim()) {
                        castes.add(personal.caste.trim());
                    }
                    if (educational.district && educational.district !== 'Not specified' && educational.district.trim()) {
                        districts.add(educational.district.trim());
                    }
                    if (educational.taluka && educational.taluka !== 'Not specified' && educational.taluka.trim()) {
                        talukas.add(educational.taluka.trim());
                    }
                    if (educational.education && educational.education !== 'Not specified' && educational.education.trim()) {
                        educations.add(educational.education.trim());
                    }
                    if (personal.maritalStatus && personal.maritalStatus !== 'Not specified' && personal.maritalStatus.trim()) {
                        maritalStatuses.add(personal.maritalStatus.trim());
                    }
                });

                const options = {
                    religions: Array.from(religions).sort(),
                    castes: Array.from(castes).sort(),
                    districts: Array.from(districts).sort(),
                    talukas: Array.from(talukas).sort(),
                    educations: Array.from(educations).sort(),
                    maritalStatuses: Array.from(maritalStatuses).sort()
                };

                // Cache the options with today's date
                globalFilterOptionsCache = options;
                globalFilterCacheTimestamp = Date.now();
                
                // Save to localStorage with date-based caching
                localStorage.setItem('matrimony_filter_options', JSON.stringify(options));
                localStorage.setItem('matrimony_filter_cache_date', today);
                localStorage.setItem('matrimony_filter_cache_time', globalFilterCacheTimestamp.toString());

                setFilterOptions(options);
                
                console.log('Filter options loaded:', {
                    religions: options.religions.length,
                    castes: options.castes.length,
                    districts: options.districts.length,
                    talukas: options.talukas.length,
                    educations: options.educations.length,
                    maritalStatuses: options.maritalStatuses.length
                });
            }
        } catch (error) {
            console.error("Error loading filter options:", error);
            // Try to load from localStorage as fallback
            const cachedOptions = localStorage.getItem('matrimony_filter_options');
            if (cachedOptions) {
                try {
                    const options = JSON.parse(cachedOptions);
                    globalFilterOptionsCache = options;
                    setFilterOptions(options);
                } catch (parseError) {
                    console.error("Error parsing cached filter options:", parseError);
                }
            }
        } finally {
            setLoadingFilters(false);
        }
    }, []);

    // Apply filters to profiles
    const applyFilters = useCallback((profiles, filterCriteria) => {
        return profiles.filter(profile => {
            // Gender filter
            if (filterCriteria.gender && profile.gender !== filterCriteria.gender) {
                return false;
            }

            // Religion filter
            if (filterCriteria.religion && profile.religion !== filterCriteria.religion) {
                return false;
            }

            // Caste filter
            if (filterCriteria.caste && profile.caste !== filterCriteria.caste) {
                return false;
            }

            // District filter - check both location and district fields
            if (filterCriteria.district) {
                const hasDistrict = profile.location.includes(filterCriteria.district) || 
                                   (profile.district && profile.district === filterCriteria.district);
                if (!hasDistrict) return false;
            }

            // Taluka filter - check both location and taluka fields
            if (filterCriteria.taluka) {
                const hasTaluka = profile.location.includes(filterCriteria.taluka) || 
                                 (profile.taluka && profile.taluka === filterCriteria.taluka);
                if (!hasTaluka) return false;
            }

            // Education filter (partial match for flexibility)
            if (filterCriteria.education) {
                const educationMatch = profile.education.toLowerCase().includes(filterCriteria.education.toLowerCase());
                if (!educationMatch) return false;
            }

            // Marital Status filter
            if (filterCriteria.maritalStatus && profile.maritalStatus !== filterCriteria.maritalStatus) {
                return false;
            }

            // Age filter
            if (filterCriteria.ageMin || filterCriteria.ageMax) {
                const age = typeof profile.age === 'number' ? profile.age : parseInt(profile.age);
                if (isNaN(age)) return false;
                
                if (filterCriteria.ageMin && age < parseInt(filterCriteria.ageMin)) {
                    return false;
                }
                if (filterCriteria.ageMax && age > parseInt(filterCriteria.ageMax)) {
                    return false;
                }
            }

            return true;
        });
    }, []);

    // Handle filter changes
    const handleFilterChange = useCallback((filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    }, []);

    // Load all data for filtering - Firebase billing efficient approach
    const loadAllDataForFiltering = useCallback(async () => {
        if (allDataLoaded || isLoadingMore) return;
        
        setIsLoadingMore(true);
        console.log('Loading all data for comprehensive filtering...');
        
        try {
            const db = getDatabase();
            let allUsers = [...globalProfilesCache]; // Start with cached data
            let lastKey = globalLastKey;
            let hasMore = hasMoreData;
            
            // Load remaining data in batches
            while (hasMore && !allDataLoaded) {
                let usersQuery;
                if (lastKey) {
                    usersQuery = query(
                        ref(db, "Matrimony/users"), 
                        orderByKey(), 
                        endBefore(lastKey),
                        limitToLast(BATCH_SIZE)
                    );
                } else {
                    // This shouldn't happen as we should have lastKey from initial load
                    break;
                }
                
                const snapshot = await get(usersQuery);
                
                if (snapshot.exists()) {
                    const usersData = snapshot.val();
                    const userEntries = Object.entries(usersData);
                    
                    if (userEntries.length === 0) {
                        hasMore = false;
                        break;
                    }
                    
                    // Update lastKey for next batch
                    lastKey = userEntries[0][0];
                    
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
                                   `${personal.heightFeet}'${personal.heightInches}"` : "Not specified",
                            district: educational.district || "Not specified",
                            taluka: educational.taluka || "Not specified",
                            currentPlace: educational.currentPlace || "Not specified",
                            nativePlace: educational.nativePlace || "Not specified"
                        };
                    }).reverse();
                    
                    // Add new users to the beginning (they're older)
                    allUsers = [...processedUsers, ...allUsers];
                    
                    // Check if we got less than batch size (means no more data)
                    if (userEntries.length < BATCH_SIZE * 0.5) {
                        hasMore = false;
                    }
                    
                    console.log(`Loaded batch of ${userEntries.length} profiles. Total: ${allUsers.length}`);
                } else {
                    hasMore = false;
                }
            }
            
            // Update global cache and state
            globalProfilesCache = allUsers;
            globalLastKey = lastKey;
            setAllProfiles(allUsers);
            setHasMoreData(hasMore);
            setAllDataLoaded(!hasMore);
            
            console.log(`All data loading complete. Total profiles: ${allUsers.length}`);
            
        } catch (error) {
            console.error("Error loading all data for filtering:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [allDataLoaded, isLoadingMore, hasMoreData, calculateAge, isImageUrl]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setFilters({
            gender: '',
            religion: '',
            caste: '',
            district: '',
            taluka: '',
            education: '',
            maritalStatus: '',
            ageMin: '',
            ageMax: ''
        });
    }, []);

    // Smart filter application - loads all data if needed
    const applyFiltersWithDataLoading = useCallback(async () => {
        // Check if any filters are applied
        const hasActiveFilters = Object.values(filters).some(value => value !== '');
        
        if (hasActiveFilters && !allDataLoaded && hasMoreData) {
            // Load all data first for comprehensive filtering
            await loadAllDataForFiltering();
        }
        
        // Apply filters to current data
        const filtered = applyFilters(allProfiles, filters);
        setFilteredProfiles(filtered);
        setTotalPages(Math.ceil(filtered.length / profilesPerPage));
        setCurrentPage(0);
        
        // Update current page profiles
        const startIndex = 0;
        const endIndex = profilesPerPage;
        setCurrentPageProfiles(filtered.slice(startIndex, endIndex));
        
        console.log(`Filter applied: ${filtered.length} profiles match criteria`);
    }, [filters, allProfiles, allDataLoaded, hasMoreData, loadAllDataForFiltering, applyFilters, profilesPerPage]);

    // Check if user is registered
    const checkUserRegistration = useCallback(async () => {
        setCheckingRegistration(true);
        
        // Check localStorage for the key that AuthContext uses
        const savedUser = localStorage.getItem('matrimony_user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            
            // Extract phone number from the saved user data
            let phoneNumber = userData.phoneNumber;
            if (phoneNumber.startsWith('+91')) {
                phoneNumber = phoneNumber.substring(3);
            } else if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
                phoneNumber = phoneNumber.substring(2);
            }
            
            // Check if user has complete profile in Firebase
            try {
                const db = getDatabase();
                const userRef = ref(db, `Matrimony/users/${phoneNumber}`);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const profileData = snapshot.val();
                    
                    // Check if profile is complete
                    const hasCompleteProfile = (
                        profileData.personal?.firstName &&
                        profileData.personal?.lastName &&
                        profileData.personal?.dateOfBirth &&
                        profileData.personal?.heightFeet &&
                        profileData.personal?.heightInches &&
                        profileData.personal?.maritalStatus &&
                        profileData.personal?.caste &&
                        profileData.personal?.religion &&
                        profileData.educational?.education &&
                        profileData.educational?.profession &&
                        profileData.educational?.currentPlace &&
                        profileData.educational?.nativePlace &&
                        profileData.educational?.taluka &&
                        profileData.educational?.district &&
                        profileData.photos &&
                        profileData.photos.length > 0 &&
                        profileData.biodata
                    );
                    
                    if (hasCompleteProfile) {
                        setIsRegistered(true);
                        setCheckingRegistration(false);
                        return true;
                    }
                }
            } catch (error) {
                console.error('Error checking profile:', error);
            }
        }

        // If no localStorage or incomplete profile, show registration modal
        setIsRegistered(false);
        setShowRegistrationModal(true);
        setCheckingRegistration(false);
        return false;
    }, []);

    // Handle registration completion
    const handleRegistrationComplete = (userData) => {
        localStorage.setItem('matrimony_user', JSON.stringify({
            phoneNumber: `+91${userData.phoneNumber}`,
            id: `user_${userData.phoneNumber}`
        }));
        setIsRegistered(true);
        setShowRegistrationModal(false);
        
        // Reload the page to fetch profiles
        window.location.reload();
    };

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
                               `${personal.heightFeet}'${personal.heightInches}"` : "Not specified",
                        // Additional fields for filtering
                        district: educational.district || "Not specified",
                        taluka: educational.taluka || "Not specified",
                        currentPlace: educational.currentPlace || "Not specified",
                        nativePlace: educational.nativePlace || "Not specified"
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
                    const fakeCount = Math.floor(Math.random() * (117000 - 112000 + 1)) + 112000;
                    setFakeUserCount(fakeCount);
                }

                // Update global cache
                globalProfilesCache = combinedProfiles;
                globalCacheTimestamp = Date.now();

                // Check if we got less than batch size (means no more data)
                // Only set to false if we got significantly less data (less than 50% of batch)
                // This handles cases where Firebase might return slightly less than requested
                const hasMore = userEntries.length >= BATCH_SIZE * 0.5;
                console.log('Batch loaded:', userEntries.length, 'profiles. Has more data:', hasMore);
                setHasMoreData(hasMore);

                setAllProfiles(combinedProfiles);
                setFilteredProfiles(combinedProfiles); // Initialize filtered profiles
                setTotalPages(Math.ceil(combinedProfiles.length / profilesPerPage));
                
                // Load filter options if not cached for today
                const now = new Date();
                const today = now.toDateString();
                const cachedDate = localStorage.getItem('matrimony_filter_cache_date');
                
                if (cachedDate !== today) {
                    loadFilterOptions();
                } else {
                    // Load from localStorage if available and valid for today
                    const cachedOptions = localStorage.getItem('matrimony_filter_options');
                    const cachedTime = localStorage.getItem('matrimony_filter_cache_time');
                    
                    if (cachedOptions && cachedTime) {
                        try {
                            const options = JSON.parse(cachedOptions);
                            globalFilterOptionsCache = options;
                            globalFilterCacheTimestamp = parseInt(cachedTime);
                            setFilterOptions(options);
                        } catch (error) {
                            console.error('Error parsing cached options:', error);
                            loadFilterOptions();
                        }
                    } else {
                        loadFilterOptions();
                    }
                }
                
                return combinedProfiles;
            } else {
                setAllProfiles([]);
                setFilteredProfiles([]);
                setCurrentPageProfiles([]);
                setTotalPages(0);
                return [];
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setAllProfiles([]);
            setFilteredProfiles([]);
            setCurrentPageProfiles([]);
            setTotalPages(0);
            return [];
        } finally {
            setLoading(false);
        }
    }, [calculateAge, isImageUrl, profilesPerPage, loadFilterOptions]);

    // Handle profile click
    const handleProfileClick = (profile) => {
        // Save current state
        const currentState = {
            currentPage,
            scrollPosition: window.scrollY
        };
        
        sessionStorage.setItem('userHomePageState', JSON.stringify(currentState));
        sessionStorage.setItem('returningFromDetail', 'true');
        
        navigate(`/user/${profile.id}`);
    };

    // Handle pagination - improved logic
    const handlePageChange = async (pageNumber) => {
        console.log('=== Page Change Debug ===');
        console.log('Changing to page:', pageNumber + 1);
        console.log('Total pages:', totalPages);
        console.log('Has more data:', hasMoreData);
        console.log('Filtered profiles count:', filteredProfiles.length);
        console.log('All data loaded:', allDataLoaded);
        
        // Use filtered profiles for pagination
        const profilesToUse = filteredProfiles.length > 0 ? filteredProfiles : allProfiles;
        
        // Check if we need to load more data
        const isLastPage = pageNumber === totalPages - 1;
        const isNearEnd = pageNumber >= totalPages - 3;
        const hasActiveFilters = Object.values(filters).some(value => value !== '');
        
        // Only load more data if:
        // 1. We're near the end of pages
        // 2. We have more data available
        // 3. We're not currently filtering (or we need all data for filtering)
        // 4. We haven't loaded all data yet
        if ((isLastPage || isNearEnd) && hasMoreData && !allDataLoaded && !hasActiveFilters) {
            console.log('Loading more data for pagination...');
            setLoading(true);
            const newProfiles = await fetchUsers(true);
            setLoading(false);
            
            if (newProfiles && newProfiles.length > 0) {
                // Data loaded successfully, now set the page
                setCurrentPage(pageNumber);
                const startIndex = pageNumber * profilesPerPage;
                const endIndex = startIndex + profilesPerPage;
                setCurrentPageProfiles(newProfiles.slice(startIndex, endIndex));
                return;
            }
        }
        
        // Normal page change
        setCurrentPage(pageNumber);
        const startIndex = pageNumber * profilesPerPage;
        const endIndex = startIndex + profilesPerPage;
        setCurrentPageProfiles(profilesToUse.slice(startIndex, endIndex));
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Initialize component
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // Check registration first
        checkUserRegistration().then((registered) => {
            if (!registered) {
                // User not registered, modal will show
                setLoading(false);
                return;
            }

            // User is registered, proceed with loading profiles
            const returningFromDetail = sessionStorage.getItem('returningFromDetail');
            
            if (returningFromDetail === 'true') {
                // Returning from detail page
                if (isCacheValid()) {
                    // Use cached data instantly - no loading screen
                    setAllProfiles(globalProfilesCache);
                    setTotalPages(Math.ceil(globalProfilesCache.length / profilesPerPage));
                    
                    // Restore state
                    const savedState = sessionStorage.getItem('userHomePageState');
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
                    sessionStorage.removeItem('returningFromDetail');
                    sessionStorage.removeItem('userHomePageState');
                } else {
                    // Cache expired - fetch fresh data
                    fetchUsers().then((profiles) => {
                        if (profiles && profiles.length > 0) {
                            const savedState = sessionStorage.getItem('userHomePageState');
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
                        
                        sessionStorage.removeItem('returningFromDetail');
                        sessionStorage.removeItem('userHomePageState');
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
        });
    }, [isCacheValid, fetchUsers, profilesPerPage, checkUserRegistration]);

    // Update current page profiles when allProfiles or currentPage changes
    useEffect(() => {
        const profilesToUse = filteredProfiles.length > 0 ? filteredProfiles : allProfiles;
        if (profilesToUse.length > 0) {
            const startIndex = currentPage * profilesPerPage;
            const endIndex = startIndex + profilesPerPage;
            setCurrentPageProfiles(profilesToUse.slice(startIndex, endIndex));
        }
    }, [allProfiles, filteredProfiles, currentPage, profilesPerPage]);

    // Update filtered profiles when filters change - with smart data loading
    useEffect(() => {
        if (allProfiles.length > 0) {
            applyFiltersWithDataLoading();
        }
    }, [filters, applyFiltersWithDataLoading, allProfiles]);

    // Load filter options from localStorage on component mount
    useEffect(() => {
        const now = new Date();
        const today = now.toDateString();
        const cachedDate = localStorage.getItem('matrimony_filter_cache_date');
        const cachedOptions = localStorage.getItem('matrimony_filter_options');
        const cachedTime = localStorage.getItem('matrimony_filter_cache_time');
        
        // Check if we have valid cache for today
        if (cachedDate === today && cachedOptions && cachedTime) {
            try {
                const options = JSON.parse(cachedOptions);
                globalFilterOptionsCache = options;
                globalFilterCacheTimestamp = parseInt(cachedTime);
                setFilterOptions(options);
                console.log('Loaded filter options from cache for today');
            } catch (error) {
                console.error('Error parsing cached filter options:', error);
                // If parsing fails, clear the cache and load fresh data
                localStorage.removeItem('matrimony_filter_options');
                localStorage.removeItem('matrimony_filter_cache_date');
                localStorage.removeItem('matrimony_filter_cache_time');
            }
        } else {
            console.log('Filter cache expired or not found, will load fresh data');
            // Cache is from previous day or doesn't exist, will be loaded when profiles are fetched
        }
    }, []);

    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Registration Modal */}
            <UserRegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => {
                    // Modal will close automatically after successful registration
                    // This handler is for when user tries to close without completing
                    if (!isRegistered) {
                        alert('Please complete registration to browse profiles');
                    }
                }}
                onRegistrationComplete={handleRegistrationComplete}
            />

            {/* Show content only if registered */}
            {!checkingRegistration && isRegistered && (
                <>
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
                                    Find Your Perfect Match
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
                        {user && (
                            <button
                                onClick={() => navigate('/unlocked-profiles')}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                <FaUnlock />
                                My Unlocked
                            </button>
                        )}
                        {!user ? (
                            <button
                                onClick={() => navigate('/login')}
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
                                Admin Login
                            </button>
                        ) : (
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
                                            alert('Logged out successfully!');
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

                    {/* Mobile: My Unlocked Button + Menu */}
                    <div style={{
                        display: window.innerWidth <= 768 ? 'flex' : 'none',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}>
                        {user && (
                            <button
                                onClick={() => navigate('/unlocked-profiles')}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <FaUnlock style={{ fontSize: '0.9rem' }} />
                                My Unlocked
                            </button>
                        )}
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
                        {!user ? (
                            <button
                                onClick={() => {
                                    navigate('/login');
                                    setIsMenuOpen(false);
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.9rem',
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(106, 17, 203, 0.3)'
                                }}
                            >
                                Admin Login
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to logout?')) {
                                        logout();
                                        setIsMenuOpen(false);
                                        alert('Logged out successfully!');
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

            <div style={{ padding: window.innerWidth > 768 ? '0 2rem 2rem' : '0 1rem 1rem' }}>
                {/* Page Info */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        marginBottom: '0.5rem'
                    }}>
                        Browse Profiles
                    </h2>
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

                {/* Filter Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid #e2e8f0'
                }}>
                    {/* Filter Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <FaFilter style={{ 
                                color: '#6a11cb', 
                                fontSize: '1.2rem' 
                            }} />
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.4rem',
                                fontWeight: 'bold',
                                color: '#1e293b'
                            }}>
                                Filter Profiles
                            </h3>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    background: showFilters ? 
                                        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 
                                        'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: showFilters ? 
                                        '0 4px 12px rgba(239, 68, 68, 0.3)' : 
                                        '0 4px 12px rgba(106, 17, 203, 0.3)'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                <FaFilter />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                            
                            {(filters.gender || filters.religion || filters.caste || filters.district || 
                              filters.taluka || filters.education || filters.maritalStatus || 
                              filters.ageMin || filters.ageMax) && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="filter-section" style={{
                            display: 'grid',
                            gridTemplateColumns: window.innerWidth > 1200 ? 
                                'repeat(4, 1fr)' : 
                                window.innerWidth > 768 ? 
                                    'repeat(2, 1fr)' : 
                                    '1fr',
                            gap: '1.5rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '15px',
                            border: '1px solid #e2e8f0'
                        }}>
                            {/* Gender Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    Gender
                                </label>
                                <select
                                    value={filters.gender}
                                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                                    className="filter-input"
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        background: 'white',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">All Genders</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            {/* Religion Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    Religion
                                </label>
                                <select
                                    value={filters.religion}
                                    onChange={(e) => handleFilterChange('religion', e.target.value)}
                                    disabled={loadingFilters}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        background: loadingFilters ? '#f9fafb' : 'white',
                                        cursor: loadingFilters ? 'not-allowed' : 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => !loadingFilters && (e.target.style.borderColor = '#6a11cb')}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Religions</option>
                                    {filterOptions.religions.map(religion => (
                                        <option key={religion} value={religion}>{religion}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Caste Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    Caste
                                </label>
                                <select
                                    value={filters.caste}
                                    onChange={(e) => handleFilterChange('caste', e.target.value)}
                                    disabled={loadingFilters}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        background: loadingFilters ? '#f9fafb' : 'white',
                                        cursor: loadingFilters ? 'not-allowed' : 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => !loadingFilters && (e.target.style.borderColor = '#6a11cb')}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Castes</option>
                                    {filterOptions.castes.map(caste => (
                                        <option key={caste} value={caste}>{caste}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Marital Status Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    Marital Status
                                </label>
                                <select
                                    value={filters.maritalStatus}
                                    onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
                                    disabled={loadingFilters}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        background: loadingFilters ? '#f9fafb' : 'white',
                                        cursor: loadingFilters ? 'not-allowed' : 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => !loadingFilters && (e.target.style.borderColor = '#6a11cb')}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Marital Status</option>
                                    {filterOptions.maritalStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* District Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    District
                                </label>
                                <select
                                    value={filters.district}
                                    onChange={(e) => handleFilterChange('district', e.target.value)}
                                    disabled={loadingFilters}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        background: loadingFilters ? '#f9fafb' : 'white',
                                        cursor: loadingFilters ? 'not-allowed' : 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => !loadingFilters && (e.target.style.borderColor = '#6a11cb')}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Districts</option>
                                    {filterOptions.districts.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Taluka Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    Taluka
                                </label>
                                <select
                                    value={filters.taluka}
                                    onChange={(e) => handleFilterChange('taluka', e.target.value)}
                                    disabled={loadingFilters}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        background: loadingFilters ? '#f9fafb' : 'white',
                                        cursor: loadingFilters ? 'not-allowed' : 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => !loadingFilters && (e.target.style.borderColor = '#6a11cb')}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Talukas</option>
                                    {filterOptions.talukas.map(taluka => (
                                        <option key={taluka} value={taluka}>{taluka}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Education Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    Education
                                </label>
                                <select
                                    value={filters.education}
                                    onChange={(e) => handleFilterChange('education', e.target.value)}
                                    disabled={loadingFilters}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '0.9rem',
                                        background: loadingFilters ? '#f9fafb' : 'white',
                                        cursor: loadingFilters ? 'not-allowed' : 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => !loadingFilters && (e.target.style.borderColor = '#6a11cb')}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Education Levels</option>
                                    {filterOptions.educations.map(education => (
                                        <option key={education} value={education}>{education}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Age Range Filter */}
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '0.5rem',
                                gridColumn: window.innerWidth > 768 ? 'span 1' : 'span 1'
                            }}>
                                <label style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.25rem'
                                }}>
                                    Age Range
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.ageMin}
                                        onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                                        min="18"
                                        max="80"
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '0.9rem',
                                            background: 'white',
                                            outline: 'none',
                                            flex: 1,
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#6a11cb'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                    <span style={{ color: '#6b7280', fontWeight: '500' }}>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.ageMax}
                                        onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                                        min="18"
                                        max="80"
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '0.9rem',
                                            background: 'white',
                                            outline: 'none',
                                            flex: 1,
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#6a11cb'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Filters Display */}
                    {(filters.gender || filters.religion || filters.caste || filters.district || 
                      filters.taluka || filters.education || filters.maritalStatus || 
                      filters.ageMin || filters.ageMax) && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            borderRadius: '12px',
                            border: '1px solid #bfdbfe'
                        }}>
                            <h4 style={{
                                margin: '0 0 0.75rem 0',
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#1e40af'
                            }}>
                                Active Filters:
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                {filters.gender && (
                                    <span className="filter-badge" style={{
                                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        Gender: {filters.gender}
                                    </span>
                                )}
                                {filters.religion && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        Religion: {filters.religion}
                                    </span>
                                )}
                                {filters.caste && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        Caste: {filters.caste}
                                    </span>
                                )}
                                {filters.maritalStatus && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        Status: {filters.maritalStatus}
                                    </span>
                                )}
                                {filters.district && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        District: {filters.district}
                                    </span>
                                )}
                                {filters.taluka && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        Taluka: {filters.taluka}
                                    </span>
                                )}
                                {filters.education && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        Education: {filters.education}
                                    </span>
                                )}
                                {(filters.ageMin || filters.ageMax) && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        Age: {filters.ageMin || '18'} - {filters.ageMax || '80'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Filter Results Summary - Removed profile count display */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#166534'
                        }}>
                            {filteredProfiles.length === allProfiles.length ? 
                                `Browse through our extensive collection of profiles` :
                                `Found ${filteredProfiles.length} matching profiles`
                            }
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {(loading || isLoadingMore) ? (
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
                            {isLoadingMore ? 'Loading All Profiles for Better Filtering...' : 'Loading Profiles...'}
                        </h3>
                        <p style={{ 
                            color: '#64748b',
                            fontSize: '1.2rem'
                        }}>
                            {isLoadingMore ? 
                                'Please wait while we fetch all profiles to provide comprehensive search results' :
                                'Please wait while we fetch the latest profiles for you'
                            }
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
                                        height: window.innerWidth <= 768 ? '450px' : '350px',
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

                                        <div style={{
                                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                            color: 'white',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}>
                                            Click to View Details
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
                                    disabled={currentPage === totalPages - 1 && !hasMoreData}
                                    style={{
                                        background: (currentPage === totalPages - 1 && !hasMoreData) ? '#f3f4f6' : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                        color: (currentPage === totalPages - 1 && !hasMoreData) ? '#9ca3af' : 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '10px',
                                        cursor: (currentPage === totalPages - 1 && !hasMoreData) ? 'not-allowed' : 'pointer',
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

            {/* Footer */}
            <footer style={{
                background: '#1e293b',
                color: 'white',
                padding: '2rem',
                textAlign: 'center',
                marginTop: '3rem'
            }}>
                <div style={{ color: '#94a3b8', fontSize: '1rem' }}>
                    &copy; 2024 Swrajya Sangam. All rights reserved. Developed by Samyak Web Developer
                </div>
            </footer>
                </>
            )}

            {/* Show loading while checking registration */}
            {checkingRegistration && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #6a11cb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Loading...</p>
                    <style>
                        {`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}
                    </style>
                </div>
            )}
        </div>
    );
};

export default UserHomePage;