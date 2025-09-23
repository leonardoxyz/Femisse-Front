import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PersonalData } from "@/components/profile/PersonalData";
import { AddressList } from "@/components/profile/AddressList";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { SavedCards } from "@/components/profile/SavedCards";
import { ProfileSidebar } from "./ProfileSidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesList from "@/components/profile/FavoritesList";

export default function Profile() {
    const { section } = useParams();
    const navigate = useNavigate();
    const [currentSection, setCurrentSection] = useState(section || "profile");

    useEffect(() => {
        setCurrentSection(section || "profile");
    }, [section]);

    const renderContent = () => {
        switch (currentSection) {
            case "profile":
                return <PersonalData />;
            case "addresses":
                return <AddressList />;
            case "favorites":
                return <FavoritesList />;
            case "orders":
                return <OrderHistory />;
            case "cards":
                return <SavedCards />;
            default:
                return <PersonalData />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="lg:w-1/4">
                            <ProfileSidebar
                                currentSection={currentSection}
                                onSectionChange={(section) => {
                                    setCurrentSection(section);
                                    if (section === "profile") {
                                        navigate("/perfil", { replace: true });
                                    } else {
                                        navigate(`/perfil/${section}`, { replace: true });
                                    }
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div className="lg:w-3/4">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}