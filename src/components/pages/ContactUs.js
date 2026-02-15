import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, set } from 'firebase/database';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

const ContactUs = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        email: '',
        address: '',
        purpose: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.fullName.trim()) {
            setMessage('Please enter your full name');
            return;
        }
        if (!formData.mobile.trim() || formData.mobile.length !== 10) {
            setMessage('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setMessage('Please enter a valid email address');
            return;
        }
        if (!formData.address.trim()) {
            setMessage('Please enter your address');
            return;
        }
        if (!formData.purpose.trim()) {
            setMessage('Please enter your purpose/message');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            const db = getDatabase();
            const enquiriesRef = ref(db, 'Matrimony/ContactEnquiries');
            const newEnquiryRef = push(enquiriesRef);

            const enquiryData = {
                fullName: formData.fullName.trim(),
                mobile: formData.mobile.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                purpose: formData.purpose.trim(),
                submittedAt: Date.now(),
                submittedDate: new Date().toISOString(),
                status: 'pending'
            };

            await set(newEnquiryRef, enquiryData);

            setMessage('Thank you! Your enquiry has been submitted successfully. We will contact you soon.');
            
            // Reset form
            setFormData({
                fullName: '',
                mobile: '',
                email: '',
                address: '',
                purpose: ''
            });

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error submitting enquiry:', error);
            setMessage('Failed to submit enquiry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <button 
                    onClick={() => navigate('/')} 
                    style={styles.backButton}
                >
                    <FaArrowLeft /> Back to Home
                </button>
                <div style={{
                    ...styles.headerTitle,
                    display: window.innerWidth > 768 ? 'flex' : 'none'
                }}>
                    <img 
                        src={require('../../assets/img1.jpeg')} 
                        alt="Swrajya Sangam Logo" 
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '8px',
                            objectFit: 'cover',
                            marginRight: '0.75rem'
                        }} 
                    />
                    <span>Swrajya Sangam</span>
                </div>
            </header>

            {/* Main Content */}
            <div style={styles.content}>
                <div style={styles.formContainer}>
                    <div style={styles.formHeader}>
                        <h1 style={styles.title}>Contact Us</h1>
                        <p style={styles.subtitle}>
                            Have a question or need assistance? Fill out the form below and we'll get back to you soon.
                        </p>
                    </div>

                    {/* Success/Error Message */}
                    {message && (
                        <div style={{
                            ...styles.message,
                            background: message.includes('success') ? '#d4edda' : '#f8d7da',
                            color: message.includes('success') ? '#155724' : '#721c24',
                            borderColor: message.includes('success') ? '#c3e6cb' : '#f5c6cb'
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Enquiry Form */}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Full Name */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FaUser style={styles.icon} /> Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                style={styles.input}
                                required
                            />
                        </div>

                        {/* Mobile Number */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FaPhone style={styles.icon} /> Mobile Number *
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData(prev => ({ ...prev, mobile: value }));
                                }}
                                placeholder="Enter 10-digit mobile number"
                                style={styles.input}
                                maxLength="10"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FaEnvelope style={styles.icon} /> Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                style={styles.input}
                                required
                            />
                        </div>

                        {/* Address */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FaMapMarkerAlt style={styles.icon} /> Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your address"
                                style={styles.input}
                                required
                            />
                        </div>

                        {/* Purpose/Message */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Purpose / Message *
                            </label>
                            <textarea
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                placeholder="Please describe your enquiry or purpose..."
                                style={styles.textarea}
                                rows="5"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                ...styles.submitButton,
                                opacity: submitting ? 0.6 : 1,
                                cursor: submitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {submitting ? (
                                'Submitting...'
                            ) : (
                                <>
                                    <FaPaperPlane style={{ marginRight: '0.5rem' }} />
                                    Submit Enquiry
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>
                {`
                    input:focus, textarea:focus {
                        border-color: #6a11cb !important;
                        box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1) !important;
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        width: '100%'
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
        width: '100%',
        boxSizing: 'border-box'
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
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center'
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem',
        width: '100%',
        boxSizing: 'border-box'
    },
    formContainer: {
        background: 'white',
        borderRadius: '20px',
        padding: window.innerWidth > 768 ? '3rem' : '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        width: '100%',
        boxSizing: 'border-box'
    },
    formHeader: {
        textAlign: 'center',
        marginBottom: '3rem'
    },
    title: {
        fontSize: window.innerWidth > 768 ? '3rem' : '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        fontSize: window.innerWidth > 768 ? '1.2rem' : '1rem',
        color: '#64748b',
        lineHeight: 1.6
    },
    message: {
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        marginBottom: '2rem',
        border: '1px solid',
        fontSize: '1rem',
        fontWeight: '600'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%'
    },
    label: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    icon: {
        color: '#6a11cb',
        fontSize: '1rem'
    },
    input: {
        padding: '1rem 1.25rem',
        fontSize: '1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        boxSizing: 'border-box'
    },
    textarea: {
        padding: '1rem 1.25rem',
        fontSize: '1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: 'Arial, sans-serif',
        resize: 'vertical',
        minHeight: '120px',
        width: '100%',
        boxSizing: 'border-box'
    },
    submitButton: {
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        border: 'none',
        padding: '1.25rem 2rem',
        fontSize: '1.2rem',
        borderRadius: '10px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
        marginTop: '1rem',
        width: '100%'
    }
};

export default ContactUs;
