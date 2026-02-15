import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaHeart, FaUsers, FaShieldAlt, FaStar, FaArrowRight, FaPhone, FaEnvelope, 
    FaMapMarkerAlt, FaAward, FaGlobe,
    FaBars, FaTimes,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import img1 from '../../assets/img1.jpeg';
import img2 from '../../assets/img2.jpeg';
import img3 from '../../assets/img3.jpeg';
import img4 from '../../assets/img4.jpeg';
import img5 from '../../assets/img5.jpeg';
import img6 from '../../assets/img6.jpeg';

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const heroSlides = [
        {
            title: "Find Your Perfect Life Partner",
            subtitle: "Join thousands of happy couples who found love through Swrajya Sangam",
            image: img1
        },
        {
            title: "Trusted Matrimony Platform",
            subtitle: "Safe, secure, and verified profiles for your peace of mind",
            image: img2
        },
        {
            title: "Begin Your Journey Today",
            subtitle: "Create your profile and start connecting with compatible matches",
            image: img3
        },
        {
            title: "Traditional Values, Modern Approach",
            subtitle: "Honoring traditions while embracing technology for better matches",
            image: img4
        },
        {
            title: "Your Happiness is Our Mission",
            subtitle: "Dedicated support team to help you find your soulmate",
            image: img5
        },
        {
            title: "Celebrate Love Together",
            subtitle: "Be part of our growing community of successful marriages",
            image: img6
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const features = [
        {
            icon: <FaUsers />,
            title: "10M+ Verified Profiles",
            description: "All profiles are manually verified for authenticity and safety"
        },
        {
            icon: <FaShieldAlt />,
            title: "100% Privacy Protected",
            description: "Your personal information is secure with advanced privacy controls"
        },
        {
            icon: <FaHeart />,
            title: "AI-Powered Matching",
            description: "Advanced algorithm to find your ideal partner"
        },
        {
            icon: <FaStar />,
            title: "50,000+ Success Stories",
            description: "Join thousands of couples who found love through our platform"
        }
    ];

    const stats = [
        { number: "10M+", label: "Verified Profiles", icon: <FaUsers /> },
        { number: "50K+", label: "Happy Marriages", icon: <FaHeart /> },
        { number: "500+", label: "Cities Covered", icon: <FaGlobe /> },
        { number: "15+", label: "Years of Trust", icon: <FaAward /> }
    ];

    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            lineHeight: 1.6,
            width: '100%',
            overflowX: 'hidden'
        }}>
            {/* Header */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#1e293b',
                padding: '0.5rem 0',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
                boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                            src={img1} 
                            alt="Swrajya Sangam Logo" 
                            style={{ 
                                width: '45px', 
                                height: '45px', 
                                borderRadius: '8px',
                                objectFit: 'cover'
                            }} 
                        />
                        <h1 style={{ 
                            margin: 0, 
                            fontSize: '1.6rem', 
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Swrajya Sangam
                        </h1>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav style={{ 
                        display: window.innerWidth > 768 ? 'flex' : 'none',
                        gap: '1.5rem', 
                        alignItems: 'center' 
                    }}>
                        <a href="#about" style={{ 
                            color: '#1e293b', 
                            textDecoration: 'none', 
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'color 0.3s ease'
                        }}>About</a>
                        <a href="#features" style={{ 
                            color: '#1e293b', 
                            textDecoration: 'none', 
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'color 0.3s ease'
                        }}>Features</a>
                        <button
                            onClick={() => navigate('/user-home')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1e293b', 
                                textDecoration: 'none', 
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'color 0.3s ease'
                            }}
                        >Browse Profiles</button>
                        <button
                            onClick={() => navigate('/careers')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1e293b', 
                                textDecoration: 'none', 
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'color 0.3s ease'
                            }}
                        >Careers</button>
                        <button
                            onClick={() => navigate('/contact')}
                            style={{
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            Contact Us
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            display: window.innerWidth <= 768 ? 'block' : 'none',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#1e293b',
                            cursor: 'pointer'
                        }}
                    >
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <a href="#about" onClick={() => setIsMenuOpen(false)} style={{ 
                            color: '#1e293b', 
                            textDecoration: 'none', 
                            fontWeight: '600',
                            fontSize: '1.1rem'
                        }}>About</a>
                        <a href="#features" onClick={() => setIsMenuOpen(false)} style={{ 
                            color: '#1e293b', 
                            textDecoration: 'none', 
                            fontWeight: '600',
                            fontSize: '1.1rem'
                        }}>Features</a>
                        <button
                            onClick={() => { navigate('/user-home'); setIsMenuOpen(false); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1e293b',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: 0
                            }}
                        >
                            Browse Profiles
                        </button>
                        <button
                            onClick={() => { navigate('/careers'); setIsMenuOpen(false); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1e293b',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: 0
                            }}
                        >
                            Careers
                        </button>
                        <button
                            onClick={() => { navigate('/contact'); setIsMenuOpen(false); }}
                            style={{
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: 'pointer'
                            }}
                        >
                            Contact Us
                        </button>
                    </div>
                )}
            </header>

            {/* Hero Section with Image Slider */}
            <section style={{
                height: '90vh',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '0'
            }}>
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `linear-gradient(rgba(106, 17, 203, 0.65), rgba(37, 117, 252, 0.65)), url(${slide.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: currentSlide === index ? 1 : 0,
                            transform: currentSlide === index ? 'scale(1)' : 'scale(1.1)',
                            transition: 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out'
                        }}
                    >
                        <div style={{
                            textAlign: 'center',
                            color: 'white',
                            maxWidth: '1000px',
                            padding: '0 2rem',
                            animation: currentSlide === index ? 'fadeInUp 1s ease-out' : 'none'
                        }}>
                            <h2 style={{
                                fontSize: window.innerWidth > 768 ? '4.5rem' : '2.5rem',
                                fontWeight: 'bold',
                                marginBottom: '2rem',
                                textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                                lineHeight: 1.2
                            }}>
                                {slide.title}
                            </h2>
                            <p style={{
                                fontSize: window.innerWidth > 768 ? '1.8rem' : '1.2rem',
                                marginBottom: '3.5rem',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                lineHeight: 1.4
                            }}>
                                {slide.subtitle}
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                marginBottom: '2rem'
                            }}>
                                <button
                                    onClick={() => navigate('/user-home')}
                                    style={{
                                        background: 'linear-gradient(45deg, #ff6b6b, #ffa500)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '1.2rem 2.5rem',
                                        fontSize: '1.3rem',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-3px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                                    }}
                                >
                                    Browse Profiles Free <FaArrowRight />
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '2px solid white',
                                        padding: '1.2rem 2.5rem',
                                        fontSize: '1.3rem',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.background = 'white';
                                        e.target.style.color = '#6a11cb';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.2)';
                                        e.target.style.color = 'white';
                                    }}
                                >
                                    <FaPhone /> Contact Us
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    style={{
                        position: 'absolute',
                        left: window.innerWidth > 768 ? '2rem' : '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid white',
                        color: 'white',
                        width: window.innerWidth > 768 ? '60px' : '50px',
                        height: window.innerWidth > 768 ? '60px' : '50px',
                        borderRadius: '50%',
                        fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        zIndex: 10
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#6a11cb';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.3)';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                    }}
                >
                    <FaChevronLeft />
                </button>
                <button
                    onClick={nextSlide}
                    style={{
                        position: 'absolute',
                        right: window.innerWidth > 768 ? '2rem' : '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid white',
                        color: 'white',
                        width: window.innerWidth > 768 ? '60px' : '50px',
                        height: window.innerWidth > 768 ? '60px' : '50px',
                        borderRadius: '50%',
                        fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        zIndex: 10
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#6a11cb';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.3)';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                    }}
                >
                    <FaChevronRight />
                </button>
                
                {/* Slide Indicators */}
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '0.75rem',
                    zIndex: 10
                }}>
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            style={{
                                width: currentSlide === index ? '40px' : '15px',
                                height: '15px',
                                borderRadius: '10px',
                                border: 'none',
                                background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section style={{
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '2rem',
                        textAlign: 'center'
                    }}>
                        {stats.map((stat, index) => (
                            <div key={index} style={{
                                padding: '2rem',
                                borderRadius: '15px',
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fbbf24' }}>
                                    {stat.icon}
                                </div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {stat.number}
                                </div>
                                <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{
                padding: '4rem 2rem',
                background: 'white'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: window.innerWidth > 768 ? '3.5rem' : '2.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Why Choose Swrajya Sangam?
                        </h2>
                        <p style={{
                            fontSize: '1.3rem',
                            color: '#64748b',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            India's most trusted matrimony platform
                        </p>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '3rem'
                    }}>
                        {features.map((feature, index) => (
                            <div key={index} style={{
                                padding: '2.5rem',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                border: '2px solid transparent'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(106, 17, 203, 0.2)';
                                e.currentTarget.style.borderColor = '#6a11cb';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                            >
                                <div style={{
                                    fontSize: '4rem',
                                    color: '#6a11cb',
                                    marginBottom: '1.5rem'
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1rem',
                                    color: '#1e293b'
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    fontSize: '1.1rem',
                                    color: '#64748b',
                                    lineHeight: 1.6
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" style={{
                padding: '4rem 2rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                        gap: '4rem',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: window.innerWidth > 768 ? '3.5rem' : '2.5rem',
                                fontWeight: 'bold',
                                marginBottom: '2rem',
                                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1.2
                            }}>
                                India's Most Trusted Matrimony Platform
                            </h2>
                            <p style={{
                                fontSize: '1.3rem',
                                color: '#64748b',
                                marginBottom: '2rem',
                                lineHeight: 1.8
                            }}>
                                Swrajya Sangam has been bringing hearts together since 2009. With our advanced AI matching, 
                                rigorous verification process, and commitment to privacy, we've helped over 50,000 couples 
                                find their perfect life partners.
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '2rem',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        color: '#6a11cb',
                                        marginBottom: '0.5rem'
                                    }}>15+</div>
                                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Years of Excellence</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        color: '#6a11cb',
                                        marginBottom: '0.5rem'
                                    }}>95%</div>
                                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Success Rate</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        color: '#6a11cb',
                                        marginBottom: '0.5rem'
                                    }}>24/7</div>
                                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Support</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={img5}
                                alt="Happy Couple"
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '4rem 2rem',
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: window.innerWidth > 768 ? '3.5rem' : '2.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem'
                    }}>
                        Ready to Find Your Life Partner?
                    </h2>
                    <p style={{
                        fontSize: '1.5rem',
                        marginBottom: '3rem',
                        opacity: 0.9
                    }}>
                        Join millions of happy couples who found love through Swrajya Sangam
                    </p>
                    <button
                        onClick={() => navigate('/user-home')}
                        style={{
                            background: 'white',
                            color: '#6a11cb',
                            border: 'none',
                            padding: '1.5rem 3rem',
                            fontSize: '1.5rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-5px)';
                            e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                        }}
                    >
                        Get Started Now <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                background: '#1e293b',
                color: 'white',
                padding: '3rem 2rem 1rem',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
                        gap: '3rem',
                        marginBottom: '3rem',
                        textAlign: 'left'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <img 
                                    src={img1} 
                                    alt="Swrajya Sangam Logo" 
                                    style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '10px',
                                        objectFit: 'cover'
                                    }} 
                                />
                                <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#fbbf24' }}>Swrajya Sangam</h3>
                            </div>
                            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                                India's most trusted matrimony platform helping millions find their perfect life partner.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fbbf24' }}>Quick Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</a>
                                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
                                <button onClick={() => navigate('/user-home')} style={{ color: '#94a3b8', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Browse Profiles</button>
                                <button onClick={() => navigate('/careers')} style={{ color: '#94a3b8', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Careers</button>
                                <button onClick={() => navigate('/contact')} style={{ color: '#94a3b8', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Contact Us</button>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fbbf24' }}>Contact Us</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaEnvelope /> hrswrajyasangam@gmail.com
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaMapMarkerAlt /> Pune, Mumbai, Maharashtra
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        borderTop: '1px solid #334155',
                        paddingTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <p style={{ color: '#94a3b8', margin: 0 }}>
                            © 2024 Swrajya Sangam. All rights reserved.
                        </p>
                        <p style={{ color: '#94a3b8', margin: 0 }}>
                            Developed by Samyak Web Developer
                        </p>
                    </div>
                </div>
            </footer>

            <style>
                {`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default LandingPage;
