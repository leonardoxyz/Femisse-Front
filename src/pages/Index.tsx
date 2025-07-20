import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryBanner from "@/components/CategoryBanner";
import NewInSection from "@/components/NewInSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <CategoryBanner />
      <NewInSection />
      <Footer />
    </div>
  );
};

export default Index;
