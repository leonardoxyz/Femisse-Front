import React from "react";
import { useCart } from "@/contexts/CartContext";

interface SidebarCartProps {
  open: boolean;
  onClose: () => void;
}

const SidebarCart: React.FC<SidebarCartProps> = ({ open, onClose }) => {
  const [shouldRender, setShouldRender] = React.useState(open);

  React.useEffect(() => {
    if (open) setShouldRender(true);
    else {
      // Aguarda a duração da animação antes de remover do DOM
      const timeout = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Fecha ao apertar ESC
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!shouldRender) return null;

  const { cart, removeFromCart, clearCart } = useCart();

  return (
    <>
      {/* Overlay escuro */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 animate-fade-in' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.40)' }}
        onClick={onClose}
        aria-label="Fechar carrinho"
      />
      {/* Sidebar animada */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transition-transform duration-500 ease-in-out
        ${open ? 'translate-x-0 animate-slide-in' : 'translate-x-full animate-slide-out'}`}
        style={{ boxShadow: open ? "-4px 0 24px 0 rgba(0,0,0,0.12)" : undefined }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Carrinho</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-primary text-2xl">&times;</button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Seu carrinho está vazio.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center mb-4">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded mr-3 border" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">Qtd: {item.quantity}</div>
                  <div className="text-xs text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-red-500 hover:text-red-700 text-xs"
                  title="Remover do carrinho"
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t flex flex-col gap-2">
          {cart.length > 0 && (
            <button
              className="w-full bg-red-100 text-red-700 py-2 rounded font-semibold hover:bg-red-200 transition"
              onClick={clearCart}
            >
              Limpar Carrinho
            </button>
          )}
          <button className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-pink-dark transition">Finalizar Compra</button>
        </div>
      </div>
    </>
  );
};

export default SidebarCart;
