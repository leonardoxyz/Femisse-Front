import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { orderService, Order } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/utils/formatters';

const OrderHistory = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    loadOrders();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

  const loadOrders = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await orderService.getUserOrders(token);
      setOrders(response || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Erro ao carregar histórico de pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-[#58090d]" />;
      case 'processing':
        return <Package className="w-5 h-5 text-[#58090d]" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-[#58090d]" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-[#58090d]" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-[#58090d]" />;
      default:
        return <Package className="w-5 h-5 text-[#58090d]" />;
    }
  };

  const getBadgeVariant = (color: string) => {
    const variants: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800',
      blue: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800',
      purple: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 hover:text-purple-800',
      green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800',
      red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800',
      gray: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800',
    };
    return variants[color] || variants.gray;
  };

  const handlePayNow = (order: Order) => {
    // Redirecionar para checkout com o pedido pendente
    navigate('/checkout', { state: { pendingOrder: order } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-900">Meus pedidos</h2>
        <p className="text-sm text-zinc-600">
          Visualize sua linha do tempo de compras, status de entrega e pagamentos pendentes.
        </p>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-zinc-100 bg-white p-4 shadow-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
              <div className="mt-4 h-24 animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="rounded-lg border border-zinc-100 bg-white p-8 text-center shadow">
          <Package className="mx-auto h-12 w-12 text-zinc-300" />
          <p className="mt-1 text-sm text-zinc-600">
            Assim que você finalizar uma compra ela aparecerá aqui.
          </p>
          <Button onClick={() => navigate('/')} className="mt-6">
            Explorar produtos
          </Button>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedOrders.map((order) => {
              const isPendingPayment = order.payment_status === 'pending';
              const statusLabel = orderService.getOrderStatusLabel(order);
              const badgeColor = orderService.getOrderStatusBadgeColor(order);

              const shipping = order.shipping_address ?? {
                name: order.shipping_name ?? 'Endereço não informado',
                street: order.shipping_street ?? 'Logradouro indisponível',
                number: order.shipping_number ?? 's/n',
                complement: order.shipping_complement ?? '',
                city: order.shipping_city ?? 'Cidade',
                state: order.shipping_state ?? '--',
                zip_code: order.shipping_zip_code ?? '---',
              };

              return (
                <article
                  key={order.id}
                  className={`rounded-xl border bg-white shadow-sm transition-all duration-200 ${
                    isPendingPayment ? 'border' : 'border-zinc-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col gap-3 p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-md p-1.5 ${
                          isPendingPayment ? 'bg-gray-100 text-gray-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {orderService.formatOrderNumber(order.order_number)}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-[#58090d]">
                        {formatCurrency(order.total)}
                      </p>
                    </div>

                    {/* Status badge único */}
                    <div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getBadgeVariant(badgeColor)}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Shipping summary */}
                    <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs">
                      <p className="font-medium text-zinc-700 mb-1">Entrega:</p>
                      <p className="text-zinc-600">{shipping.name}</p>
                      <p className="text-zinc-500">
                        {shipping.street}, {shipping.number}
                      </p>
                      <p className="text-zinc-500">
                        {shipping.city}/{shipping.state}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/perfil/reviews`)}
                        className="flex-1 h-8 text-xs"
                      >
                        Avaliar
                      </Button>

                      {orderService.canPayOrder(order) && (
                        <Button
                          onClick={() => handlePayNow(order)}
                          className="flex-1 h-8 text-xs bg-[#58090d] text-white hover:bg-[#58090d]/90"
                        >
                          <CreditCard className="mr-1 h-3 w-3" />
                          Pagar agora
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 px-3"
              >
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-9 w-9 rounded-md border text-sm font-medium transition ${
                        isActive
                          ? 'border-[#58090d] bg-[#58090d] text-white'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                      aria-label={`Ir para página ${page}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 px-3"
              >
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
;

export default OrderHistory;
