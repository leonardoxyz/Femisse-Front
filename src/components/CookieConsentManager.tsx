import React from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const OPTIONAL_CATEGORIES = {
  preferences: {
    title: "Cookies funcionais",
    description: "Memorizam suas preferências, como idioma e últimos acessos.",
  },
  analytics: {
    title: "Cookies de analytics",
    description: "Ajudam a entender como o site é utilizado para melhorar sua experiência.",
  },
  marketing: {
    title: "Cookies de marketing",
    description: "Utilizados para personalizar ofertas e campanhas.",
  },
} as const;

const CookieConsentManager: React.FC = () => {
  const {
    consent,
    isBannerVisible,
    isPreferencesOpen,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
    resetConsent,
  } = useCookieConsent();

  const [formState, setFormState] = React.useState({
    preferences: consent?.preferences ?? false,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
  });

  React.useEffect(() => {
    if (isPreferencesOpen) {
      setFormState({
        preferences: consent?.preferences ?? false,
        analytics: consent?.analytics ?? false,
        marketing: consent?.marketing ?? false,
      });
    }
  }, [isPreferencesOpen, consent]);

  const handleToggle = (key: keyof typeof formState) => {
    setFormState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    savePreferences(formState);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openPreferences();
    } else {
      closePreferences();
    }
  };

  return (
    <>
      {isBannerVisible && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
          <div className="w-full max-w-6xl rounded-lg border bg-card/95 backdrop-blur shadow-lg p-5 space-y-4">
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                  <Cookie className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    Usamos cookies para melhorar sua experiência
                  </p>
                  <p>
                    Utilizamos cookies conforme nossa
                    {" "}
                    <Link to="/politica-de-privacidade" className="underline">
                      política de privacidade
                    </Link>
                    {" "}
                    e
                    {" "}
                    <Link to="/termos-de-uso" className="underline">
                      termos de uso
                    </Link>
                    . Você pode aceitar todos, rejeitar opcionais ou personalizar.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" onClick={rejectAll}>
                Rejeitar opcionais
              </Button>
              <Button variant="outline" onClick={openPreferences}>
                Personalizar
              </Button>
              <Button onClick={acceptAll}>
                Aceitar todos
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isPreferencesOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preferências de cookies</DialogTitle>
            <DialogDescription>
              Selecione quais categorias de cookies opcionais você autoriza. Os cookies necessários são sempre utilizados para garantir o funcionamento do site.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <Label className="flex items-center justify-between text-sm font-semibold">
                  Cookies necessários
                  <Switch checked disabled aria-readonly className="pointer-events-none opacity-50" />
                </Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  Essenciais para o funcionamento do site, autenticando sessões e lembrando itens do carrinho. Não podem ser desativados.
                </p>
              </div>

              {Object.entries(OPTIONAL_CATEGORIES).map(([key, info]) => (
                <div key={key} className="rounded-md border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label htmlFor={`cookie-${key}`} className="text-sm font-semibold">
                        {info.title}
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">{info.description}</p>
                    </div>
                    <Switch
                      id={`cookie-${key}`}
                      checked={formState[key as keyof typeof formState]}
                      onCheckedChange={() => handleToggle(key as keyof typeof formState)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-wrap justify-between gap-2">
              <Button type="button" variant="ghost" onClick={resetConsent}>
                Limpar consentimento
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={rejectAll}>
                  Rejeitar opcionais
                </Button>
                <Button type="submit">
                  Salvar preferências
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsentManager;
