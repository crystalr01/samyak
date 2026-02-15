import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar, { menuItems } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ProfileDetails from "./components/pages/ProfilePage";
import UserDetail from "./components/pages/UserDetail";
import UserLogin from "./components/pages/UserLogin";
import Edit from "./components/pages/Edit";
import LandingPage from "./components/pages/LandingPage";
import AboutPage from "./components/pages/AboutPage";
import TermsPage from "./components/pages/TermsPage";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import UserHomePage from "./components/pages/UserHomePage";
import UnlockedProfiles from "./components/pages/UnlockedProfiles";
import ContactUs from "./components/pages/ContactUs";
import Careers from "./components/pages/Careers";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed by default for full width
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'user'
  const navigate = useNavigate();
  const location = useLocation();

  // Check localStorage for authentication on app load
  useEffect(() => {
    console.log("=== Auth Check Starting ===");
    
    // Check for new auth system (AuthContext)
    const matrimonyUser = localStorage.getItem("matrimony_user");
    const storedPhone = localStorage.getItem("matrimonyUserPhone");
    const storedRole = localStorage.getItem("matrimonyUserRole");
    
    console.log("matrimony_user:", matrimonyUser);
    console.log("matrimonyUserPhone:", storedPhone);
    console.log("matrimonyUserRole:", storedRole);
    
    // First check the explicit role
    if (storedRole === "admin") {
      console.log("Admin role found in localStorage");
      setIsAuthenticated(true);
      setUserRole("admin");
      return;
    }
    
    // Check new auth system
    if (matrimonyUser) {
      try {
        const userData = JSON.parse(matrimonyUser);
        console.log("Auth check - User from matrimony_user:", userData);
        
        // Check if it's admin phone or admin role
        if (userData.phoneNumber === "9370329233" || userData.role === "admin") {
          console.log("Admin detected from matrimony_user");
          setIsAuthenticated(true);
          setUserRole("admin");
          localStorage.setItem("matrimonyUserRole", "admin");
        } else {
          // Regular user logged in
          console.log("Regular user detected from matrimony_user");
          setIsAuthenticated(true);
          setUserRole("user");
          localStorage.setItem("matrimonyUserRole", "user");
        }
      } catch (error) {
        console.error("Error parsing matrimony_user:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else if (storedPhone) {
      // Fallback to old system
      console.log("Auth check - Phone (old system):", storedPhone, "Role:", storedRole);
      
      // Check if admin by phone number
      if (storedPhone === "9370329233") {
        console.log("Admin detected from phone number");
        setIsAuthenticated(true);
        setUserRole("admin");
        localStorage.setItem("matrimonyUserRole", "admin");
      } else {
        // Regular user
        console.log("Regular user detected from phone");
        setIsAuthenticated(true);
        setUserRole(storedRole || "user");
      }
    } else {
      console.log("No authentication found");
      setIsAuthenticated(false);
      setUserRole(null);
    }
    
    console.log("=== Auth Check Complete ===");
  }, []);

  // Update document title based on active menu
  useEffect(() => {
    document.title = `Swrajya Sangam - ${activeMenu}`;
  }, [activeMenu]);

  // Update activeMenu based on current route
  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      if (isAuthenticated) {
        setActiveMenu("Home");
      } else {
        setActiveMenu("Landing");
      }
    } else if (path === "/login") {
      setActiveMenu("Login");
    } else if (
      path.startsWith("/profile/") ||
      path.startsWith("/user/") ||
      path.startsWith("/edit/")
    ) {
      // Don't change the active menu on detail pages or edit pages
      return;
    } else {
      const menuName = path.substring(1);
      const menuItem = menuItems.find(
        (item) => item.label.toLowerCase() === menuName.toLowerCase()
      );

      if (menuItem) {
        setActiveMenu(menuItem.label);
      }
    }
  }, [location, isAuthenticated]);

  // Redirect based on authentication status and role
  useEffect(() => {
    const publicRoutes = ["/", "/login", "/privacy-policy", "/about", "/terms", "/user-home", "/contact", "/careers"];
    const isUserDetailRoute = location.pathname.startsWith("/user/");
    const isEditRoute = location.pathname.startsWith("/edit/");
    const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/profile/");
    
    console.log("=== Navigation Check ===");
    console.log("Path:", location.pathname);
    console.log("Auth:", isAuthenticated);
    console.log("Role:", userRole);
    console.log("Is Admin Route:", isAdminRoute);
    
    // PRIORITY 1: If trying to access admin routes without admin role
    if (isAdminRoute && (!isAuthenticated || userRole !== "admin")) {
      console.log("Admin route requires admin role");
      
      // If a regular user is trying to access admin, clear their session
      if (isAuthenticated && userRole === "user") {
        console.log("Clearing regular user session to allow admin login");
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem("matrimony_user");
        localStorage.removeItem("matrimonyUserPhone");
        localStorage.removeItem("matrimonyUserRole");
        localStorage.removeItem("matrimonyUserUid");
      }
      
      // Redirect to login
      if (location.pathname !== "/login") {
        console.log("Redirecting to login");
        navigate("/login", { replace: true });
      }
      return; // Stop here, don't process other redirects
    }
    
    // PRIORITY 2: If on login page and already authenticated as admin
    if (location.pathname === "/login" && isAuthenticated && userRole === "admin") {
      console.log("Admin already logged in - redirecting to /admin");
      navigate("/admin", { replace: true });
      return;
    }
    
    // PRIORITY 3: If on login page and authenticated as regular user
    if (location.pathname === "/login" && isAuthenticated && userRole === "user") {
      console.log("Regular user on login page - redirecting to /user-home");
      navigate("/user-home", { replace: true });
      return;
    }
    
    // PRIORITY 4: For other protected routes (not admin, not public)
    if (
      !isAuthenticated &&
      !publicRoutes.includes(location.pathname) &&
      !isUserDetailRoute &&
      !isEditRoute &&
      !isAdminRoute
    ) {
      console.log("Protected route - redirecting to login");
      navigate("/login", { replace: true });
    }
    
    console.log("=== Navigation Check Complete ===");
  }, [isAuthenticated, userRole, location.pathname, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (label) => {
    if (label === "Logout") {
      alert("Logging out...");
      setIsAuthenticated(false);
      setUserRole(null);
      // Clear all auth-related localStorage items
      localStorage.removeItem("matrimonyUserPhone");
      localStorage.removeItem("matrimonyUserRole");
      localStorage.removeItem("matrimonyUserUid");
      localStorage.removeItem("matrimony_user");
      setActiveMenu("Landing");
      navigate("/");
    } else {
      setActiveMenu(label);
      // Don't navigate for admin menu items - they're handled by Dashboard component
      // Only navigate if it's a public route
      if (!isAuthenticated || userRole !== "admin") {
        navigate(label === "Home" ? "/" : `/${label.toLowerCase()}`);
      }
    }
  };

  // Handle successful login
  const handleLoginSuccess = (role = "user") => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem("matrimonyUserRole", role);
    setActiveMenu("Home");
    
    // Redirect based on role
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/user-home");
    }
  };

  return (
    <AuthProvider>
      <div className="app-container" role="main" aria-label="Matrimony dashboard">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/user-home" element={<UserHomePage />} />
          <Route path="/user/:id" element={<UserDetail />} />
          <Route path="/unlocked-profiles" element={<UnlockedProfiles />} />
          <Route 
            path="/login" 
            element={<UserLogin onLoginSuccess={handleLoginSuccess} />} 
          />

          {/* Admin Routes - Require Authentication */}
          {isAuthenticated && userRole === "admin" && (
            <>
              <Route path="/admin" element={
                <div style={{ display: "flex", height: "100vh" }}>
                  <Sidebar
                    activeMenu={activeMenu}
                    setActiveMenu={handleMenuClick}
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                  />
                  <Dashboard activeMenu={activeMenu} />
                </div>
              } />
              <Route path="/profile/:id" element={
                <div style={{ display: "flex", height: "100vh" }}>
                  <Sidebar
                    activeMenu={activeMenu}
                    setActiveMenu={handleMenuClick}
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                  />
                  <ProfileDetails />
                </div>
              } />
              <Route path="/edit/:userId" element={
                <div style={{ display: "flex", height: "100vh" }}>
                  <Sidebar
                    activeMenu={activeMenu}
                    setActiveMenu={handleMenuClick}
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                  />
                  <Edit />
                </div>
              } />
            </>
          )}

          {/* Fallback for admin routes when not authenticated */}
          <Route path="/admin" element={<UserLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/profile/:id" element={<UserLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/edit/:userId" element={<UserLogin onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
