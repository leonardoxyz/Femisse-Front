interface ProductShowcaseProps {
  image: string;
}

const ProductShowcase = ({ image }: ProductShowcaseProps) => {
  return (
    <div className="w-full max-w-3xl h-[600px] mx-auto bg-muted/30 overflow-hidden">
      <div className="relative w-full h-full">
        <img
          src={image}
          alt="Produto"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ProductShowcase;