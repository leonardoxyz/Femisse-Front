import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              Femisse
            </h3>
            <p className="text-background/80 text-sm leading-relaxed">
              Moda feminina com estilo e qualidade. Peças exclusivas para mulheres que sabem o que querem.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-background/60 hover:text-primary transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">SOBRE</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors duration-300">Quem Somos</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors duration-300">Perguntas Frequentes</a></li>
            </ul>
          </div>

          {/* Minha Conta */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Minha Conta</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/perfil" className="text-background/80 hover:text-primary transition-colors duration-300">Meu Perfil</a></li>
              <li><a href="/perfil/orders" className="text-background/80 hover:text-primary transition-colors duration-300">Minhas compras</a></li>
              <li><a href="/perfil/favorites" className="text-background/80 hover:text-primary transition-colors duration-300">Meus Favoritos</a></li>
            </ul>
          </div>

          {/* Políticas */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Políticas</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/trocas-devolucoes" className="text-background/80 hover:text-primary transition-colors duration-300">Trocas e Devoluções</a></li>
              <li><a href="/privacidade" className="text-background/80 hover:text-primary transition-colors duration-300">Política de Privacidade</a></li>
              <li><a href="/termos-de-uso" className="text-background/80 hover:text-primary transition-colors duration-300">Termos de Uso</a></li>
              <li><a href="/entregas-frete" className="text-background/80 hover:text-primary transition-colors duration-300">Entregas e Frete</a></li>
              <li><a href="/pagamento" className="text-background/80 hover:text-primary transition-colors duration-300">Pagamento</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-background/80">
                <Phone className="h-4 w-4 text-primary" />
                <span>(11) 99014-5322</span>
              </div>
              <div className="flex items-center gap-2 text-background/80">
                <Mail className="h-4 w-4 text-primary" />
                <span>contato@femisse.com.br</span>
              </div>
              <div className="flex items-start gap-2 text-background/80">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>São Paulo, SP<br />Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
          <p>&copy; 2025 Femisse Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <span>CNPJ: 00.000.000/0001-00</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;