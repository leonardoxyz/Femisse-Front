import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PersonalData } from "@/components/profile/PersonalData";
import { AddressList } from "@/components/profile/AddressList";
import OrderHistory from "@/components/profile/OrderHistory";
import { PersonalReviews } from "@/components/profile/PersonalReviews";
import { ProfileSidebar } from "./ProfileSidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesList from "@/components/profile/FavoritesList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Profile() {
    const { section } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentSection, setCurrentSection] = useState(section || "profile");
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [highlightCPF, setHighlightCPF] = useState(false);
    const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

    useEffect(() => {
        setCurrentSection(section || "profile");
    }, [section]);

    // Verificar se há mensagem do checkout
    useEffect(() => {
        if (location.state?.message) {
            setAlertMessage(location.state.message);
            setHighlightCPF(location.state.highlightCPF || false);
            setPendingRedirect(location.state.returnTo || null);

            // Forçar ir para a seção de perfil
            setCurrentSection("profile");

            // Limpar o alerta após 10 segundos
            const timer = setTimeout(() => {
                setAlertMessage(null);
                setHighlightCPF(false);
                setPendingRedirect(null);
                navigate(location.pathname, { replace: true, state: {} });
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [location.state, navigate, location.pathname]);

    const handleCPFUpdated = (cpf: string | null) => {
        if (cpf) {
            setAlertMessage(null);
            setHighlightCPF(false);

            if (pendingRedirect) {
                const redirectURL = pendingRedirect;
                const stepToReturn = location.state?.returnStep;
                const checkoutData = location.state?.checkoutData;
                setPendingRedirect(null);
                
                // Redirecionar de volta com o step e dados preservados
                navigate(redirectURL, { 
                    replace: true, 
                    state: {
                        ...(stepToReturn && { returnStep: stepToReturn }),
                        ...(checkoutData && { checkoutData })
                    }
                });
            }
        }
    };

    const renderContent = () => {
        switch (currentSection) {
            case "profile":
                return <PersonalData highlightCPF={highlightCPF} onCPFUpdated={handleCPFUpdated} />;
            case "addresses":
                return <AddressList />;
            case "favorites":
                return <FavoritesList />;
            case "orders":
                return <OrderHistory />;
            case "reviews":
                return <PersonalReviews />;
            default:
                return <PersonalData highlightCPF={highlightCPF} onCPFUpdated={handleCPFUpdated} />;
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
                            {/* Alerta do Checkout */}
                            {alertMessage && (
                                <Alert className="mb-6 border-amber-500 bg-amber-50">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-amber-800">
                                        {alertMessage}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}