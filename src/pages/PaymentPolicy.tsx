import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCard, Smartphone, FileText } from 'lucide-react';

const PaymentPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Formas de Pagamento</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <h2 className="text-2xl font-bold mt-8 mb-4">Formas de Pagamento</h2>
          <p>
            Aceitamos diversas formas de pagamento para proporcionar conveniência aos nossos clientes:
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="bg-card p-6 rounded-lg border">
              <CreditCard className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cartão de Crédito</h3>
              <p className="text-sm text-muted-foreground">
                Parcelamento em até 12x sem juros. Aceitamos as principais bandeiras.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <Smartphone className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">PIX</h3>
              <p className="text-sm text-muted-foreground">
                Pagamento instantâneo com aprovação imediata. Desconto de 5% no PIX.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Boleto Bancário</h3>
              <p className="text-sm text-muted-foreground">
                Pagamento em até 3 dias úteis após a emissão do boleto.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Cartão de Crédito</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Parcelamento em até 12x sem juros para compras acima de R$ 100,00</li>
            <li>Compras abaixo de R$ 100,00: parcelamento em até 6x sem juros</li>
            <li>Aceitamos as bandeiras: Visa, Mastercard, Elo, American Express, Hipercard e Diners</li>
            <li>Aprovação imediata na maioria dos casos</li>
            <li>Transações processadas com segurança pelo Mercado Pago</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">PIX</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Desconto de 5% em todas as compras pagas via PIX</li>
            <li>Pagamento instantâneo com aprovação imediata</li>
            <li>QR Code gerado automaticamente após a finalização do pedido</li>
            <li>Prazo de validade do QR Code: 30 minutos</li>
            <li>Pedido liberado automaticamente após confirmação do pagamento</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Boleto Bancário</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Prazo de pagamento: até 3 dias úteis após a emissão</li>
            <li>Boleto enviado por e-mail após finalização do pedido</li>
            <li>Confirmação do pagamento em até 2 dias úteis</li>
            <li>Pedido processado somente após confirmação do pagamento</li>
            <li>Não é possível parcelar no boleto</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Segurança nas Transações</h2>
          <p>
            Todas as transações realizadas no site da Femisse são processadas com total segurança através do Mercado Pago, uma das maiores plataformas de pagamento da América Latina.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Certificado SSL para criptografia de dados</li>
            <li>Proteção contra fraudes</li>
            <li>Dados de cartão não armazenados em nossos servidores</li>
            <li>Conformidade com PCI DSS (Payment Card Industry Data Security Standard)</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Política de Estorno e Reembolso</h2>
          <p>
            Em caso de cancelamento de pedido ou devolução de produto, o reembolso será processado da seguinte forma:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cartão de Crédito:</strong> Estorno em até 2 faturas subsequentes</li>
            <li><strong>PIX:</strong> Reembolso em até 10 dias úteis na conta de origem</li>
            <li><strong>Boleto:</strong> Reembolso via transferência bancária em até 10 dias úteis</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Cupons de Desconto</h2>
          <p>
            A Femisse oferece cupons de desconto promocionais que podem ser aplicados no carrinho ou na finalização da compra:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Apenas um cupom pode ser utilizado por compra</li>
            <li>Cupons não são cumulativos com outras promoções, salvo indicação contrária</li>
            <li>Verifique sempre a validade e condições de uso do cupom</li>
            <li>O desconto do cupom é aplicado antes do cálculo do frete</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Dúvidas sobre Pagamento</h2>
          <p>
            Para dúvidas ou problemas relacionados a pagamentos, entre em contato:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>E-mail:</strong> contato@femisse.com.br</li>
            <li><strong>WhatsApp:</strong> (11) 99014-5322</li>
            <li><strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h</li>
          </ul>

          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPolicy;
