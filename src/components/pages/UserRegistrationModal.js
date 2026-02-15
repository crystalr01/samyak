import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getDatabase, ref, set, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const UserRegistrationModal = ({ isOpen, onClose, onRegistrationComplete }) => {
    const [step, setStep] = useState('phone'); // 'phone', 'otp', 'registration'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    
    // Registration form data
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        birthTime: '',
        heightFeet: '',
        heightInches: '',
        maritalStatus: '',
        gender: '',
        religion: '',
        caste: '',
        interCasteAllowed: '',
        education: '',
        profession: '',
        currentPlace: '',
        nativePlace: '',
        taluka: '',
        district: '',
        whatsappNumber: '',
        photos: [],
        biodata: null,
    });

    const [uploadProgress, setUploadProgress] = useState(0);

    if (!isOpen) return null;

    // Setup reCAPTCHA
    const setupRecaptcha = () => {
        const auth = getAuth();
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA solved');
                }
            });
        }
    };

    // Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);

        try {
            // Setup reCAPTCHA and send OTP
            setupRecaptcha();
            const auth = getAuth();
            const appVerifier = window.recaptchaVerifier;
            const phoneNumberWithCode = `+91${phoneNumber}`;

            const confirmation = await signInWithPhoneNumber(auth, phoneNumberWithCode, appVerifier);
            setConfirmationResult(confirmation);
            setStep('otp');
            setLoading(false);
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError(error.message || 'Failed to send OTP. Please try again.');
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            await confirmationResult.confirm(otp);
            
            // Check if user already exists in database
            const db = getDatabase();
            const userRef = ref(db, `Matrimony/users/${phoneNumber}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                
                // Check if user has complete profile data
                const hasCompleteProfile = (
                    userData.personal?.firstName &&
                    userData.personal?.lastName &&
                    userData.personal?.dateOfBirth &&
                    userData.personal?.heightFeet &&
                    userData.personal?.heightInches &&
                    userData.personal?.maritalStatus &&
                    userData.personal?.caste &&
                    userData.personal?.religion &&
                    userData.educational?.education &&
                    userData.educational?.profession &&
                    userData.educational?.currentPlace &&
                    userData.educational?.nativePlace &&
                    userData.educational?.taluka &&
                    userData.educational?.district &&
                    userData.photos &&
                    userData.photos.length > 0 &&
                    userData.biodata
                );

                if (hasCompleteProfile) {
                    // User has complete profile - login directly
                    // Save to localStorage with correct key that AuthContext expects
                    localStorage.setItem('matrimony_user', JSON.stringify({
                        phoneNumber: `+91${phoneNumber}`,
                        id: `user_${phoneNumber}`
                    }));
                    
                    onRegistrationComplete({ phoneNumber, ...userData });
                    // Don't call handleClose() - page will reload
                } else {
                    // User exists but profile incomplete - show registration form
                    setStep('registration');
                    // Pre-fill existing data if any
                    setFormData(prev => ({
                        ...prev,
                        firstName: userData.personal?.firstName || '',
                        middleName: userData.personal?.middleName || '',
                        lastName: userData.personal?.lastName || '',
                        dateOfBirth: userData.personal?.dateOfBirth || '',
                        birthTime: userData.personal?.birthTime || '',
                        heightFeet: userData.personal?.heightFeet || '',
                        heightInches: userData.personal?.heightInches || '',
                        maritalStatus: userData.personal?.maritalStatus || '',
                        gender: userData.personal?.gender || 'Female',
                        religion: userData.personal?.religion || 'Hindu',
                        caste: userData.personal?.caste || 'Maratha',
                        interCasteAllowed: userData.personal?.interCasteAllowed || '',
                        education: userData.educational?.education || '',
                        profession: userData.educational?.profession || '',
                        currentPlace: userData.educational?.currentPlace || '',
                        nativePlace: userData.educational?.nativePlace || '',
                        taluka: userData.educational?.taluka || '',
                        district: userData.educational?.district || 'Sangli',
                        whatsappNumber: userData.contact?.whatsappNumber || phoneNumber,
                    }));
                }
            } else {
                // User doesn't exist - proceed to registration
                setStep('registration');
                setFormData(prev => ({ ...prev, whatsappNumber: phoneNumber }));
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError('Invalid OTP. Please try again.');
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file changes
    const handleFileChange = (type, e) => {
        const newFiles = Array.from(e.target.files);

        if (type === 'photos') {
            const combinedFiles = [...formData.photos, ...newFiles];

            if (combinedFiles.length > 5) {
                setError('Maximum 5 photos allowed');
                return;
            }

            setFormData(prev => ({ ...prev, photos: combinedFiles }));
            setError('');
        } else if (type === 'biodata') {
            setFormData(prev => ({ ...prev, biodata: newFiles[0] }));
            setError('');
        }
    };

    // Validate registration form
    const validateForm = () => {
        if (!formData.firstName.trim()) return 'First name is required';
        if (!formData.lastName.trim()) return 'Last name is required';
        if (!formData.dateOfBirth) return 'Date of birth is required';
        if (!formData.heightFeet || formData.heightFeet < 1 || formData.heightFeet > 10) return 'Height (feet) must be between 1-10';
        if (!formData.heightInches || formData.heightInches < 0 || formData.heightInches > 11) return 'Height (inches) must be between 0-11';
        if (!formData.maritalStatus) return 'Marital status is required';
        if (!formData.religion) return 'Religion is required';
        if (!formData.caste) return 'Caste is required';
        if (!formData.interCasteAllowed) return 'Inter-caste preference is required';
        if (!formData.education) return 'Education is required';
        if (!formData.profession) return 'Profession is required';
        if (!formData.currentPlace.trim()) return 'Current place is required';
        if (!formData.nativePlace.trim()) return 'Native place is required';
        if (!formData.taluka) return 'Taluka is required';
        if (!formData.whatsappNumber) return 'WhatsApp number is required';
        if (formData.photos.length === 0) return 'At least one photo is required';
        if (!formData.biodata) return 'Biodata photo is required';
        return null;
    };

    // Submit registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const db = getDatabase();
            const storage = getStorage();
            const userKey = phoneNumber;

            // Upload photos and biodata
            const totalFiles = formData.photos.length + (formData.biodata ? 1 : 0);
            let uploadedFiles = 0;

            const photoUrls = await Promise.all(
                formData.photos.map(async (file, index) => {
                    const photoRef = storageRef(storage, `Matrimony/users/${userKey}/photos/photo_${index}_${Date.now()}`);
                    await uploadBytes(photoRef, file);
                    uploadedFiles++;
                    setUploadProgress((uploadedFiles / totalFiles) * 100);
                    return getDownloadURL(photoRef);
                })
            );

            // Upload biodata
            let biodataUrl = null;
            if (formData.biodata) {
                const biodataRef = storageRef(storage, `Matrimony/users/${userKey}/biodata/biodata_${Date.now()}`);
                await uploadBytes(biodataRef, formData.biodata);
                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
                biodataUrl = await getDownloadURL(biodataRef);
            }

            // Save user data to Firebase with same structure as RegistrationForm
            const userRef = ref(db, `Matrimony/users/${userKey}`);
            const userData = {
                personal: {
                    phoneNumber: phoneNumber,
                    firstName: formData.firstName,
                    middleName: formData.middleName,
                    lastName: formData.lastName,
                    dateOfBirth: formData.dateOfBirth,
                    birthTime: formData.birthTime,
                    heightFeet: formData.heightFeet,
                    heightInches: formData.heightInches,
                    maritalStatus: formData.maritalStatus,
                    gender: formData.gender,
                    religion: formData.religion,
                    caste: formData.caste,
                    interCasteAllowed: formData.interCasteAllowed,
                },
                educational: {
                    education: formData.education,
                    profession: formData.profession,
                    currentPlace: formData.currentPlace,
                    nativePlace: formData.nativePlace,
                    taluka: formData.taluka,
                    district: formData.district,
                },
                contact: {
                    whatsappNumber: formData.whatsappNumber,
                    callingNumber: phoneNumber,
                },
                photos: photoUrls,
                biodata: biodataUrl,
                timestamp: Date.now(),
                registeredViaUserFlow: true
            };

            await set(userRef, userData);

            // Save to localStorage with correct key that AuthContext expects
            localStorage.setItem('matrimony_user', JSON.stringify({
                phoneNumber: `+91${phoneNumber}`,
                id: `user_${phoneNumber}`
            }));
            
            onRegistrationComplete({ phoneNumber, ...userData });
            // Don't call handleClose() - page will reload
        } catch (error) {
            console.error('Error saving registration:', error);
            setError(`Error saving data: ${error.message}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        setPhoneNumber('');
        setOtp('');
        setStep('phone');
        setError('');
        setFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            dateOfBirth: '',
            birthTime: '',
            heightFeet: '',
            heightInches: '',
            maritalStatus: '',
            gender: '',
            religion: '',
            caste: '',
            interCasteAllowed: '',
            education: '',
            profession: '',
            currentPlace: '',
            nativePlace: '',
            taluka: '',
            district: '',
            whatsappNumber: '',
            photos: [],
            biodata: null,
        });
        onClose();
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div id="recaptcha-container"></div>
            
            <div style={{
                ...styles.modal,
                maxWidth: step === 'registration' ? '900px' : '450px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} style={styles.closeButton}>
                    <FaTimes />
                </button>

                {/* Phone Number Step */}
                {step === 'phone' && (
                    <>
                        <div style={styles.header}>
                            <h2 style={styles.title}>Login / Register</h2>
                            <p style={styles.subtitle}>Enter your phone number to get started</p>
                        </div>

                        <form onSubmit={handleSendOTP} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit phone number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    style={{...styles.input, paddingLeft: '1rem'}}
                                    maxLength="10"
                                    required
                                />
                            </div>

                            {error && <div style={styles.error}>{error}</div>}

                            <button type="submit" style={styles.submitButton} disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <div style={styles.note}>
                                <strong>Note:</strong> If you're already registered, you'll be logged in automatically.
                            </div>
                        </form>
                    </>
                )}

                {/* OTP Verification Step */}
                {step === 'otp' && (
                    <>
                        <div style={styles.header}>
                            <h2 style={styles.title}>Verify OTP</h2>
                            <p style={styles.subtitle}>Enter the OTP sent to +91{phoneNumber}</p>
                        </div>

                        <form onSubmit={handleVerifyOTP} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    style={{...styles.input, paddingLeft: '1rem'}}
                                    maxLength="6"
                                    required
                                />
                            </div>

                            {error && <div style={styles.error}>{error}</div>}

                            <button type="submit" style={styles.submitButton} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button 
                                type="button" 
                                onClick={() => setStep('phone')} 
                                style={styles.backButton}
                            >
                                Change Phone Number
                            </button>
                        </form>
                    </>
                )}

                {/* Registration Form Step */}
                {step === 'registration' && (
                    <>
                        {loading && (
                            <div style={styles.loadingOverlay}>
                                <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Uploading Data...</h2>
                                <div style={styles.progressBarContainer}>
                                    <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }}></div>
                                </div>
                                <p style={{ fontSize: '1.1rem' }}>{Math.round(uploadProgress)}% Complete</p>
                            </div>
                        )}

                        <div style={styles.header}>
                            <h2 style={styles.title}>Complete Your Profile</h2>
                            <p style={styles.subtitle}>Fill in your details to start browsing</p>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            {/* Personal Details */}
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Personal Details</h3>
                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Middle Name</label>
                                        <input
                                            type="text"
                                            name="middleName"
                                            value={formData.middleName}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Date of Birth *</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Birth Time</label>
                                        <input
                                            type="time"
                                            name="birthTime"
                                            value={formData.birthTime}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Height (Feet) *</label>
                                        <input
                                            type="number"
                                            name="heightFeet"
                                            value={formData.heightFeet}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            min="1"
                                            max="10"
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Height (Inches) *</label>
                                        <input
                                            type="number"
                                            name="heightInches"
                                            value={formData.heightInches}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            min="0"
                                            max="11"
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Marital Status *</label>
                                        <select
                                            name="maritalStatus"
                                            value={formData.maritalStatus}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Gender *</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Religion *</label>
                                        <select
                                            name="religion"
                                            value={formData.religion}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="Hindu">Hindu</option>
                                            <option value="Muslim">Muslim</option>
                                            <option value="Christian">Christian</option>
                                            <option value="Sikh">Sikh</option>
                                            <option value="Jain">Jain</option>
                                            <option value="Buddhist">Buddhist</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Caste *</label>
                                        <select
                                            name="caste"
                                            value={formData.caste}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="Maratha">Maratha</option>
                                            <option value="Brahmin">Brahmin</option>
                                            <option value="Kunbi">Kunbi</option>
                                            <option value="Mali">Mali</option>
                                            <option value="Dhangar">Dhangar</option>
                                            <option value="Chambhar">Chambhar</option>
                                            <option value="Mahar">Mahar</option>
                                            <option value="Mang">Mang</option>
                                            <option value="Matang">Matang</option>
                                            <option value="Vanjari">Vanjari</option>
                                            <option value="Lingayat">Lingayat</option>
                                            <option value="Jain">Jain</option>
                                            <option value="Buddhist">Buddhist</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Inter-caste Allowed *</label>
                                        <select
                                            name="interCasteAllowed"
                                            value={formData.interCasteAllowed}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Educational Details */}
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Educational & Professional Details</h3>
                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Education *</label>
                                        <input
                                            type="text"
                                            name="education"
                                            value={formData.education}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            placeholder="e.g., B.Tech, MBA"
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Profession *</label>
                                        <input
                                            type="text"
                                            name="profession"
                                            value={formData.profession}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            placeholder="e.g., Software Engineer"
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Current Place *</label>
                                        <input
                                            type="text"
                                            name="currentPlace"
                                            value={formData.currentPlace}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            placeholder="e.g., Pune"
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Native Place *</label>
                                        <input
                                            type="text"
                                            name="nativePlace"
                                            value={formData.nativePlace}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            placeholder="e.g., Sangli"
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Taluka *</label>
                                        <input
                                            type="text"
                                            name="taluka"
                                            value={formData.taluka}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>District *</label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="Ahmednagar">Ahmednagar</option>
                                            <option value="Akola">Akola</option>
                                            <option value="Amravati">Amravati</option>
                                            <option value="Aurangabad">Aurangabad</option>
                                            <option value="Beed">Beed</option>
                                            <option value="Bhandara">Bhandara</option>
                                            <option value="Buldhana">Buldhana</option>
                                            <option value="Chandrapur">Chandrapur</option>
                                            <option value="Dhule">Dhule</option>
                                            <option value="Gadchiroli">Gadchiroli</option>
                                            <option value="Gondia">Gondia</option>
                                            <option value="Hingoli">Hingoli</option>
                                            <option value="Jalgaon">Jalgaon</option>
                                            <option value="Jalna">Jalna</option>
                                            <option value="Kolhapur">Kolhapur</option>
                                            <option value="Latur">Latur</option>
                                            <option value="Mumbai City">Mumbai City</option>
                                            <option value="Mumbai Suburban">Mumbai Suburban</option>
                                            <option value="Nagpur">Nagpur</option>
                                            <option value="Nanded">Nanded</option>
                                            <option value="Nandurbar">Nandurbar</option>
                                            <option value="Nashik">Nashik</option>
                                            <option value="Osmanabad">Osmanabad</option>
                                            <option value="Palghar">Palghar</option>
                                            <option value="Parbhani">Parbhani</option>
                                            <option value="Pune">Pune</option>
                                            <option value="Raigad">Raigad</option>
                                            <option value="Ratnagiri">Ratnagiri</option>
                                            <option value="Sangli">Sangli</option>
                                            <option value="Satara">Satara</option>
                                            <option value="Sindhudurg">Sindhudurg</option>
                                            <option value="Solapur">Solapur</option>
                                            <option value="Thane">Thane</option>
                                            <option value="Wardha">Wardha</option>
                                            <option value="Washim">Washim</option>
                                            <option value="Yavatmal">Yavatmal</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>WhatsApp Number *</label>
                                        <input
                                            type="tel"
                                            name="whatsappNumber"
                                            value={formData.whatsappNumber}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            maxLength="10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Photos */}
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Photos (Max 5) *</h3>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleFileChange('photos', e)}
                                    style={styles.fileInput}
                                />
                                {formData.photos.length > 0 && (
                                    <div style={styles.photoPreview}>
                                        {formData.photos.map((file, index) => (
                                            <div key={index} style={styles.photoItem}>
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${index + 1}`}
                                                    style={styles.previewImage}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Biodata */}
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Biodata Photo *</h3>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('biodata', e)}
                                    style={styles.fileInput}
                                />
                                {formData.biodata && (
                                    <div style={styles.photoPreview}>
                                        <div style={styles.photoItem}>
                                            <img
                                                src={URL.createObjectURL(formData.biodata)}
                                                alt="Biodata Preview"
                                                style={styles.previewImage}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && <div style={styles.error}>{error}</div>}

                            <button type="submit" style={styles.submitButton} disabled={loading}>
                                {loading ? 'Submitting...' : 'Complete Registration'}
                            </button>
                        </form>
                    </>
                )}
            </div>
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '1rem'
    },
    modal: {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    closeButton: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#64748b',
        transition: 'color 0.3s ease',
        zIndex: 10
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '0.5rem'
    },
    subtitle: {
        color: '#64748b',
        fontSize: '1rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    inputGroup: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#1e293b'
    },
    input: {
        width: '100%',
        padding: '1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s ease',
        boxSizing: 'border-box'
    },
    error: {
        background: '#fee2e2',
        color: '#dc2626',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        textAlign: 'center'
    },
    submitButton: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: '1rem',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    backButton: {
        background: 'none',
        color: '#6a11cb',
        border: '2px solid #6a11cb',
        padding: '0.75rem',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    note: {
        background: '#fef3c7',
        color: '#92400e',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        textAlign: 'center'
    },
    section: {
        marginBottom: '1.5rem'
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #e2e8f0'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
        gap: '1rem'
    },
    fileInput: {
        padding: '0.75rem',
        border: '2px dashed #6a11cb',
        borderRadius: '10px',
        cursor: 'pointer'
    },
    photoPreview: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '1rem'
    },
    photoItem: {
        position: 'relative'
    },
    previewImage: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '10px',
        border: '2px solid #6a11cb'
    },
    loadingOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        color: 'white',
    },
    progressBarContainer: {
        width: '80%',
        maxWidth: '400px',
        backgroundColor: '#e0e0e0',
        borderRadius: '10px',
        margin: '20px 0',
        overflow: 'hidden',
    },
    progressBar: {
        height: '20px',
        backgroundColor: '#6a11cb',
        transition: 'width 0.3s ease',
    }
};

export default UserRegistrationModal;
