import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Truck, Package, MapPin, Clock } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Entregas e Frete</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-lg">
            Na Femisse, garantimos a entrega do seu pedido com total segurança, pode ficar tranquilo!
          </p>

          <p>
            Estamos constantemente dedicados a aprimorar nossos processos logísticos para assegurar entregas cada vez mais ágeis e eficientes. Nosso compromisso é proporcionar a melhor experiência possível aos nossos clientes.
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-card p-6 rounded-lg border">
              <Truck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-sm text-muted-foreground">
                Trabalhamos com as melhores transportadoras para garantir entregas rápidas e seguras.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <Package className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Embalagem Segura</h3>
              <p className="text-sm text-muted-foreground">
                Todos os produtos são cuidadosamente embalados para chegarem perfeitos até você.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Rastreamento</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu pedido em tempo real através do código de rastreamento.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Prazos Confiáveis</h3>
              <p className="text-sm text-muted-foreground">
                Cumprimos os prazos estabelecidos e mantemos você informado sobre o status da entrega.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Prazo de Entrega</h2>
          <p>
            O prazo de entrega varia de acordo com a região de destino e a modalidade de frete escolhida:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Região Sudeste:</strong> 3 a 7 dias úteis</li>
            <li><strong>Região Sul:</strong> 5 a 10 dias úteis</li>
            <li><strong>Região Centro-Oeste:</strong> 7 a 12 dias úteis</li>
            <li><strong>Região Nordeste:</strong> 8 a 15 dias úteis</li>
            <li><strong>Região Norte:</strong> 10 a 20 dias úteis</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            * Os prazos começam a contar a partir da confirmação do pagamento.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Cálculo do Frete</h2>
          <p>
            O valor do frete é calculado automaticamente no carrinho de compras, considerando:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>CEP de destino</li>
            <li>Peso e dimensões dos produtos</li>
            <li>Modalidade de entrega escolhida</li>
          </ul>
          <p>
            Para calcular o frete, basta adicionar os produtos ao carrinho e informar seu CEP na página de checkout.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Frete Grátis</h2>
          <p>
            Oferecemos frete grátis em condições especiais:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Compras acima de R$ 299,00 para todo o Brasil</li>
            <li>Promoções sazonais (Black Friday, Natal, etc.)</li>
            <li>Cupons promocionais específicos</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Rastreamento do Pedido</h2>
          <p>
            Após o envio do pedido, você receberá por e-mail o código de rastreamento para acompanhar a entrega:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Código de rastreamento enviado em até 24h após o despacho</li>
            <li>Acompanhamento em tempo real no site da transportadora</li>
            <li>Notificações por e-mail sobre o status da entrega</li>
            <li>Consulta disponível também na área "Meus Pedidos" do site</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Problemas com a Entrega</h2>
          <p>
            Caso ocorra algum problema com a entrega do seu pedido:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Produto não entregue:</strong> Entre em contato conosco para verificar o status</li>
            <li><strong>Produto danificado:</strong> Não aceite a entrega e nos informe imediatamente</li>
            <li><strong>Produto extraviado:</strong> Abriremos uma ocorrência com a transportadora</li>
            <li><strong>Endereço incorreto:</strong> Verifique sempre os dados antes de finalizar a compra</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Regiões Não Atendidas</h2>
          <p>
            Atualmente, entregamos para todo o território nacional. Algumas localidades remotas podem ter prazos estendidos ou custos adicionais de frete.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Dúvidas sobre Entrega</h2>
          <p>
            Para dúvidas ou problemas relacionados à entrega, entre em contato:
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

export default ShippingPolicy;
