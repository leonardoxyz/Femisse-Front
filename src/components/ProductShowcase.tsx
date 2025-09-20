import { Card } from "@/components/ui/card";

interface ProductShowcaseProps {
  image: string;
}

const ProductShowcase = ({ image }: ProductShowcaseProps) => {
  return (
    <Card className="w-full max-w-3xl h-[600px] mx-auto bg-muted/30 overflow-hidden border-0 shadow-xl p-0">
      <div className="relative w-full h-full bg-red-200">
        <img
          src={image}
          alt="Produto"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </Card>
  );
};

export default ProductShowcase;