import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

const emptyAddress: Partial<Address> = {
  label: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zip_code: "",
  is_default: false,
};

export function AddressList() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Address> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAddresses = () => {
    setLoading(true);
    fetch("/api/usuarios/me/addresses", {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar endereços");
        const data = await res.json();
        setAddresses(data);
        setError(null);
      })
      .catch(() => setError("Erro ao buscar endereços"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const startCreate = () => {
    setEditing({ ...emptyAddress });
  };

  const startEdit = (address: Address) => {
    setEditing(address);
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditing((prev) => ({
      ...prev!,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editing?.id ? "PUT" : "POST";
    const url = editing?.id
      ? `/api/address/${editing.id}`
      : "/api/address";
    const {
      label, street, number, complement, neighborhood, city, state, zip_code, is_default
    } = editing!;
    const body = {
      label, street, number, complement, neighborhood, city, state, zip_code, is_default
    };
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao salvar endereço");
      setEditing(null);
      fetchAddresses();
    } catch {
      alert("Erro ao salvar endereço");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este endereço?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/address/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchAddresses();
    } catch {
      alert("Erro ao excluir endereço");
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
      {/* Formulário sempre visível quando em modo criação ou edição */}
      {editing && (
        <form onSubmit={saveAddress} className="space-y-3 bg-card p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input input-bordered"
              name="label"
              placeholder="Rótulo (Ex: Casa, Trabalho)"
              value={editing.label || ""}
              onChange={handleChange}
              required
            />
            <input
              className="input input-bordered"
              name="street"
              placeholder="Rua"
              value={editing.street || ""}
              onChange={handleChange}
              required
            />
            <input
              className="input input-bordered"
              name="number"
              placeholder="Número"
              value={editing.number || ""}
              onChange={handleChange}
              required
            />
            <input
              className="input input-bordered"
              name="complement"
              placeholder="Complemento"
              value={editing.complement || ""}
              onChange={handleChange}
            />
            <input
              className="input input-bordered"
              name="neighborhood"
              placeholder="Bairro"
              value={editing.neighborhood || ""}
              onChange={handleChange}
              required
            />
            <input
              className="input input-bordered"
              name="city"
              placeholder="Cidade"
              value={editing.city || ""}
              onChange={handleChange}
              required
            />
            <input
              className="input input-bordered"
              name="state"
              placeholder="UF"
              value={editing.state || ""}
              onChange={handleChange}
              required
              maxLength={2}
            />
            <input
              className="input input-bordered"
              name="zip_code"
              placeholder="CEP"
              value={editing.zip_code || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="is_default"
              checked={!!editing.is_default}
              onChange={handleChange}
              id="is_default"
              className="checkbox checkbox-primary"
            />
            <label htmlFor="is_default" className="text-sm">Definir como principal</label>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="ghost" onClick={cancelEdit} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAddress(address.id)}
                      disabled={deletingId === address.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
