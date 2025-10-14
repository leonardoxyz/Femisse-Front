import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p>
            A Política de Privacidade e de Proteção de Dados da Femisse ("Política"), inscrita no CNPJ/ME sob o nº 42.955.642.000-1/94, com sede na cidade de São Paulo, Estado de São Paulo, tem por objetivo esclarecer aos usuários dos sites, plataformas e aplicações de Internet da Femisse sobre a coleta, uso, armazenamento e proteção de dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 - LGPD).
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. COLETA DE DADOS PESSOAIS</h2>
          <p>
            A Femisse coleta dados pessoais dos usuários de diversas formas, incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dados fornecidos diretamente pelo usuário no momento do cadastro (nome, e-mail, telefone, CPF, endereço, etc.)</li>
            <li>Dados de navegação coletados automaticamente (endereço IP, tipo de navegador, páginas visitadas, etc.)</li>
            <li>Dados de compras e transações realizadas nos sites da Femisse</li>
            <li>Dados fornecidos em formulários de contato, pesquisas de satisfação ou outras interações</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. USO DOS DADOS PESSOAIS</h2>
          <p>
            Os dados pessoais coletados pela Femisse são utilizados para as seguintes finalidades:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processar e gerenciar pedidos de compra</li>
            <li>Comunicar-se com os usuários sobre pedidos, promoções e novidades</li>
            <li>Melhorar a experiência de navegação e personalizar conteúdos</li>
            <li>Realizar análises estatísticas e pesquisas de mercado</li>
            <li>Prevenir fraudes e garantir a segurança dos usuários</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. COMPARTILHAMENTO DE DADOS</h2>
          <p>
            A Femisse poderá compartilhar dados pessoais dos usuários com:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Empresas parceiras para processamento de pagamentos e entregas</li>
            <li>Prestadores de serviços de tecnologia e infraestrutura</li>
            <li>Autoridades governamentais, quando exigido por lei</li>
            <li>Empresas do mesmo grupo econômico da Femisse</li>
          </ul>
          <p>
            A Femisse não vende, aluga ou comercializa dados pessoais de seus usuários com terceiros para fins de marketing sem o consentimento expresso do titular.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. ARMAZENAMENTO E SEGURANÇA DOS DADOS</h2>
          <p>
            A Femisse adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, perda, destruição ou alteração. Os dados são armazenados em servidores seguros e protegidos por criptografia.
          </p>
          <p>
            Os dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades para as quais foram coletados, ou conforme exigido por lei.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. DIREITOS DOS TITULARES DE DADOS</h2>
          <p>
            Em conformidade com a LGPD, os usuários têm os seguintes direitos em relação aos seus dados pessoais:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Confirmação da existência de tratamento de dados</li>
            <li>Acesso aos dados pessoais</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Portabilidade dos dados a outro fornecedor</li>
            <li>Eliminação dos dados tratados com consentimento</li>
            <li>Informação sobre compartilhamento de dados</li>
            <li>Revogação do consentimento</li>
          </ul>
          <p>
            Para exercer esses direitos, o usuário deve entrar em contato através do e-mail contato@femisse.com.br ou pelo telefone (11) 99014-5322.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. COOKIES E TECNOLOGIAS SIMILARES</h2>
          <p>
            A Femisse utiliza cookies e tecnologias similares para melhorar a experiência de navegação, personalizar conteúdos e anúncios, e analisar o tráfego do site. O usuário pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades do site.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. DADOS DE MENORES DE IDADE</h2>
          <p>
            Os sites, plataformas e aplicações de Internet da Femisse não são direcionados a menores de 18 anos. A Femisse não coleta intencionalmente dados pessoais de menores de idade sem o consentimento dos pais ou responsáveis legais.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. TRANSFERÊNCIA INTERNACIONAL DE DADOS</h2>
          <p>
            Os dados pessoais coletados pela Femisse poderão ser transferidos para outros países, sempre em conformidade com a legislação aplicável e com garantias adequadas de proteção.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. ALTERAÇÕES NA POLÍTICA DE PRIVACIDADE</h2>
          <p>
            A Femisse se reserva o direito de alterar esta Política de Privacidade a qualquer tempo, mediante publicação da versão atualizada nos seus sites, plataformas e aplicações de Internet. Recomendamos que os usuários revisem periodicamente esta Política.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. ENCARREGADO DE PROTEÇÃO DE DADOS (DPO)</h2>
          <p>
            Para questões relacionadas à proteção de dados pessoais, o usuário pode entrar em contato com o Encarregado de Proteção de Dados da Femisse através do e-mail: dpo@femisse.com.br
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. LEI APLICÁVEL E FORO</h2>
          <p>
            Esta Política de Privacidade é regida pela legislação brasileira, especialmente pela Lei Geral de Proteção de Dados (Lei 13.709/2018). Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer controvérsias.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">12. CONTATO</h2>
          <p>
            Para dúvidas, sugestões ou solicitações relacionadas a esta Política de Privacidade, entre em contato:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>E-mail:</strong> contato@femisse.com.br</li>
            <li><strong>Telefone:</strong> (11) 99014-5322</li>
            <li><strong>Endereço:</strong> São Paulo, SP - Brasil</li>
          </ul>

          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Última atualização: 01/08/2024
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
