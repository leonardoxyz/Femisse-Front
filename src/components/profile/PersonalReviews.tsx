import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Edit, Trash2, Plus, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS } from "@/config/api";

interface ProductReview {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  rating: number;
  comment: string;
  created_at: string;
  can_edit: boolean;
}

interface PurchasedProduct {
  id: string;
  name: string;
  image: string;
  order_id: string;
  order_date: string;
  has_review: boolean;
}

export function PersonalReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct | null>(null);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });

  // Buscar avaliações existentes
  const fetchReviews = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.reviews, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  // Buscar produtos comprados que podem ser avaliados
  const fetchPurchasedProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.reviewableProducts, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPurchasedProducts(data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos comprados:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReviews(), fetchPurchasedProducts()]);
      setLoading(false);
    };
    
    if (token) {
      loadData();
    }
  }, [token]);

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  const startReview = (product: PurchasedProduct) => {
    setSelectedProduct(product);
    setEditingReview(null);
    setReviewForm({ rating: 0, comment: '' });
    setShowReviewForm(true);
  };

  const startEdit = (review: ProductReview) => {
    setEditingReview(review);
    setSelectedProduct(null);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
  };

  const saveReview = async () => {
    if (reviewForm.rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
        variant: "destructive"
      });
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, escreva um comentário sobre o produto.",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = editingReview 
        ? `${API_ENDPOINTS.reviews}/${editingReview.id}`
        : API_ENDPOINTS.reviews;
      
      const method = editingReview ? 'PUT' : 'POST';
      
      const payload = editingReview 
        ? reviewForm
        : { ...reviewForm, product_id: selectedProduct?.id, order_id: selectedProduct?.order_id };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: editingReview ? "Avaliação atualizada" : "Avaliação criada",
          description: editingReview 
            ? "Sua avaliação foi atualizada com sucesso!" 
            : "Obrigado por avaliar o produto!",
          variant: "default"
        });
        
        setShowReviewForm(false);
        await Promise.all([fetchReviews(), fetchPurchasedProducts()]);
      } else {
        throw new Error('Erro ao salvar avaliação');
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua avaliação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.reviews}/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Avaliação removida",
          description: "Sua avaliação foi removida com sucesso.",
          variant: "default"
        });
        await Promise.all([fetchReviews(), fetchPurchasedProducts()]);
      }
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a avaliação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando avaliações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Minhas Avaliações</h2>
          <p className="text-muted-foreground">Avalie produtos que você comprou e ajude outros clientes</p>
        </div>
      </div>

      {/* Produtos que podem ser avaliados */}
      {purchasedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Produtos para avaliar</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchasedProducts.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-sm">{product.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Comprado em {new Date(product.order_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => startReview(product)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Avaliar Produto
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Avaliações existentes */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Suas avaliações</h3>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={review.product_image} 
                      alt={review.product_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <CardTitle className="text-base">{review.product_name}</CardTitle>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.can_edit && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(review)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteReview(review.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    Avaliado em {new Date(review.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de avaliação */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReview ? 'Editar Avaliação' : `Avaliar: ${selectedProduct?.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sua nota:</label>
              {renderStars(reviewForm.rating, true, (star) => 
                setReviewForm(prev => ({ ...prev, rating: star }))
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Seu comentário:</label>
              <Textarea
                placeholder="Conte sua experiência com este produto..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancelar
              </Button>
              <Button onClick={saveReview} className="bg-primary hover:bg-primary/90">
                {editingReview ? 'Atualizar' : 'Publicar'} Avaliação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {reviews.length === 0 && purchasedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação ainda</h3>
          <p className="text-muted-foreground">
            Você poderá avaliar produtos após realizar uma compra.
          </p>
        </div>
      )}
    </div>
  );
}
