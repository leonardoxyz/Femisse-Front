import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import CategoryBanner from "@/components/CategoryBanner";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import NewInSection from "@/components/NewInSection";
import FeaturesCarousel from "@/components/FeaturesCarousel";
import DeliverySection from "@/components/DeliverySection";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

const Index = () => {
  useScrollRestoration();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <ProductShowcaseSection />
      <NewInSection />
      <FeaturesCarousel />
      <CategoryBanner />
      <DeliverySection />
      <Footer />
    </div>
  );
};

export default Index;
