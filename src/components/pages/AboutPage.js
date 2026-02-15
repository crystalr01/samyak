import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaUsers, FaShieldAlt, FaStar, FaArrowLeft, FaCheckCircle, FaAward, FaGlobe } from 'react-icons/fa';

const AboutPage = () => {
    const navigate = useNavigate();

    const values = [
        {
            icon: <FaHeart />,
            title: "Trust & Authenticity",
            description: "Every profile is manually verified to ensure genuine connections and authentic relationships."
        },
        {
            icon: <FaShieldAlt />,
            title: "Privacy & Security",
            description: "Your personal information is protected with industry-leading security measures and privacy controls."
        },
        {
            icon: <FaUsers />,
            title: "Community Focus",
            description: "We understand the importance of cultural values and family traditions in Indian marriages."
        },
        {
            icon: <FaStar />,
            title: "Excellence",
            description: "Committed to providing the best matrimony experience with continuous innovation and improvement."
        }
    ];

    const milestones = [
        { year: "2009", event: "Samyak Shadi Founded", description: "Started with a vision to revolutionize Indian matrimony" },
        { year: "2012", event: "10,000 Success Stories", description: "Reached our first major milestone of happy couples" },
        { year: "2015", event: "Mobile App Launch", description: "Made matrimony accessible on mobile devices" },
        { year: "2018", event: "AI Matching Algorithm", description: "Introduced advanced AI for better compatibility matching" },
        { year: "2020", event: "Video Calling Feature", description: "Added secure video calling during pandemic" },
        { year: "2024", event: "50,000+ Happy Couples", description: "Celebrating over 50,000 successful marriages" }
    ];

    const team = [
        {
            name: "Dr. Rajesh Sharma",
            role: "Founder & CEO",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            description: "15+ years in matrimony industry with a vision to transform how people find life partners."
        },
        {
            name: "Priya Patel",
            role: "Head of Customer Success",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            description: "Ensuring every member has the best experience in their journey to find love."
        },
        {
            name: "Amit Kumar",
            role: "Chief Technology Officer",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
            description: "Leading our technology innovations to create better matching experiences."
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
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        About Samyak Shadi
                    </h1>
                    <p style={{
                        fontSize: '1.3rem',
                        marginBottom: '2rem',
                        opacity: 0.9,
                        lineHeight: 1.6
                    }}>
                        Connecting hearts, building families, and creating lifelong happiness since 2009
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section style={{ padding: '5rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '3rem',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Our Mission
                            </h2>
                            <p style={{
                                fontSize: '1.2rem',
                                color: '#64748b',
                                lineHeight: 1.8,
                                marginBottom: '2rem'
                            }}>
                                At Samyak Shadi, we believe that everyone deserves to find their perfect life partner. Our mission is to 
                                create a safe, trusted, and efficient platform that respects Indian traditions while embracing modern 
                                technology to help people find meaningful relationships.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                    <span style={{ color: '#374151' }}>Verified and authentic profiles</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                    <span style={{ color: '#374151' }}>Advanced privacy and security measures</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                    <span style={{ color: '#374151' }}>Personalized matching algorithm</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                    <span style={{ color: '#374151' }}>24/7 customer support</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                                alt="Our Mission"
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    borderRadius: '15px',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section style={{
                padding: '5rem 2rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Our Core Values
                    </h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        {values.map((value, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'white',
                                    padding: '2rem',
                                    borderRadius: '15px',
                                    textAlign: 'center',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    fontSize: '3rem',
                                    color: '#6a11cb',
                                    marginBottom: '1rem'
                                }}>
                                    {value.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem',
                                    color: '#1e293b'
                                }}>
                                    {value.title}
                                </h3>
                                <p style={{
                                    color: '#64748b',
                                    lineHeight: 1.6
                                }}>
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section style={{ padding: '5rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Our Journey
                    </h2>
                    
                    <div style={{ position: 'relative' }}>
                        {/* Timeline line */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                            transform: 'translateX(-50%)'
                        }} />
                        
                        {milestones.map((milestone, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '3rem',
                                    position: 'relative'
                                }}
                            >
                                {/* Timeline dot */}
                                <div style={{
                                    position: 'absolute',
                                    left: '50%',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                    transform: 'translateX(-50%)',
                                    zIndex: 1,
                                    border: '4px solid white',
                                    boxShadow: '0 0 0 4px rgba(106, 17, 203, 0.2)'
                                }} />
                                
                                {/* Content */}
                                <div style={{
                                    width: '45%',
                                    textAlign: index % 2 === 0 ? 'right' : 'left',
                                    marginLeft: index % 2 === 0 ? 0 : '55%'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                        padding: '1.5rem',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                                    }}>
                                        <div style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: '#6a11cb',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {milestone.year}
                                        </div>
                                        <h4 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            marginBottom: '0.5rem',
                                            color: '#1e293b'
                                        }}>
                                            {milestone.event}
                                        </h4>
                                        <p style={{
                                            color: '#64748b',
                                            margin: 0
                                        }}>
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section style={{
                padding: '5rem 2rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Meet Our Team
                    </h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {team.map((member, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'white',
                                    padding: '2rem',
                                    borderRadius: '15px',
                                    textAlign: 'center',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        marginBottom: '1rem',
                                        border: '4px solid #6a11cb'
                                    }}
                                />
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    color: '#1e293b'
                                }}>
                                    {member.name}
                                </h3>
                                <div style={{
                                    color: '#6a11cb',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem'
                                }}>
                                    {member.role}
                                </div>
                                <p style={{
                                    color: '#64748b',
                                    lineHeight: 1.6
                                }}>
                                    {member.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section style={{
                padding: '5rem 2rem',
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        marginBottom: '3rem'
                    }}>
                        Our Impact in Numbers
                    </h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem'
                    }}>
                        <div>
                            <FaHeart style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ff6b6b' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>50,000+</div>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Happy Marriages</p>
                        </div>
                        <div>
                            <FaUsers style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fbbf24' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>1M+</div>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Verified Profiles</p>
                        </div>
                        <div>
                            <FaGlobe style={{ fontSize: '3rem', marginBottom: '1rem', color: '#34d399' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>500+</div>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Cities Covered</p>
                        </div>
                        <div>
                            <FaAward style={{ fontSize: '3rem', marginBottom: '1rem', color: '#f472b6' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>15+</div>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Years of Excellence</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '5rem 2rem', background: 'white', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Ready to Find Your Perfect Match?
                    </h2>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#64748b',
                        marginBottom: '2rem',
                        lineHeight: 1.6
                    }}>
                        Join millions of people who trust Samyak Shadi to find their life partner. 
                        Start your journey today and become our next success story.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Start Your Journey
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

export default AboutPage;