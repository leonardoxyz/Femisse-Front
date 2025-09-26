interface ProductShowcaseProps {
  image: string;
}

const ProductShowcase = ({ image }: ProductShowcaseProps) => {
  return (
    <>
      {/* Layout Mobile - Mantém o design atual */}
      <div className="banners w-full flex items-center justify-center lg:hidden">
        <div className="splide splide-banners">
          <div className="splide__track">
            <ul className="splide__list">
              <li className="splide__slide flex items-center justify-center w-full">
                <a href="#" aria-label="Produto" className="w-full h-full">
                  <img
                    src={image}
                    alt="produto"
                    className="w-full h-auto"
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

      {/* Layout Desktop - Novo design com dimensões fixas */}
      <div className="hidden lg:flex banners w-full items-center justify-center">
        <div className="splide splide-banners">
          <div className="splide__track">
            <ul className="splide__list">
              <li className="splide__slide flex items-center justify-center w-full">
                <a 
                  href="#" 
                  aria-label="produto" 
                  className="block relative overflow-hidden"
                  style={{ 
                    width: '454px',
                    paddingTop: '150%',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={image}
                    alt="produto"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductShowcase;