import React from "react";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import MatchesPage from "./pages/MatchesPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import RegistrationForm from "./pages/RegistrationForm";
import AdminSubscriptionManagement from "./pages/AdminSubscriptionManagement";
import AdminSettings from "./pages/AdminSettings";

function Dashboard({ activeMenu, className }) {
    const mainContentStyle = {
        flex: 1,
        background: "#f7f7f7",
        boxSizing: "border-box",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        height: "100vh",
        padding: 0,
        margin: 0
    };

    const renderContent = () => {
        switch (activeMenu) {
            case "Home":
                return <HomePage />;
            case "Profile":
                return <ProfilePage />;
            case "Matches":
                return <MatchesPage />;
            case "Messages":
                return <MessagesPage />;
            case "Settings":
                return <SettingsPage />;
            case "Registration":
                return <RegistrationForm />;
            case "Subscriptions":
                return <AdminSubscriptionManagement />;
            case "AdminSettings":
                return <AdminSettings />;
            default:
                return <HomePage />;
        }
    };

    return (
        <section style={mainContentStyle} className={className} aria-label="Main dashboard content">
            {renderContent()}
        </section>
    );
}

export default Dashboard;