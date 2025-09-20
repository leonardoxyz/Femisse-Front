import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryBanner from "@/components/CategoryBanner";
import NewInSection from "@/components/NewInSection";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <CategoryBanner />
      <ProductShowcaseSection />
      <NewInSection />
      <Footer />
    </div>
  );
};

export default Index;
