interface ProductShowcaseProps {
  image: string;
}

const ProductShowcase = ({ image }: ProductShowcaseProps) => {
  return (
    <div className="banners w-full flex items-center justify-center">
      <div className="splide splide-banners">
        <div className="splide__track">
          <ul className="splide__list">
            <li 
              className="splide__slide flex items-center justify-center w-full">
              <a href="#" aria-label="Produto" className="w-full h-full">
                <img
                  src={image}
                  alt="Produto"
                  className=""
                  style={{
                    minHeight: '400px',
                    maxHeight: '720px',
                    height: 'auto'
                  }}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;