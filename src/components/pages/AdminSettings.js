import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';
import { FaQrcode, FaHeadset, FaSave, FaEdit, FaUndo, FaUpload, FaImage } from 'react-icons/fa';

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editMode, setEditMode] = useState({ qr: false, support: false });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // QR Data State
    const [qrData, setQrData] = useState({
        imageUrl: '',
        merchantName: '',
        upiId: '',
        lastUpdated: null
    });
    
    const [originalQrData, setOriginalQrData] = useState(null);
    
    // Support Data State
    const [supportData, setSupportData] = useState({
        email: '',
        phone: '',
        whatsapp: '',
        supportHours: '',
        lastUpdated: null
    });
    
    const [originalSupportData, setOriginalSupportData] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const db = getDatabase();
            
            // Fetch QR data
            const qrRef = ref(db, 'Matrimony/Qr');
            const qrSnapshot = await get(qrRef);
            if (qrSnapshot.exists()) {
                const data = qrSnapshot.val();
                setQrData(data);
                setOriginalQrData(data);
            }
            
            // Fetch Support data
            const supportRef = ref(db, 'Matrimony/Support');
            const supportSnapshot = await get(supportRef);
            if (supportSnapshot.exists()) {
                const data = supportSnapshot.val();
                setSupportData(data);
                setOriginalSupportData(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            alert('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleQrChange = (field, value) => {
        setQrData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToFirebase = async () => {
        if (!selectedFile) {
            alert('Please select an image first');
            return;
        }

        setUploadingImage(true);
        try {
            const timestamp = Date.now();
            const fileName = `qr-codes/qr_${timestamp}.${selectedFile.name.split('.').pop()}`;
            
            console.log('=== Upload Debug Info ===');
            console.log('Storage bucket:', storage.app.options.storageBucket);
            console.log('File name:', fileName);
            console.log('File size:', selectedFile.size);
            console.log('File type:', selectedFile.type);
            
            const imageRef = storageRef(storage, fileName);
            console.log('Storage ref created:', imageRef.fullPath);
            
            // Upload file to Firebase Storage
            console.log('Starting upload...');
            const uploadResult = await uploadBytes(imageRef, selectedFile);
            console.log('Upload successful:', uploadResult);
            
            // Get download URL from Firebase Storage
            const downloadURL = await getDownloadURL(imageRef);
            console.log('Download URL obtained:', downloadURL);
            
            // Update QR data with Firebase Storage download URL
            setQrData(prev => ({ ...prev, imageUrl: downloadURL }));
            setPreviewUrl(null);
            setSelectedFile(null);
            
            alert('Image uploaded to Firebase Storage successfully!');
        } catch (error) {
            console.error('=== Upload Error Details ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error name:', error.name);
            console.error('Full error:', JSON.stringify(error, null, 2));
            
            let errorMessage = 'Failed to upload image: ' + error.message;
            
            if (error.code === 'storage/unauthorized') {
                errorMessage = 'Firebase Storage Error: Unauthorized.\n\nPlease check:\n1. Storage is enabled in Firebase Console\n2. Storage Rules allow write access\n3. Go to Storage > Rules and set: allow read, write: if true;';
            } else if (error.code === 'storage/unknown') {
                errorMessage = 'Firebase Storage Error: Unknown error.\n\nThis usually means:\n1. Storage bucket does not exist\n2. CORS is not configured\n3. Storage is not enabled\n\nPlease enable Storage in Firebase Console first.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'CORS Error: Firebase Storage is not accessible.\n\nPlease:\n1. Enable Storage in Firebase Console\n2. Set Storage Rules to allow write\n3. Wait a few minutes for changes to propagate';
            }
            
            alert(errorMessage);
        } finally {
            setUploadingImage(false);
        }
    };

    const removeSelectedImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSupportChange = (field, value) => {
        setSupportData(prev => ({ ...prev, [field]: value }));
    };

    const saveQrData = async () => {
        if (!qrData.imageUrl || !qrData.merchantName || !qrData.upiId) {
            alert('Please fill all QR fields and upload an image');
            return;
        }

        if (!window.confirm('Save QR payment settings?')) {
            return;
        }

        setLoading(true);
        try {
            const db = getDatabase();
            const updatedData = {
                ...qrData,
                lastUpdated: Date.now()
            };
            
            await set(ref(db, 'Matrimony/Qr'), updatedData);
            
            setQrData(updatedData);
            setOriginalQrData(updatedData);
            setEditMode(prev => ({ ...prev, qr: false }));
            alert('QR settings saved successfully');
        } catch (error) {
            console.error('Error saving QR data:', error);
            alert('Failed to save QR settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSupportData = async () => {
        if (!supportData.email || !supportData.phone || !supportData.whatsapp || !supportData.supportHours) {
            alert('Please fill all support fields');
            return;
        }

        if (!window.confirm('Save support settings?')) {
            return;
        }

        setLoading(true);
        try {
            const db = getDatabase();
            const updatedData = {
                ...supportData,
                lastUpdated: Date.now()
            };
            
            await set(ref(db, 'Matrimony/Support'), updatedData);
            
            setSupportData(updatedData);
            setOriginalSupportData(updatedData);
            setEditMode(prev => ({ ...prev, support: false }));
            alert('Support settings saved successfully');
        } catch (error) {
            console.error('Error saving support data:', error);
            alert('Failed to save support settings');
        } finally {
            setLoading(false);
        }
    };

    const cancelQrEdit = () => {
        setQrData(originalQrData);
        setEditMode(prev => ({ ...prev, qr: false }));
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const cancelSupportEdit = () => {
        setSupportData(originalSupportData);
        setEditMode(prev => ({ ...prev, support: false }));
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Never';
        return new Date(timestamp).toLocaleString('en-IN', {
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
                <h1 style={styles.title}>Settings</h1>
                <p style={styles.subtitle}>Manage QR payment and support information</p>
            </div>

            {loading && (
                <div style={styles.loadingOverlay}>
                    <div style={styles.spinner}></div>
                </div>
            )}

            <div style={styles.content}>
                {/* QR Payment Settings */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionTitleContainer}>
                            <FaQrcode style={styles.sectionIcon} />
                            <h2 style={styles.sectionTitle}>QR Payment Settings</h2>
                        </div>
                        {!editMode.qr ? (
                            <button
                                onClick={() => setEditMode(prev => ({ ...prev, qr: true }))}
                                style={styles.editButton}
                                disabled={loading}
                            >
                                <FaEdit /> Edit
                            </button>
                        ) : (
                            <div style={styles.actionButtons}>
                                <button
                                    onClick={cancelQrEdit}
                                    style={styles.cancelButton}
                                    disabled={loading}
                                >
                                    <FaUndo /> Cancel
                                </button>
                                <button
                                    onClick={saveQrData}
                                    style={styles.saveButton}
                                    disabled={loading}
                                >
                                    <FaSave /> Save
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Merchant Name</label>
                            <input
                                type="text"
                                value={qrData.merchantName}
                                onChange={(e) => handleQrChange('merchantName', e.target.value)}
                                disabled={!editMode.qr}
                                style={{
                                    ...styles.input,
                                    ...(editMode.qr ? {} : styles.inputDisabled)
                                }}
                                placeholder="Samyak Shadi"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>UPI ID</label>
                            <input
                                type="text"
                                value={qrData.upiId}
                                onChange={(e) => handleQrChange('upiId', e.target.value)}
                                disabled={!editMode.qr}
                                style={{
                                    ...styles.input,
                                    ...(editMode.qr ? {} : styles.inputDisabled)
                                }}
                                placeholder="your-upi-id@paytm"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Last Updated</label>
                            <input
                                type="text"
                                value={formatDate(qrData.lastUpdated)}
                                disabled
                                style={styles.inputDisabled}
                            />
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    {editMode.qr && (
                        <div style={styles.uploadSection}>
                            <h3 style={styles.uploadTitle}>
                                <FaImage /> Upload QR Code Image
                            </h3>
                            
                            <div style={styles.uploadContainer}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={styles.fileInput}
                                    id="qr-file-input"
                                />
                                <label htmlFor="qr-file-input" style={styles.fileInputLabel}>
                                    <FaUpload /> Choose Image
                                </label>
                                
                                {selectedFile && (
                                    <div style={styles.selectedFileInfo}>
                                        <span>{selectedFile.name}</span>
                                        <button
                                            onClick={removeSelectedImage}
                                            style={styles.removeFileButton}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            {previewUrl && (
                                <div style={styles.previewContainer}>
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        style={styles.previewImage}
                                    />
                                    <button
                                        onClick={uploadImageToFirebase}
                                        style={styles.uploadButton}
                                        disabled={uploadingImage}
                                    >
                                        {uploadingImage ? 'Uploading to Firebase...' : <><FaUpload /> Upload to Firebase Storage</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {qrData.imageUrl && (
                        <div style={styles.previewSection}>
                            <h3 style={styles.previewTitle}>QR Code Preview</h3>
                            <img 
                                src={qrData.imageUrl} 
                                alt="QR Code" 
                                style={styles.qrPreview}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div style={{ ...styles.errorMessage, display: 'none' }}>
                                Failed to load QR code image
                            </div>
                        </div>
                    )}
                </div>

                {/* Support Settings */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionTitleContainer}>
                            <FaHeadset style={styles.sectionIcon} />
                            <h2 style={styles.sectionTitle}>Support Information</h2>
                        </div>
                        {!editMode.support ? (
                            <button
                                onClick={() => setEditMode(prev => ({ ...prev, support: true }))}
                                style={styles.editButton}
                                disabled={loading}
                            >
                                <FaEdit /> Edit
                            </button>
                        ) : (
                            <div style={styles.actionButtons}>
                                <button
                                    onClick={cancelSupportEdit}
                                    style={styles.cancelButton}
                                    disabled={loading}
                                >
                                    <FaUndo /> Cancel
                                </button>
                                <button
                                    onClick={saveSupportData}
                                    style={styles.saveButton}
                                    disabled={loading}
                                >
                                    <FaSave /> Save
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Support Email</label>
                            <input
                                type="email"
                                value={supportData.email}
                                onChange={(e) => handleSupportChange('email', e.target.value)}
                                disabled={!editMode.support}
                                style={{
                                    ...styles.input,
                                    ...(editMode.support ? {} : styles.inputDisabled)
                                }}
                                placeholder="support@samyakshadi.com"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Support Phone</label>
                            <input
                                type="tel"
                                value={supportData.phone}
                                onChange={(e) => handleSupportChange('phone', e.target.value.replace(/\D/g, ''))}
                                disabled={!editMode.support}
                                style={{
                                    ...styles.input,
                                    ...(editMode.support ? {} : styles.inputDisabled)
                                }}
                                placeholder="9370329233"
                                maxLength="10"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>WhatsApp Number</label>
                            <input
                                type="tel"
                                value={supportData.whatsapp}
                                onChange={(e) => handleSupportChange('whatsapp', e.target.value.replace(/\D/g, ''))}
                                disabled={!editMode.support}
                                style={{
                                    ...styles.input,
                                    ...(editMode.support ? {} : styles.inputDisabled)
                                }}
                                placeholder="9370329233"
                                maxLength="10"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Support Hours</label>
                            <input
                                type="text"
                                value={supportData.supportHours}
                                onChange={(e) => handleSupportChange('supportHours', e.target.value)}
                                disabled={!editMode.support}
                                style={{
                                    ...styles.input,
                                    ...(editMode.support ? {} : styles.inputDisabled)
                                }}
                                placeholder="9:00 AM - 9:00 PM (Mon-Sat)"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Last Updated</label>
                            <input
                                type="text"
                                value={formatDate(supportData.lastUpdated)}
                                disabled
                                style={styles.inputDisabled}
                            />
                        </div>
                    </div>
                </div>
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
    loadingOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #6a11cb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
    },
    section: {
        background: 'white',
        borderRadius: '15px',
        padding: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    sectionTitleContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    sectionIcon: {
        fontSize: '2rem',
        color: '#6a11cb'
    },
    sectionTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: 0
    },
    actionButtons: {
        display: 'flex',
        gap: '0.75rem'
    },
    editButton: {
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
    saveButton: {
        background: '#10b981',
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
    cancelButton: {
        background: '#64748b',
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
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#475569'
    },
    input: {
        padding: '0.75rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease'
    },
    inputDisabled: {
        background: '#f1f5f9',
        color: '#64748b',
        cursor: 'not-allowed',
        border: '2px solid #e2e8f0'
    },
    previewSection: {
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '2px solid #e2e8f0',
        textAlign: 'center'
    },
    previewTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem'
    },
    qrPreview: {
        maxWidth: '300px',
        maxHeight: '300px',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    errorMessage: {
        color: '#ef4444',
        padding: '1rem',
        background: '#fee2e2',
        borderRadius: '8px',
        marginTop: '1rem'
    },
    uploadSection: {
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '2px solid #e2e8f0'
    },
    uploadTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    uploadContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    fileInput: {
        display: 'none'
    },
    fileInputLabel: {
        background: '#6a11cb',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        border: 'none'
    },
    selectedFileInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: '#f1f5f9',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        border: '2px solid #e2e8f0'
    },
    removeFileButton: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: 'bold'
    },
    previewContainer: {
        marginTop: '1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
    },
    previewImage: {
        maxWidth: '300px',
        maxHeight: '300px',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    uploadButton: {
        background: '#10b981',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        fontSize: '1rem'
    }
};

export default AdminSettings;
