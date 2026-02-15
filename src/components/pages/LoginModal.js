import React, { useState } from 'react';
import { FaTimes, FaPhone, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const { sendOTP, loginWithPhone } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        // Validate phone number
        if (phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        const result = await sendOTP(phoneNumber);
        setLoading(false);

        if (result.success) {
            setStep('otp');
            setError('');
        } else {
            setError(result.error || 'Failed to send OTP');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        const result = await loginWithPhone(phoneNumber, otp);
        setLoading(false);

        if (result.success) {
            onLoginSuccess && onLoginSuccess();
            onClose();
        } else {
            setError(result.error || 'Invalid OTP');
        }
    };

    const handleClose = () => {
        setPhoneNumber('');
        setOtp('');
        setStep('phone');
        setError('');
        onClose();
    };

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} style={styles.closeButton}>
                    <FaTimes />
                </button>

                <div style={styles.header}>
                    <h2 style={styles.title}>Login to Continue</h2>
                    <p style={styles.subtitle}>
                        {step === 'phone' 
                            ? 'Enter your phone number to receive OTP' 
                            : 'Enter the OTP sent to your phone'}
                    </p>
                </div>

                {step === 'phone' ? (
                    <form onSubmit={handleSendOTP} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <FaPhone style={styles.inputIcon} />
                            <input
                                type="tel"
                                placeholder="Enter 10-digit phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                style={styles.input}
                                maxLength="10"
                                required
                            />
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <button type="submit" style={styles.submitButton} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>

                        <div style={styles.demoNote}>
                            <strong>Demo Mode:</strong> Use any 10-digit number. OTP will be 123456
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <FaLock style={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                style={styles.input}
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

                        <div style={styles.demoNote}>
                            <strong>Demo OTP:</strong> 123456
                        </div>
                    </form>
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
        background: 'rgba(0, 0, 0, 0.7)',
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
        maxWidth: '450px',
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
        transition: 'color 0.3s ease'
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
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '1rem',
        color: '#6a11cb',
        fontSize: '1.2rem'
    },
    input: {
        width: '100%',
        padding: '1rem 1rem 1rem 3rem',
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
    demoNote: {
        background: '#fef3c7',
        color: '#92400e',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        textAlign: 'center'
    }
};

export default LoginModal;
