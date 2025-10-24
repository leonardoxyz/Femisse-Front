import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { AddressForm } from "./AddressForm";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserAddresses, createAddress, updateAddress, deleteAddress } from "@/services/address";
import { logger } from '../../utils/logger-unified';

interface Address {
  id: string;
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
      const data = await fetchUserAddresses();
      setAddresses(data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar endereços");
      logger.error("Erro ao buscar endereços:", err);
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
      if (editing?.id) {
        await updateAddress(editing.id, addressData);
        toast({
          title: "Endereço atualizado",
          description: "O endereço foi atualizado com sucesso!",
          variant: "default",
        });
      } else {
        await createAddress(addressData);
        toast({
          title: "Endereço criado",
          description: "O endereço foi adicionado com sucesso!",
          variant: "default",
        });
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
      await deleteAddress(id);
      
      toast({
        title: "Endereço excluído",
        description: "O endereço foi removido com sucesso!",
        variant: "default",
      });
      
      fetchAddresses();
    } catch (error) {
      toast({
        title: "Erro ao excluir endereço",
        description: error instanceof Error ? error.message : "Não foi possível excluir o endereço. Tente novamente.",
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
