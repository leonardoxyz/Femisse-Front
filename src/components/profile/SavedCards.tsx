import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Edit, Trash2, Plus, Star } from "lucide-react";

interface SavedCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'elo';
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

const savedCards: SavedCard[] = [
  {
    id: "1",
    last4: "1234",
    brand: "visa",
    holderName: "Leonardo Santos",
    expiryMonth: "12",
    expiryYear: "26",
    isDefault: true,
  },
  {
    id: "2",
    last4: "5678",
    brand: "mastercard",
    holderName: "Leonardo Santos",
    expiryMonth: "08",
    expiryYear: "25",
    isDefault: false,
  },
];

export function SavedCards() {
  const getBrandIcon = (brand: SavedCard['brand']) => {
    return <CreditCard className="h-6 w-6 text-muted-foreground" />;
  };

  const getBrandName = (brand: SavedCard['brand']) => {
    switch (brand) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      case 'elo':
        return 'Elo';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Cartões Salvos</h2>
          <p className="text-muted-foreground">Gerencie seus cartões de crédito</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cartão
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savedCards.map((card) => (
          <Card key={card.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                {getBrandIcon(card.brand)}
                <CardTitle>{getBrandName(card.brand)} **** {card.last4}</CardTitle>
                {card.isDefault && <Badge className="ml-2">Principal</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Titular: {card.holderName}<br />
                Validade: {card.expiryMonth}/{card.expiryYear}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
