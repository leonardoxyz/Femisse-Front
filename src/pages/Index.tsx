import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import CategoryBanner from "@/components/CategoryBanner";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import NewInSection from "@/components/NewInSection";
import FeaturesCarousel from "@/components/FeaturesCarousel";
import DeliverySection from "@/components/DeliverySection";
import CustomerTestimonials from "@/components/CustomerTestimonials";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { SEOHead } from '@/components/SEO/SEOHead';

const Index = () => {
  useScrollRestoration();

  return (
    <>
      <SEOHead
        title="Feminisse - Moda Feminina de Qualidade"
        description="Descubra as últimas tendências em moda feminina na Feminisse. Vestidos, blusas, calças e muito mais com qualidade e estilo. Frete grátis acima de R$ 200."
        canonical="https://femisse-front.vercel.app"
        keywords="moda feminina, roupas femininas, vestidos, blusas, calças, moda online, loja feminina"
      />
      <div className="min-h-screen bg-background">
        <Header />
      <HeroBanner />
      <ProductShowcaseSection />
      <NewInSection />
      <FeaturesCarousel />
      <CategoryBanner />
      <DeliverySection />
      <CustomerTestimonials />
        <Footer />
      </div>
    </>
  );
};

export default Index;
