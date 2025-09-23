import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import CategoryBanner from "@/components/CategoryBanner";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import NewInSection from "@/components/NewInSection";
import FeaturesCarousel from "@/components/FeaturesCarousel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <ProductShowcaseSection />
      <CategoryBanner />
      <FeaturesCarousel />
      <NewInSection />
      <Footer />
    </div>
  );
};

export default Index;
