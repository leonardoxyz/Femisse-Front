import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const API_URL = '/api/products';

const ProductsByCategory = () => {
  const { id } = useParams();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [categoryName, setCategoryName] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    // Buscar produtos da categoria
    fetch(`${API_URL}?categoria_id=${id}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // Buscar nome da categoria
    fetch(`/api/categories/${id}`)
      .then(res => res.json())
      .then(data => setCategoryName(data.name || 'Categoria'));
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-foreground">{categoryName}</h1>
          {loading ? (
            <div>Carregando...</div>
          ) : products.length === 0 ? (
            <div>Nenhum produto encontrado nesta categoria.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  {...product}
                  originalPrice={product.original_price}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsByCategory;
