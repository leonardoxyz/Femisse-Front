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
import { Skeleton } from "@/components/ui/skeleton";

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
  const { isAuthenticated } = useAuth(); // ✅ Removido token, usando apenas isAuthenticated
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
      });
      
      if (!response.ok) throw new Error("Erro ao buscar endereços");
      
      const payload = await response.json();
      const data = Array.isArray(payload?.data) ? payload.data : payload;
      setAddresses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar endereços");
      console.error("Erro ao buscar endereços:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]); // ✅ Atualizado para usar isAuthenticated

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
        credentials: "include", // ✅ Cookie httpOnly é enviado automaticamente
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });
      
      if (!response.ok) {
        let errorMessage = "Erro ao salvar endereço";
        const contentType = response.headers.get("Content-Type") ?? "";

        try {
          if (contentType.includes("application/json")) {
            const errorData = await response.json();
            if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } else {
            const text = await response.text();
            if (text) {
              errorMessage = text;
            }
          }
        } catch (parseError) {
          console.error("Falha ao interpretar resposta ao salvar endereço:", parseError);
        }

        throw new Error(errorMessage);
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
        credentials: "include", // ✅ Cookie httpOnly é enviado automaticamente
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
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-[#58090d]/30" />
              <Skeleton className="h-4 w-64 bg-[#58090d]/20" />
            </div>
            <Skeleton className="h-10 w-48 rounded-sm bg-[#58090d]/30" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="border border-[#58090d]/20 bg-[#58090d]/5">
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full bg-[#58090d]/30" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2 bg-[#58090d]/30" />
                      <Skeleton className="h-3 w-1/3 bg-[#58090d]/20" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-sm bg-[#58090d]/20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full bg-[#58090d]/20" />
                  <Skeleton className="h-3 w-3/4 bg-[#58090d]/20" />
                  <Skeleton className="h-3 w-1/2 bg-[#58090d]/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
