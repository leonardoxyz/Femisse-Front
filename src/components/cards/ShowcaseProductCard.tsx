import React from "react";
import { useNavigate } from "react-router-dom";
import { createSlug } from "@/utils/slugs";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ShowcaseProduct {
  id: string;
  name: string;
  price: number;
  stock?: number | null;
  images?: string[];
  image?: string;
  originalPrice?: number | null;
  original_price?: number | null;
  sizes?: string[];
}

interface ShowcaseProductCardProps {
  product: ShowcaseProduct;
  className?: string;
  style?: React.CSSProperties;
  showAddToCartButton?: boolean;
}

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number") {
    return null;
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const ShowcaseProductCard: React.FC<ShowcaseProductCardProps> = ({
  product,
  className,
  style,
  showAddToCartButton = true,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);

  const mainImage = React.useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const [firstImage] = product.images.filter(Boolean);
      if (firstImage) return firstImage;
    }
    return product.image ?? "";
  }, [product.image, product.images]);

  const hoverImage = React.useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 1) {
      const [, ...rest] = product.images;
      const next = rest.find(Boolean);
      if (next) return next;
    }
    return mainImage;
  }, [product.images, mainImage]);

  const availableSizes = React.useMemo(() => {
    if (Array.isArray(product.sizes)) {
      return product.sizes.filter((size): size is string => Boolean(size));
    }
    return [];
  }, [product.sizes]);

  const requiresSizeSelection = availableSizes.length > 0;

  React.useEffect(() => {
    setSelectedSize(null);
  }, [product.id]);

  const productSlug = React.useMemo(() => createSlug(product.name), [product.name]);
  const currentOriginalPrice = product.originalPrice ?? product.original_price ?? undefined;

  const handleNavigate = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigate(`/produto/${productSlug}`);
    },
    [navigate, productSlug]
  );

  const isOutOfStock = (product.stock ?? 0) <= 0;

  const handleAddToCart = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (isOutOfStock) {
        toast({
          title: "Produto esgotado",
          description: "Este produto não está disponível no momento.",
          variant: "destructive",
        });
        return;
      }

      if (requiresSizeSelection && !selectedSize) {
        toast({
          title: "Selecione um tamanho",
          description: "Escolha um tamanho disponível antes de adicionar ao carrinho.",
          variant: "destructive",
        });
        return;
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        size: selectedSize || undefined,
      });

      toast({
        title: "Adicionado ao carrinho",
        description: `${product.name} foi adicionado ao seu carrinho!`,
        variant: "default",
      });

      if (requiresSizeSelection) {
        setSelectedSize(null);
      }
    },
    [addToCart, isOutOfStock, mainImage, product, requiresSizeSelection, selectedSize]
  );

  const handleSizeSelect = React.useCallback((event: React.MouseEvent<HTMLButtonElement>, size: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;
    setSelectedSize(size);
  }, [isOutOfStock]);

  return (
    <div className={cn("flex flex-col", className)} style={style}>
      <div className="relative overflow-hidden bg-primary group" style={{ paddingTop: "150%" }}>
        <a
          href={`/produto/${productSlug}`}
          className="absolute inset-0 block"
          onClick={handleNavigate}
          aria-label={product.name}
        >
          <div className="loading absolute inset-0 bg-gray-100" />

          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              title={product.name}
              className="lazy-img-fadein primary absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{ height: "100%" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200" aria-hidden />
          )}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={product.name}
              title={product.name}
              style={{ height: "100%" }}
            />
          )}
        </a>

        {availableSizes.length > 0 && (
          <div
            className={cn(
              "absolute bottom-16 left-1/2 z-10 flex w-5/6 -translate-x-1/2 flex-wrap justify-center gap-2",
              "opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            )}
          >
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={(event) => handleSizeSelect(event, size)}
                  disabled={isOutOfStock}
                  className={cn(
                    "border px-3 py-1 text-xs font-medium uppercase transition",
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-white/90 text-gray-900 border-gray-300 hover:border-primary hover:bg-primary/100",
                    isOutOfStock && "cursor-not-allowed opacity-60"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}

        {showAddToCartButton && (
          <button
            className={cn(
              "w-5/6 absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 text-sm font-medium opacity-0",
              "group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10",
              isOutOfStock || (requiresSizeSelection && !selectedSize)
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            )}
            onClick={handleAddToCart}
            disabled={isOutOfStock || (requiresSizeSelection && !selectedSize)}
            title={isOutOfStock
              ? "Produto esgotado"
              : requiresSizeSelection && !selectedSize
                ? "Selecione um tamanho"
                : "Adicionar ao carrinho"}
            type="button"
          >
            {isOutOfStock ? "ESGOTADO" : requiresSizeSelection && !selectedSize ? "SELECIONE UM TAMANHO" : "ADICIONAR AO CARRINHO"}
          </button>
        )}
      </div>

      <div className="product-info-wrapper mt-4 text-center">
        <h3 className="mb-2">
          <a
            href={`/produto/${productSlug}`}
            className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 uppercase"
            title={product.name}
            onClick={(event) => {
              event.preventDefault();
              navigate(`/produto/${productSlug}`);
            }}
          >
            {product.name}
          </a>
        </h3>

        <div className="mb-3">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price) ?? "—"}
            </span>
            {typeof currentOriginalPrice === "number" && currentOriginalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through mt-1">
                {formatCurrency(currentOriginalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseProductCard;
