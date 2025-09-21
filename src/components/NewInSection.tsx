import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { API_ENDPOINTS } from "@/config/api";

const NewInSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ENDPOINTS.products)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setProducts([]);
        setLoading(false);
        console.error("Erro ao buscar produtos:", err);
      });
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            NOVIDADES
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
            Descubra as últimas novidades da nossa coleção. Peças exclusivas e tendências que você vai amar.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  stock={product.stock}
                  originalPrice={product.original_price}
                  images={product.images}
                  image={product.image}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button className="bg-primary hover:bg-pink-dark text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
            Ver Todos os Produtos
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewInSection;