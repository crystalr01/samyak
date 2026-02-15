import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaArrowLeft, FaShieldAlt, FaLock, FaEye, FaUserShield, FaDatabase, FaExclamationCircle } from 'react-icons/fa';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: <FaDatabase />,
            title: "Information We Collect",
            content: [
                "Personal information (name, age, contact details, location)",
                "Profile information (education, profession, family details, preferences)",
                "Photos and documents you upload to your profile",
                "Communication data and messages within the platform",
                "Usage data, device information, and analytics",
                "Payment information for premium services"
            ]
        },
        {
            icon: <FaEye />,
            title: "How We Use Your Information",
            content: [
                "To provide and maintain our matrimony service",
                "To match you with compatible profiles using our algorithm",
                "To communicate with you about our services and updates",
                "To improve our platform and enhance user experience",
                "To ensure safety, prevent fraud, and maintain security",
                "To provide customer support and resolve issues"
            ]
        },
        {
            icon: <FaUserShield />,
            title: "Information Sharing and Disclosure",
            content: [
                "We do not sell, trade, or rent your personal information to third parties",
                "Profile information is shared with other users as per your privacy settings",
                "We may share data with your explicit consent",
                "Legal compliance: We may disclose information to comply with legal obligations",
                "Service providers: Trusted partners who assist in our operations",
                "Safety: To protect our rights, users' safety, and prevent fraud"
            ]
        },
        {
            icon: <FaLock />,
            title: "Data Security and Protection",
            content: [
                "We implement industry-standard security measures to protect your data",
                "All data transmission is encrypted using SSL/TLS protocols",
                "Regular security audits and vulnerability assessments",
                "Secure data centers with restricted access and monitoring",
                "Employee training on data protection and privacy practices",
                "However, no method of transmission over the internet is 100% secure"
            ]
        },
        {
            icon: <FaShieldAlt />,
            title: "Your Privacy Rights and Controls",
            content: [
                "Access: Request a copy of your personal data",
                "Correction: Update or correct inaccurate information",
                "Deletion: Request deletion of your account and data",
                "Restriction: Limit how we process your data",
                "Portability: Request your data in a portable format",
                "Privacy settings: Control who can see your profile information"
            ]
        }
    ];

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white',
                padding: '1rem 0',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                marginRight: '1rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <FaArrowLeft />
                        </button>
                        <FaHeart style={{ fontSize: '2rem', marginRight: '0.5rem', color: '#ff6b6b' }} />
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Samyak Shadi</h1>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'white',
                            color: '#6a11cb',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '25px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Login
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white',
                padding: '8rem 2rem 4rem',
                textAlign: 'center',
                marginTop: '80px'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <FaShieldAlt style={{ fontSize: '4rem', marginBottom: '1rem', color: '#34d399' }} />
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        Privacy Policy
                    </h1>
                    <p style={{
                        fontSize: '1.3rem',
                        marginBottom: '1rem',
                        opacity: 0.9,
                        lineHeight: 1.6
                    }}>
                        Your privacy is our priority. Learn how we protect and handle your personal information.
                    </p>
                    <p style={{
                        fontSize: '1rem',
                        opacity: 0.8,
                        fontStyle: 'italic'
                    }}>
                        Last updated: January 2024
                    </p>
                </div>
            </section>

            {/* Important Notice */}
            <section style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                border: '1px solid #3b82f6',
                margin: '2rem auto',
                maxWidth: '1200px',
                borderRadius: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <FaExclamationCircle style={{ fontSize: '2rem', color: '#3b82f6', marginTop: '0.2rem' }} />
                    <div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            color: '#1e40af'
                        }}>
                            Your Privacy Matters
                        </h3>
                        <p style={{
                            color: '#1e40af',
                            lineHeight: 1.6,
                            margin: 0
                        }}>
                            At Samyak Shadi, we are committed to protecting your privacy and ensuring the security of your personal 
                            information. This policy explains how we collect, use, and safeguard your data when you use our matrimony platform.
                        </p>
                    </div>
                </div>
            </section>

            {/* Privacy Sections */}
            <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gap: '2rem'
                }}>
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                                padding: '2rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    fontSize: '2rem',
                                    color: '#6a11cb',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    padding: '1rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {section.icon}
                                </div>
                                <h2 style={{
                                    fontSize: '1.8rem',
                                    fontWeight: 'bold',
                                    color: '#1e293b',
                                    margin: 0
                                }}>
                                    {section.title}
                                </h2>
                            </div>
                            <div style={{ paddingLeft: '1rem' }}>
                                {section.content.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                            marginTop: '0.6rem',
                                            flexShrink: 0
                                        }} />
                                        <p style={{
                                            color: '#64748b',
                                            lineHeight: 1.7,
                                            margin: 0,
                                            fontSize: '1.1rem'
                                        }}>
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data Retention Section */}
            <section style={{
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                        padding: '2rem'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: '#1e293b',
                            textAlign: 'center'
                        }}>
                            Data Retention and Cookies
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem',
                                    color: '#6a11cb'
                                }}>
                                    Data Retention
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', color: '#64748b', lineHeight: 1.7 }}>
                                    <li>Active accounts: Data retained while account is active</li>
                                    <li>Inactive accounts: Data may be deleted after 2 years of inactivity</li>
                                    <li>Deleted accounts: Most data deleted within 30 days</li>
                                    <li>Legal requirements: Some data retained for compliance</li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem',
                                    color: '#6a11cb'
                                }}>
                                    Cookies and Tracking
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', color: '#64748b', lineHeight: 1.7 }}>
                                    <li>Essential cookies for platform functionality</li>
                                    <li>Analytics cookies to improve user experience</li>
                                    <li>Preference cookies to remember your settings</li>
                                    <li>You can manage cookie preferences in your browser</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section style={{
                padding: '3rem 2rem',
                background: 'white',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Questions About Your Privacy?
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#64748b',
                        marginBottom: '2rem',
                        lineHeight: 1.6
                    }}>
                        If you have any questions about this Privacy Policy or how we handle your data, 
                        please don't hesitate to contact our privacy team.
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            padding: '1.5rem',
                            borderRadius: '10px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                        }}>
                            <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>Privacy Officer</strong>
                            <br />
                            <span style={{ color: '#6a11cb' }}>privacy@samyakshadi.com</span>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            padding: '1.5rem',
                            borderRadius: '10px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                        }}>
                            <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>Support Team</strong>
                            <br />
                            <span style={{ color: '#6a11cb' }}>+91 9370329233</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Updates Notice */}
            <section style={{
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <FaShieldAlt style={{ fontSize: '3rem', marginBottom: '1rem', color: '#34d399' }} />
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}>
                        Policy Updates
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        marginBottom: '2rem',
                        opacity: 0.9,
                        lineHeight: 1.6
                    }}>
                        We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                        We will notify you of any material changes via email or prominent notice on our platform.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'white',
                            color: '#6a11cb',
                            border: 'none',
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Continue to Platform
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                background: '#1e293b',
                color: 'white',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <FaHeart style={{ fontSize: '2rem', marginRight: '0.5rem', color: '#ff6b6b' }} />
                        <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>Samyak Shadi</h3>
                    </div>
                    <p style={{ color: '#94a3b8', margin: 0 }}>
                        &copy; 2024 Samyak Shadi. All rights reserved. Made with ❤️ for bringing hearts together.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
