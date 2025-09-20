import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Package, RotateCcw, Star } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  total: number;
  items: OrderItem[];
}

const orders: Order[] = [
  {
    id: "1",
    orderNumber: "PED-2024-001",
    date: "2024-01-15",
    status: 'delivered',
    total: 489.98,
    items: [
      {
        id: "1",
        name: "Tênis Nike Air Max 90",
        brand: "Nike",
        size: "42",
        color: "Branco",
        quantity: 1,
        price: 399.99,
        image: "/placeholder.svg",
      },
      {
        id: "2",
        name: "Camiseta Adidas Essentials",
        brand: "Adidas",
        size: "M",
        color: "Preto",
        quantity: 1,
        price: 89.99,
        image: "/placeholder.svg",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "PED-2024-002",
    date: "2024-03-10",
    status: 'shipped',
    total: 199.90,
    items: [
      {
        id: "3",
        name: "Vestido Floral",
        brand: "Marca Z",
        size: "P",
        color: "Azul",
        quantity: 1,
        price: 199.90,
        image: "/placeholder.svg",
      },
    ],
  },
];

const ITEMS_PER_PAGE = 2;

export function OrderHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Histórico de Compras</h2>
          <p className="text-muted-foreground">Acompanhe seus pedidos realizados</p>
        </div>
      </div>
      <div className="grid gap-4">
        {paginatedOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-secondary" />
                <CardTitle>Pedido {order.orderNumber}</CardTitle>
                <Badge className="ml-2 capitalize">{order.status}</Badge>
              </div>
              <span className="text-sm text-muted-foreground">{order.date}</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.brand} | Tam: {item.size} | Cor: {item.color}</div>
                    </div>
                    <div className="text-sm">x{item.quantity}</div>
                    <div className="font-bold">R$ {item.price.toFixed(2)}</div>
                  </div>
                ))}
                <div className="flex justify-between mt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={currentPage === 1 ? undefined : () => setCurrentPage((p) => Math.max(1, p - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, idx) => (
            <PaginationItem key={idx}>
              <PaginationLink
                isActive={currentPage === idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={currentPage === totalPages ? undefined : () => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
