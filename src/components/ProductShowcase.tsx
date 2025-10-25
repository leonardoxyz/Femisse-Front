interface ProductShowcaseProps {
  image: string;
}

const ProductShowcase = ({ image }: ProductShowcaseProps) => {
  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden border border-[#58090d]/15 bg-[#58090d]/5 shadow-sm transition-transform duration-200 aspect-[3/4]">
        <img
          src={image}
          alt="produto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default ProductShowcase;