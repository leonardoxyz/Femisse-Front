import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Save, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "@/components/ui/use-toast";

interface Address {
  id?: string;
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

interface AddressFormProps {
  address?: Address;
  onSave: (address: Address) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

// Função para formatar CEP
const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) {
    return numbers;
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

// Função para validar campo obrigatório
const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} é obrigatório`;
  }
  return null;
};

// Função para validar CEP
const validateCEP = (cep: string): string | null => {
  if (!cep) return 'CEP é obrigatório';
  const numbers = cep.replace(/\D/g, '');
  if (numbers.length !== 8) {
    return 'CEP deve ter 8 dígitos';
  }
  return null;
};

export function AddressFormSimple({ address, onSave, onCancel, isEditing = false }: AddressFormProps) {
  const [formData, setFormData] = useState<Address>({
    label: address?.label || '',
    street: address?.street || '',
    number: address?.number || '',
    complement: address?.complement || '',
    neighborhood: address?.neighborhood || '',
    city: address?.city || '',
    state: address?.state || '',
    zip_code: address?.zip_code || '',
    is_default: address?.is_default || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  // Atualizar dados do formulário quando o endereço mudar
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || '',
        street: address.street || '',
        number: address.number || '',
        complement: address.complement || '',
        neighborhood: address.neighborhood || '',
        city: address.city || '',
        state: address.state || '',
        zip_code: address.zip_code || '',
        is_default: address.is_default || false,
      });
      setHasChanges(false);
    }
  }, [address]);

  // Verificar se há mudanças
  useEffect(() => {
    if (address) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(address);
      setHasChanges(hasChanged);
    }
  }, [formData, address]);

  // Função para validar um campo específico
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'label':
      case 'street':
      case 'number':
      case 'neighborhood':
      case 'city':
        return validateRequired(value, name);
      case 'state':
        const requiredError = validateRequired(value, 'Estado');
        if (requiredError) return requiredError;
        return value.length === 2 ? null : 'Estado deve ter 2 caracteres';
      case 'zip_code':
        return validateCEP(value);
      default:
        return null;
    }
  };

  // Buscar endereço por CEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validar todos os campos
      const newErrors: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'complement' && key !== 'is_default') {
          const error = validateField(key, value as string);
          if (error) newErrors[key] = error;
        }
      });
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSaving(false);
        return;
      }
      
      await onSave(formData);
      
      toast({
        title: "Sucesso",
        description: `Endereço ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`,
      });
      
      setIsSaving(false);
      
    } catch (error) {
      setIsSaving(false);
      toast({
        title: "Erro",
        description: `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} endereço. Tente novamente.`,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (name: keyof Address, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    
    // Validar campo em tempo real apenas para strings
    if (typeof value === 'string') {
      const error = validateField(name as string, value);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  };

  const handleCepChange = (value: string) => {
    const formattedCep = formatCEP(value);
    handleInputChange('zip_code', formattedCep);
    
    // Buscar endereço quando CEP estiver completo
    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };

  const handleCancel = () => {
    if (address) {
      setFormData(address);
    }
    setErrors({});
    setHasChanges(false);
    onCancel();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rótulo */}
          <div className="space-y-2">
            <Label htmlFor="label">Rótulo *</Label>
            <Input
              id="label"
              placeholder="Ex: Casa, Trabalho, etc."
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className={errors.label ? 'border-red-500' : ''}
            />
            {errors.label && <p className="text-sm text-red-500">{errors.label}</p>}
          </div>

          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP *</Label>
            <div className="relative">
              <Input
                id="zip_code"
                placeholder="00000-000"
                value={formData.zip_code}
                onChange={(e) => handleCepChange(e.target.value)}
                className={errors.zip_code ? 'border-red-500' : ''}
                maxLength={9}
              />
              {isFetchingCep && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            {errors.zip_code && <p className="text-sm text-red-500">{errors.zip_code}</p>}
          </div>

          {/* Rua */}
          <div className="space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              placeholder="Nome da rua"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className={errors.street ? 'border-red-500' : ''}
            />
            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
          </div>

          {/* Número e Complemento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                placeholder="123"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                placeholder="Apto, Bloco, etc."
                value={formData.complement || ''}
                onChange={(e) => handleInputChange('complement', e.target.value)}
              />
            </div>
          </div>

          {/* Bairro */}
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              placeholder="Nome do bairro"
              value={formData.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              className={errors.neighborhood ? 'border-red-500' : ''}
            />
            {errors.neighborhood && <p className="text-sm text-red-500">{errors.neighborhood}</p>}
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                placeholder="Nome da cidade"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                placeholder="SP"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                className={errors.state ? 'border-red-500' : ''}
                maxLength={2}
              />
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>
          </div>

          {/* Endereço padrão */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked: CheckedState) => 
                handleInputChange('is_default', checked === true)
              }
            />
            <Label htmlFor="is_default">Definir como endereço padrão</Label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!hasChanges || isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default AddressFormSimple;
