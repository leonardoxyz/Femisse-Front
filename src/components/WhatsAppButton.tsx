import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

const WHATSAPP_NUMBER = "5516993667268";
const DEFAULT_MESSAGE = "Eu ainda não tenho um cadastro na loja, mas adoraria saber mais sobre a loja, você pode me ajudar?";

const WhatsAppButton = () => {
  const { user, isAuthenticated } = useAuth();

  const message = useMemo(() => {
    const customerName = user?.nome?.trim();

    if (isAuthenticated && customerName) {
      return `Olá! Aqui é ${customerName} e gostaria de saber mais sobre os produtos Femisse.`;
    }

    return DEFAULT_MESSAGE;
  }, [isAuthenticated, user?.nome]);

  const whatsappUrl = useMemo(() => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  }, [message]);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition-transform duration-300 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-[#25D366]/60"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-7 w-7 text-white"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M16.04 3.363c-6.86 0-12.435 5.575-12.435 12.435 0 2.19.573 4.33 1.661 6.219L3.5 28.638l6.826-1.781a12.36 12.36 0 0 0 5.714 1.456h.014c6.86 0 12.436-5.575 12.436-12.435 0-3.319-1.293-6.44-3.64-8.787-2.347-2.347-5.468-3.728-8.786-3.728zm0 22.608h-.011a10.2 10.2 0 0 1-5.2-1.438l-.372-.222-4.052 1.057 1.081-3.951-.242-.405a10.203 10.203 0 0 1-1.566-5.487c0-5.65 4.601-10.251 10.26-10.251 2.737 0 5.312 1.066 7.249 3.003 1.937 1.937 3.004 4.513 3.004 7.25 0 5.65-4.602 10.244-10.251 10.244zm5.6-7.655c-.305-.154-1.804-.89-2.085-.992-.28-.102-.484-.154-.688.154-.205.308-.79.991-.968 1.196-.178.205-.356.23-.66.077-.305-.154-1.288-.475-2.454-1.514-.907-.809-1.52-1.807-1.697-2.112-.178-.308-.019-.474.134-.628.138-.138.305-.356.458-.534.154-.178.205-.308.305-.512.102-.205.051-.384-.025-.537-.077-.154-.688-1.662-.942-2.281-.248-.592-.5-.512-.688-.521-.177-.009-.382-.011-.587-.011-.205 0-.537.077-.819.383-.28.308-1.074 1.05-1.074 2.561 0 1.511 1.099 2.972 1.252 3.177.154.205 2.161 3.302 5.238 4.637.732.316 1.302.505 1.745.647.734.234 1.404.201 1.933.122.59-.088 1.804-.737 2.059-1.448.255-.71.255-1.319.178-1.448-.077-.128-.28-.205-.585-.357z"
        />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
