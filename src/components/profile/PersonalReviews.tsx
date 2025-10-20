import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Edit, Trash2, Package, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";
import { API_ENDPOINTS } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductReview {
  reviewId: string;
  productName: string;
  productImage: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface PurchasedProduct {
  productId: string;
  orderId: string | null;
  name: string;
  image: string | null;
  orderDate: string | null;
  hasReview: boolean;
}

export function PersonalReviews() {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct | null>(null);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ProductReview | null>(null);
  const [activeSection, setActiveSection] = useState<'pending' | 'reviews'>('pending');
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });

  // Buscar avaliações existentes
  const fetchReviews = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get(API_ENDPOINTS.reviews);
      const payload = response.data;
      const data = Array.isArray(payload?.data) ? payload.data : payload;
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  // Buscar produtos comprados que podem ser avaliados
  const fetchPurchasedProducts = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get(API_ENDPOINTS.reviewableProducts);
      const payload = response.data;
      const data = Array.isArray(payload?.data) ? payload.data : payload;
      setPurchasedProducts(Array.isArray(data) ? data : []);
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

    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const stats = useMemo(() => ({
    totalReviews: reviews.length,
    pendingReviews: purchasedProducts.length,
    averageRating:
      reviews.length === 0
        ? 0
        : reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length,
  }), [reviews, purchasedProducts]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

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
    setActiveSection('pending');
  };

  const startEdit = (review: ProductReview) => {
    setEditingReview(review);
    setSelectedProduct(null);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
    setActiveSection('reviews');
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

    if (!editingReview && (!selectedProduct?.productId || !selectedProduct.orderId)) {
      toast({
        title: "Produto não selecionado",
        description: "Selecione um produto para avaliar antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = editingReview 
        ? `${API_ENDPOINTS.reviews}/${editingReview.reviewId}`
        : API_ENDPOINTS.reviews;
      
      const method = editingReview ? 'PUT' : 'POST';
      
      const payload = editingReview 
        ? reviewForm
        : { ...reviewForm, product_id: selectedProduct?.productId, order_id: selectedProduct?.orderId };

      setIsSaving(true);
      
      if (editingReview) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      
      toast({
        title: editingReview ? "Avaliação atualizada" : "Avaliação criada",
        description: editingReview 
          ? "Sua avaliação foi atualizada com sucesso!" 
          : "Obrigado por avaliar o produto!",
        variant: "default"
      });
      
      setShowReviewForm(false);
      await Promise.all([fetchReviews(), fetchPurchasedProducts()]);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await api.delete(`${API_ENDPOINTS.reviews}/${reviewId}`);
      
      toast({
        title: "Avaliação removida",
        description: "Sua avaliação foi removida com sucesso.",
        variant: "default"
      });
      await Promise.all([fetchReviews(), fetchPurchasedProducts()]);
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a avaliação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-sm border border-[#58090d]/20 bg-[#58090d]/10 p-5"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-lg bg-[#58090d]/30" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3 bg-[#58090d]/40" />
                <Skeleton className="h-3 w-1/2 bg-[#58090d]/40" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3 w-full bg-[#58090d]/30" />
            <Skeleton className="mt-2 h-3 w-2/3 bg-[#58090d]/30" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-pink-50 via-white to-pink-100/60 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#58090d]">
                <Sparkles className="h-4 w-4" />
                Experiência Femisse
              </div>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                Compartilhe suas avaliações
              </h2>
              <p className="mt-1 text-sm text-muted-foreground sm:max-w-xl">
                Avalie os produtos que você comprou, acompanhe suas opiniões e ajude outras pessoas a encontrar seus favoritos.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 rounded-sm bg-white/70 p-4 shadow-sm sm:w-auto sm:min-w-[280px]">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Avaliações</p>
                <p className="text-2xl font-semibold text-foreground">{stats.totalReviews}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-semibold text-foreground">{stats.pendingReviews}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Nota média</p>
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(stats.averageRating))}
                  <span className="text-sm font-medium text-foreground">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-sm bg-white/60 p-1 sm:w-fit">
            {([
              { id: 'pending', label: 'Para avaliar', count: purchasedProducts.length },
              { id: 'reviews', label: 'Minhas avaliações', count: reviews.length }
            ] as const).map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'ghost'}
                className={`h-11 rounded-sm text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
                <Badge
                  variant={activeSection === section.id ? 'secondary' : 'outline'}
                  className="ml-2 rounded-sm px-2 text-xs"
                >
                  {section.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {activeSection === 'pending' && (
        <section className="space-y-4">
          {purchasedProducts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Nenhum produto para avaliar</h3>
                  <p className="text-sm text-muted-foreground">
                    Assim que suas próximas compras forem entregues, elas aparecerão aqui para você compartilhar sua opinião.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {purchasedProducts.map((product) => (
                <Card
                  key={`${product.productId}-${product.orderId ?? 'pending'}`}
                  className="flex h-full flex-col justify-between rounded-sm border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle
                          className="truncate text-base font-semibold text-foreground"
                          title={product.name}
                        >
                          {product.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {product.orderDate ? `Comprado em ${formatDate(product.orderDate)}` : 'Compra recente'}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-11 rounded-sm bg-primary text-primary-foreground transition hover:bg-primary/90"
                      onClick={() => startReview(product)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Avaliar produto
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === 'reviews' && (
        <section className="space-y-4">
          {reviews.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Você ainda não escreveu avaliações</h3>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe sua experiência com os produtos comprados para inspirar outras mulheres.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card
                  key={review.reviewId}
                  className="rounded-sm border border-border/60 bg-white shadow-sm"
                >
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        {review.productImage ? (
                          <img
                            src={review.productImage}
                            alt={review.productName}
                            className="h-16 w-16 shrink-0 rounded-sm object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div>
                            <CardTitle
                              className="truncate text-lg font-semibold text-foreground"
                              title={review.productName}
                            >
                              {review.productName}
                            </CardTitle>
                            <p className="text-xs uppercase text-muted-foreground">
                              Avaliado em {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {renderStars(review.rating)}
                            <Badge variant="secondary" className="rounded-sm px-3 text-xs">
                              {review.rating}.0
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(review)}>
                          <Edit className="mr-1 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-sm"
                          onClick={() => setReviewToDelete(review)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-sm bg-muted/60 p-4 text-sm text-muted-foreground">
                      {review.comment}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? 'Editar avaliação' : 'Avaliar produto'}
            </DialogTitle>
            <DialogDescription>
              {editingReview 
                ? `Atualize sua avaliação do produto ${editingReview.productName}`
                : selectedProduct 
                  ? `Conte sua experiência com ${selectedProduct.name}`
                  : 'Compartilhe sua opinião'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nota</label>
              {renderStars(reviewForm.rating, true, (star) => setReviewForm(prev => ({ ...prev, rating: star })))}
            </div>
            <div>
              <label className="text-sm font-medium">Comentário</label>
              <Textarea
                placeholder="Conte como o produto chegou, o caimento, a qualidade..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="resize-none rounded-sm border border-border/60 bg-white"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="rounded-sm"
              onClick={() => {
                setShowReviewForm(false);
                setEditingReview(null);
                setSelectedProduct(null);
                setReviewForm({ rating: 0, comment: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-sm bg-primary hover:bg-primary/90"
              onClick={saveReview}
              disabled={isSaving}
            >
              {isSaving ? 'Enviando...' : editingReview ? 'Atualizar avaliação' : 'Publicar avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!reviewToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setReviewToDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-md space-y-6 rounded-2xl border border-destructive/20 bg-white p-6 shadow-xl">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs uppercase text-destructive">
              <Trash2 className="h-4 w-4" />
              Remover avaliação
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Tem certeza que deseja excluir?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Essa ação não pode ser desfeita e removerá permanentemente a avaliação do produto
              {reviewToDelete ? ` "${reviewToDelete.productName}"` : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Resumo da avaliação</p>
            {reviewToDelete && (
              <>
                <p className="truncate" title={reviewToDelete.comment}>
                  {reviewToDelete.comment}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Nota: {reviewToDelete.rating}
                  <span className="text-muted-foreground/70">•</span>
                  Criada em {formatDate(reviewToDelete.createdAt)}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="rounded-sm"
              onClick={() => setReviewToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-sm bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                if (!reviewToDelete) return;
                await deleteReview(reviewToDelete.reviewId);
                setReviewToDelete(null);
              }}
            >
              Excluir agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
