import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, set } from 'firebase/database';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowLeft, FaBriefcase, FaRupeeSign, FaUsers, FaPercentage, FaHome, FaCheckCircle } from 'react-icons/fa';

const Careers = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        state: '',
        experience: '',
        qualification: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const channelPartnerPlans = [
        {
            id: 'basic',
            name: 'Basic Plan',
            registrationFees: 999,
            commissionPerProfile: 10,
            membershipCommission: 5,
            color: '#94a3b8',
            icon: '🥉'
        },
        {
            id: 'standard',
            name: 'Standard Plan',
            registrationFees: 4999,
            commissionPerProfile: 20,
            membershipCommission: 15,
            color: '#3b82f6',
            icon: '🥈',
            popular: true
        },
        {
            id: 'premium',
            name: 'Premium Plan',
            registrationFees: 9999,
            commissionPerProfile: 25,
            membershipCommission: 25,
            color: '#fbbf24',
            icon: '🥇'
        }
    ];

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

        setSubmitting(true);
        setMessage('');

        try {
            const db = getDatabase();
            const applicationsRef = ref(db, 'Matrimony/CareerApplications');
            const newApplicationRef = push(applicationsRef);

            const applicationData = {
                fullName: formData.fullName.trim(),
                mobile: formData.mobile.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                experience: formData.experience.trim(),
                qualification: formData.qualification.trim(),
                message: formData.message.trim(),
                selectedPlan: selectedPlan ? channelPartnerPlans.find(p => p.id === selectedPlan)?.name : 'Not selected',
                submittedAt: Date.now(),
                submittedDate: new Date().toISOString(),
                status: 'pending'
            };

            await set(newApplicationRef, applicationData);

            setMessage('Thank you! Your application has been submitted successfully. We will contact you soon.');
            
            // Reset form
            setFormData({
                fullName: '',
                mobile: '',
                email: '',
                address: '',
                city: '',
                state: '',
                experience: '',
                qualification: '',
                message: ''
            });
            setSelectedPlan(null);

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error submitting application:', error);
            setMessage('Failed to submit application. Please try again.');
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
                {/* Page Header */}
                <div style={styles.pageHeader}>
                    <h1 style={styles.mainTitle}>Join Our Team</h1>
                    <p style={styles.mainSubtitle}>
                        Become a Channel Partner and earn attractive commissions. Work from home is also available!
                    </p>
                </div>

                {/* Channel Partner Plans */}
                <div style={styles.plansSection}>
                    <h2 style={styles.sectionTitle}>Channel Partner Plans</h2>
                    <div style={styles.plansGrid}>
                        {channelPartnerPlans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                style={{
                                    ...styles.planCard,
                                    borderColor: selectedPlan === plan.id ? plan.color : '#e2e8f0',
                                    transform: selectedPlan === plan.id ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: selectedPlan === plan.id ? `0 10px 30px ${plan.color}40` : '0 4px 15px rgba(0,0,0,0.1)'
                                }}
                            >
                                {plan.popular && (
                                    <div style={{...styles.popularBadge, background: plan.color}}>
                                        Most Popular
                                    </div>
                                )}
                                
                                {selectedPlan === plan.id && (
                                    <div style={styles.selectedBadge}>
                                        <FaCheckCircle /> Selected
                                    </div>
                                )}
                                
                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>
                                    {plan.icon}
                                </div>
                                
                                <h3 style={styles.planTitle}>{plan.name}</h3>
                                
                                <div style={styles.registrationFees}>
                                    <FaRupeeSign style={{fontSize: '1.2rem'}} />
                                    <span style={{fontSize: '2rem', fontWeight: 'bold'}}>{plan.registrationFees}</span>
                                    <span style={{fontSize: '0.9rem', color: '#64748b'}}>Registration Fees</span>
                                </div>
                                
                                <div style={styles.benefits}>
                                    <div style={styles.benefit}>
                                        <FaUsers style={{color: plan.color}} />
                                        <div>
                                            <strong>Rs. {plan.commissionPerProfile}/-</strong>
                                            <p>Per new authentic profile onboarding</p>
                                        </div>
                                    </div>
                                    <div style={styles.benefit}>
                                        <FaPercentage style={{color: plan.color}} />
                                        <div>
                                            <strong>{plan.membershipCommission}%</strong>
                                            <p>Per profile membership payment</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Work From Home Banner */}
                <div style={styles.wfhBanner}>
                    <FaHome style={{fontSize: '2.5rem', color: '#10b981'}} />
                    <div>
                        <h3 style={{margin: 0, fontSize: '1.5rem', color: '#1e293b'}}>Work From Home Available</h3>
                        <p style={{margin: '0.5rem 0 0 0', color: '#64748b'}}>
                            Flexible working hours and location. Earn from the comfort of your home!
                        </p>
                    </div>
                </div>

                {/* Application Form */}
                <div style={styles.formContainer}>
                    <div style={styles.formHeader}>
                        <h2 style={styles.title}>Apply Now</h2>
                        <p style={styles.subtitle}>
                            Share your latest updated biodata and we'll get back to you soon.
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

                    {/* Application Form */}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formRow}>
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
                        </div>

                        <div style={styles.formRow}>
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

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaMapMarkerAlt style={styles.icon} /> City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter your city"
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter your state"
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaBriefcase style={styles.icon} /> Experience
                                </label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    placeholder="e.g., 2 years in sales"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Qualification *
                            </label>
                            <input
                                type="text"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                placeholder="Enter your educational qualification"
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Address *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your complete address"
                                style={styles.textarea}
                                rows="2"
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Additional Information / Message
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Tell us about yourself, your interest in this opportunity, or any questions..."
                                style={styles.textarea}
                                rows="4"
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
                            {submitting ? 'Submitting...' : 'Submit Application'}
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem',
        width: '100%',
        boxSizing: 'border-box'
    },
    pageHeader: {
        textAlign: 'center',
        marginBottom: '4rem'
    },
    mainTitle: {
        fontSize: window.innerWidth > 768 ? '3.5rem' : '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    mainSubtitle: {
        fontSize: window.innerWidth > 768 ? '1.3rem' : '1.1rem',
        color: '#64748b',
        lineHeight: 1.6
    },
    plansSection: {
        marginBottom: '4rem'
    },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: '3rem'
    },
    plansGrid: {
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
        gap: '2rem',
        marginBottom: '3rem'
    },
    planCard: {
        background: 'white',
        border: '3px solid',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        boxSizing: 'border-box'
    },
    popularBadge: {
        position: 'absolute',
        top: '-12px',
        right: '20px',
        color: '#fff',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold'
    },
    selectedBadge: {
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
        gap: '0.5rem'
    },
    planTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#1e293b'
    },
    registrationFees: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '15px'
    },
    benefits: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        textAlign: 'left'
    },
    benefit: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '10px',
        fontSize: window.innerWidth > 768 ? '1rem' : '0.9rem'
    },
    wfhBanner: {
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        padding: window.innerWidth > 768 ? '2rem' : '1.5rem',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        alignItems: 'center',
        gap: window.innerWidth > 768 ? '2rem' : '1rem',
        marginBottom: '4rem',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
        textAlign: window.innerWidth > 768 ? 'left' : 'center'
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
        fontSize: window.innerWidth > 768 ? '2.5rem' : '2rem',
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
    formRow: {
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
        gap: '2rem'
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
        boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
        marginTop: '1rem',
        width: '100%'
    }
};

export default Careers;
