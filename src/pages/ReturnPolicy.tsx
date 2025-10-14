import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Trocas e Devoluções</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Seus Direitos</p>
                <p className="text-sm text-blue-800 mt-1">
                  A Femisse respeita integralmente o Código de Defesa do Consumidor. Você tem direito a troca, devolução e arrependimento conforme estabelecido pela legislação brasileira.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Direito de Arrependimento (7 dias)</h2>
          <p>
            Conforme o Código de Defesa do Consumidor (Art. 49), você pode desistir da compra em até <strong>7 (sete) dias corridos</strong> a partir do recebimento do produto, sem necessidade de justificativa.
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>O produto deve estar em perfeito estado, sem sinais de uso</li>
            <li>Embalagem original preservada</li>
            <li>Etiquetas e lacres intactos</li>
            <li>Reembolso integral do valor pago (produto + frete)</li>
            <li>Prazo de reembolso: até 10 dias úteis após recebermos o produto</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Trocas e Devoluções</h2>
          <p>
            Além do direito de arrependimento, você pode solicitar troca ou devolução nas seguintes situações:
          </p>

          <div className="space-y-6 my-8">
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Produto entregue em desacordo</h3>
                  <p className="text-sm text-muted-foreground">
                    Caso o(a) cliente tenha o desprazer de comprar uma peça diferente da que foi apresentada na foto do site e queira efetuar a troca, deve entrar em contato através do número <strong>(11) 99014-5322</strong> em até <strong>7 (sete) dias corridos</strong> após o recebimento da mercadoria.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start">
                <RefreshCw className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Produto com defeito</h3>
                  <p className="text-sm text-muted-foreground">
                    Caso o(a) cliente tenha encontrado algum defeito na peça deve entrar em contato em até <strong>7 (sete) dias corridos</strong> através do número <strong>(11) 99014-5322</strong>. Nossa equipe irá fazer uma análise e assim que comprovado ser um defeito de fábrica nós arcaremos com o frete de volta e daremos as alternativas possíveis para a melhor resolução dessa adversidade.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-start">
                <XCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-900">Peças íntimas</h3>
                  <p className="text-sm text-red-800">
                    Peças íntimas seguem padrões de higiene impostos pela ANVISA. Sendo assim, <strong>não efetuamos troca ou devoluções</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Produto Indisponível no Estoque</h2>
          <p>
            Caso algum produto esteja indisponível no momento da separação do pedido, nossa equipe entrará em contato através dos dados fornecidos na compra para oferecer as seguintes opções:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Substituição por produto similar (mesma categoria, cor ou tamanho diferente)</li>
            <li>Reembolso proporcional do valor do produto indisponível</li>
            <li>Cancelamento total do pedido com reembolso integral</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Troca por Tamanho ou Cor</h2>
          <p>
            Se você recebeu o produto mas deseja trocar por outro tamanho ou cor:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Prazo para solicitação: até <strong>30 dias</strong> após o recebimento</li>
            <li>Produto deve estar sem uso, com etiquetas e embalagem original</li>
            <li>Primeira troca: frete por nossa conta</li>
            <li>Trocas subsequentes: frete por conta do cliente</li>
            <li>Sujeito à disponibilidade em estoque</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
            <p className="font-semibold text-blue-900">
              Prazo de Reembolso: até 10 (dez) dias úteis após o recebimento e análise do produto devolvido. O valor será estornado na mesma forma de pagamento utilizada na compra.
            </p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Condições para Troca/Devolução</h2>
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg space-y-3">
            <p className="font-semibold text-amber-900">Peças USADAS, SUJAS OU COM MARCAS DE USO NÃO SERÃO ACEITAS.</p>
            <p className="font-semibold text-amber-900">TODA E QUALQUER DEVOLUÇÃO PASSA POR ANÁLISE!</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Como Solicitar Troca ou Devolução</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li>Entre em contato através do WhatsApp <strong>(11) 99014-5322</strong> ou e-mail <strong>contato@femisse.com.br</strong></li>
            <li>Informe o número do pedido e o motivo da troca/devolução</li>
            <li>Aguarde as instruções da nossa equipe</li>
            <li>Embale o produto adequadamente com todas as etiquetas originais</li>
            <li>Envie o produto conforme orientação recebida</li>
            <li>Acompanhe o processo através dos nossos canais de atendimento</li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-4">Prazo de Análise</h2>
          <p>
            Após o recebimento do produto devolvido, nossa equipe realizará a análise em até <strong>5 (cinco) dias úteis</strong>. Você será informado sobre o resultado da análise e os próximos passos.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contato</h2>
          <p>
            Para dúvidas ou solicitações de troca/devolução:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>WhatsApp:</strong> (11) 99014-5322</li>
            <li><strong>E-mail:</strong> contato@femisse.com.br</li>
            <li><strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Garantia Legal</h2>
          <p>
            Todos os produtos vendidos pela Femisse possuem garantia legal de 90 dias para produtos duráveis, conforme estabelecido pelo Código de Defesa do Consumidor (Art. 26).
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 my-8">
            <p className="font-semibold text-green-900">
              Sua satisfação é nossa prioridade! Estamos à disposição para garantir a melhor experiência de compra.
            </p>
          </div>

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

export default ReturnPolicy;
