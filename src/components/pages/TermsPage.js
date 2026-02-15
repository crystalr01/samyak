import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const TermsPage = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: [
                "By accessing and using Samyak Shadi, you accept and agree to be bound by the terms and provision of this agreement.",
                "If you do not agree to abide by the above, please do not use this service.",
                "These terms apply to all visitors, users, and others who access or use the service."
            ]
        },
        {
            title: "2. User Accounts and Registration",
            content: [
                "You must provide accurate, current, and complete information during the registration process.",
                "You are responsible for safeguarding the password and all activities under your account.",
                "You must immediately notify us of any unauthorized use of your account.",
                "We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion."
            ]
        },
        {
            title: "3. User Conduct and Responsibilities",
            content: [
                "You agree to use the service only for lawful purposes and in accordance with these Terms.",
                "You will not upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, or defamatory.",
                "You will not impersonate any person or entity or falsely state your affiliation with any person or entity.",
                "You will not engage in any activity that interferes with or disrupts the service."
            ]
        },
        {
            title: "4. Profile Information and Verification",
            content: [
                "All profile information must be truthful, accurate, and up-to-date.",
                "We reserve the right to verify any information provided and may request additional documentation.",
                "False or misleading information may result in immediate account termination.",
                "You grant us the right to use your profile information for matching and promotional purposes."
            ]
        },
        {
            title: "5. Privacy and Data Protection",
            content: [
                "Your privacy is important to us. Please review our Privacy Policy for information on data collection and use.",
                "We implement appropriate security measures to protect your personal information.",
                "You control the visibility of your profile information through privacy settings.",
                "We may use aggregated, anonymized data for research and improvement purposes."
            ]
        },
        {
            title: "6. Communication Guidelines",
            content: [
                "All communications through our platform must be respectful and appropriate.",
                "Harassment, abuse, or inappropriate behavior will result in account suspension or termination.",
                "We reserve the right to monitor communications for safety and quality purposes.",
                "Users are encouraged to report any inappropriate behavior or content."
            ]
        },
        {
            title: "7. Payment and Subscription Terms",
            content: [
                "Subscription fees are charged in advance and are non-refundable except as required by law.",
                "We reserve the right to change subscription prices with 30 days notice to existing subscribers.",
                "Auto-renewal can be disabled in account settings before the renewal date.",
                "Refunds may be provided at our discretion for technical issues or service failures."
            ]
        },
        {
            title: "8. Intellectual Property Rights",
            content: [
                "The service and its original content, features, and functionality are owned by Samyak Shadi.",
                "Our trademarks and trade dress may not be used without our prior written consent.",
                "You retain rights to content you upload but grant us a license to use it for service provision.",
                "You may not copy, modify, distribute, or reverse engineer any part of our service."
            ]
        },
        {
            title: "9. Disclaimers and Limitations",
            content: [
                "The service is provided 'as is' without warranties of any kind, either express or implied.",
                "We do not guarantee that you will find a suitable match through our service.",
                "We are not responsible for the conduct of users or the accuracy of their profile information.",
                "Our liability is limited to the amount paid for the service in the preceding 12 months."
            ]
        },
        {
            title: "10. Termination",
            content: [
                "You may terminate your account at any time by contacting customer support.",
                "We may terminate or suspend your account immediately for violations of these terms.",
                "Upon termination, your right to use the service ceases immediately.",
                "Provisions that should survive termination will remain in effect."
            ]
        },
        {
            title: "11. Governing Law and Dispute Resolution",
            content: [
                "These terms are governed by the laws of India without regard to conflict of law provisions.",
                "Any disputes will be resolved through binding arbitration in Mumbai, Maharashtra.",
                "You waive any right to participate in class-action lawsuits or class-wide arbitrations.",
                "Indian courts will have jurisdiction over any disputes not subject to arbitration."
            ]
        },
        {
            title: "12. Changes to Terms",
            content: [
                "We reserve the right to modify these terms at any time with notice to users.",
                "Continued use of the service after changes constitutes acceptance of new terms.",
                "Material changes will be communicated via email or prominent notice on the platform.",
                "You should review these terms periodically for updates."
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
                    <FaShieldAlt style={{ fontSize: '4rem', marginBottom: '1rem', color: '#fbbf24' }} />
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        Terms & Conditions
                    </h1>
                    <p style={{
                        fontSize: '1.3rem',
                        marginBottom: '1rem',
                        opacity: 0.9,
                        lineHeight: 1.6
                    }}>
                        Please read these terms and conditions carefully before using our service
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
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid #f59e0b',
                margin: '2rem auto',
                maxWidth: '1200px',
                borderRadius: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <FaExclamationTriangle style={{ fontSize: '2rem', color: '#f59e0b', marginTop: '0.2rem' }} />
                    <div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            color: '#92400e'
                        }}>
                            Important Notice
                        </h3>
                        <p style={{
                            color: '#92400e',
                            lineHeight: 1.6,
                            margin: 0
                        }}>
                            By using Samyak Shadi, you agree to these terms and conditions. These terms constitute a legally 
                            binding agreement between you and Samyak Shadi. Please read them carefully and contact us if you 
                            have any questions before proceeding.
                        </p>
                    </div>
                </div>
            </section>

            {/* Terms Content */}
            <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                }}>
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '2rem',
                                borderBottom: index < sections.length - 1 ? '1px solid #e2e8f0' : 'none'
                            }}
                        >
                            <h2 style={{
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                color: '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <FaCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                {section.title}
                            </h2>
                            <div style={{ paddingLeft: '2rem' }}>
                                {section.content.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.5rem',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#6a11cb',
                                            marginTop: '0.7rem',
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

            {/* Contact Section */}
            <section style={{
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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
                        Questions About These Terms?
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#64748b',
                        marginBottom: '2rem',
                        lineHeight: 1.6
                    }}>
                        If you have any questions about these Terms and Conditions, please don't hesitate to contact us. 
                        Our legal team is available to help clarify any concerns you may have.
                    </p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '1rem 1.5rem',
                            borderRadius: '10px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                        }}>
                            <strong style={{ color: '#1e293b' }}>Email:</strong>
                            <br />
                            <span style={{ color: '#6a11cb' }}>legal@samyakshadi.com</span>
                        </div>
                        <div style={{
                            background: 'white',
                            padding: '1rem 1.5rem',
                            borderRadius: '10px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                        }}>
                            <strong style={{ color: '#1e293b' }}>Phone:</strong>
                            <br />
                            <span style={{ color: '#6a11cb' }}>+91 9370329233</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agreement Section */}
            <section style={{
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}>
                        Ready to Get Started?
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        marginBottom: '2rem',
                        opacity: 0.9,
                        lineHeight: 1.6
                    }}>
                        By clicking "I Agree" and proceeding to create an account, you acknowledge that you have read, 
                        understood, and agree to be bound by these Terms and Conditions.
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
                        I Agree - Continue to Login
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

export default TermsPage;