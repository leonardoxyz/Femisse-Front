import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { AddressForm } from "./AddressForm";
import { API_ENDPOINTS } from "@/config/api";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

interface Address {
  id: string;
  usuario_id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}


export function AddressList() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.userAddresses, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) throw new Error("Erro ao buscar endereços");
      
      const data = await response.json();
      setAddresses(data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar endereços");
      console.error("Erro ao buscar endereços:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const startCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (address: Address) => {
    setEditing(address);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setShowForm(false);
  };

  const saveAddress = async (addressData: any) => {
    try {
      const method = editing?.id ? "PUT" : "POST";
      const url = editing?.id ? `${API_ENDPOINTS.address}/${editing.id}` : API_ENDPOINTS.userAddresses;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar endereço");
      }
      
      setEditing(null);
      setShowForm(false);
      await fetchAddresses();
      
    } catch (error) {
      throw error; // Re-throw para que o AddressForm possa tratar
    }
  };

  const confirmDeleteAddress = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_ENDPOINTS.address}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      
      toast({
        title: "Endereço excluído",
        description: "O endereço foi removido com sucesso!",
        variant: "default",
      });
      
      fetchAddresses();
    } catch {
      toast({
        title: "Erro ao excluir endereço",
        description: "Não foi possível excluir o endereço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Meus Endereços</h2>
          <p className="text-muted-foreground">Gerencie seus endereços de entrega</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={startCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Endereço
        </Button>
      </div>
      {/* Formulário usando o novo componente AddressForm */}
      {showForm && (
        <AddressForm
          address={editing || undefined}
          onSave={saveAddress}
          onCancel={cancelEdit}
          isEditing={!!editing}
        />
      )}
      {loading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4">
          {addresses.length === 0 ? (
            <div className="text-muted-foreground">Nenhum endereço cadastrado.</div>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                    <CardTitle>{address.label}</CardTitle>
                    {address.is_default && <Badge className="ml-2">Principal</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(address)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DeleteConfirmationDialog
                      title="Excluir endereço"
                      itemName={address.label}
                      onConfirm={() => confirmDeleteAddress(address.id)}
                      disabled={deletingId === address.id}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement && <> - {address.complement}</>}
                    <br />
                    {address.neighborhood} - {address.city}/{address.state}<br />
                    CEP: {address.zip_code}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
