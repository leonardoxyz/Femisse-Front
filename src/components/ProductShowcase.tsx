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
              className="splide__slide flex items-center justify-center"
              style={{ width: '560px', height: '720px' }}
            >
              <a href="#" aria-label="Produto">
                <img
                  src={image}
                  alt="Produto"
                  className="lazy-img-fadein w-full h-full object-contain"
                  style={{
                    height: '720px'
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