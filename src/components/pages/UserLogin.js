import React, { useState } from 'react';
import logo from '../logo192.png';

const UserLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!email || !password) {
            setAlertMessage('Please enter both email and password.');
            return;
        }

        setLoading(true);
        setAlertMessage('');

        try {
            // Check credentials
            if (email === 'admin@swrajya.com' && password === 'Admin@9370') {
                // Store admin info with the phone number that App.js expects
                localStorage.setItem('matrimonyUserPhone', '9370329233');
                localStorage.setItem('matrimonyUserUid', 'admin_uid');
                localStorage.setItem('matrimonyUserRole', 'admin');
                
                // Also store in new format for consistency
                localStorage.setItem('matrimony_user', JSON.stringify({
                    phoneNumber: '9370329233',
                    id: 'user_9370329233',
                    email: 'admin@swrajya.com',
                    role: 'admin'
                }));
                
                setAlertMessage('Login successful! Welcome Admin.');
                
                console.log('Admin logged in successfully');
                
                // Redirect after short delay
                setTimeout(() => {
                    onLoginSuccess('admin');
                }, 1000);
            } else {
                setAlertMessage('Invalid email or password. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setAlertMessage('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            padding: '20px',
            boxSizing: 'border-box',
            width: '100vw',
            position: 'absolute',
            left: 0,
            top: 0,
        }}>
            <div style={{
                background: '#fff',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                width: '100%',
                maxWidth: '400px',
                boxSizing: 'border-box',
                margin: '0 auto',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src={logo} alt="Matrimony Logo" style={{ height: '64px', margin: '0 auto' }} />
                </div>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem',
                    textShadow: 'none',
                }}>
                    Admin Login
                </h2>
                <p style={{
                    textAlign: 'center',
                    color: '#64748b',
                    marginBottom: '1.5rem',
                    fontSize: '1rem',
                }}>
                    Enter your credentials to access admin panel
                </p>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#475569',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.3s ease',
                            }}
                            placeholder="admin@swrajya.com"
                            disabled={loading}
                            onFocus={(e) => (e.target.style.borderColor = '#2575fc')}
                            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#475569',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.3s ease',
                            }}
                            placeholder="Enter password"
                            disabled={loading}
                            onFocus={(e) => (e.target.style.borderColor = '#2575fc')}
                            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: loading ? '#ccc' : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.3s ease, transform 0.2s ease',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        }}
                        onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
                        onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {alertMessage && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: alertMessage.includes('success') ? '#d4edda' : '#f8d7da',
                        color: alertMessage.includes('success') ? '#155724' : '#721c24',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        border: `1px solid ${alertMessage.includes('success') ? '#c3e6cb' : '#f5c6cb'}`,
                    }}>
                        {alertMessage}
                    </div>
                )}
            </div>

            <style>
                {`
          @media (max-width: 768px) {
            div[style*="maxWidth: 400px"] {
              max-width: 90%;
              padding: 1.5rem;
            }
            h2[style*="fontSize: 1.75rem"] {
              font-size: 1.5rem;
            }
            img[style*="height: 64px"] {
              height: 48px;
            }
            input, button {
              font-size: 0.9rem !important;
              padding: 0.6rem !important;
            }
            p[style*="fontSize: 1rem"] {
              font-size: 0.9rem;
            }
          }
          @media (max-width: 480px) {
            div[style*="maxWidth: 400px"] {
              max-width: 95%;
              padding: 1rem;
            }
            h2[style*="fontSize: 1.75rem"] {
              font-size: 1.25rem;
            }
            img[style*="height: 64px"] {
              height: 40px;
            }
            input, button {
              font-size: 0.8rem !important;
              padding: 0.5rem !important;
            }
            p[style*="fontSize: 1rem"] {
              font-size: 0.8rem;
            }
          }
        `}
            </style>
        </div>
    );
};

export default UserLogin;
