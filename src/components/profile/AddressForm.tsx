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
  onSave: (address: Address) => Promise<void> | void;
  onCancel: () => void;
  isEditing?: boolean;
}

// Máscaras para formatação
const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return value;
};

// Validações frontend
const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} é obrigatório`;
  }
  return null;
};

const validateCEP = (cep: string): string | null => {
  if (!cep) return 'CEP é obrigatório';
  const numbers = cep.replace(/\D/g, '');
  if (numbers.length !== 8) {
    return 'CEP deve ter 8 dígitos';
  }
  return null;
};

export function AddressForm({ address, onSave, onCancel, isEditing = false }: AddressFormProps) {
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

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  // Inicializar dados quando address estiver disponível
  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  // Verificar se há mudanças
  useEffect(() => {
    if (address) {
      const hasChanged = 
        formData.label !== (address.label || '') ||
        formData.street !== (address.street || '') ||
        formData.number !== (address.number || '') ||
        formData.complement !== (address.complement || '') ||
        formData.neighborhood !== (address.neighborhood || '') ||
        formData.city !== (address.city || '') ||
        formData.state !== (address.state || '') ||
        formData.zip_code !== (address.zip_code || '') ||
        formData.is_default !== (address.is_default ?? true);
      setHasChanges(hasChanged);
    } else {
      // Para novo endereço, verificar se há dados preenchidos
      const hasData = 
        formData.label.trim() !== '' ||
        formData.street.trim() !== '' ||
        formData.number.trim() !== '' ||
        formData.complement?.trim() !== '' ||
        formData.neighborhood.trim() !== '' ||
        formData.city.trim() !== '' ||
        formData.state.trim() !== '' ||
        formData.zip_code.trim() !== '';
      setHasChanges(hasData);
    }
  }, [formData, address]);

  const handleSave = async () => {
    // Validar campos obrigatórios
    const errors: Record<string, string | null> = {};
    errors.label = validateRequired(formData.label, 'Rótulo');
    errors.street = validateRequired(formData.street, 'Rua');
    errors.number = validateRequired(formData.number, 'Número');
    errors.neighborhood = validateRequired(formData.neighborhood, 'Bairro');
    errors.city = validateRequired(formData.city, 'Cidade');
    errors.state = validateRequired(formData.state, 'Estado');
    errors.zip_code = validateCEP(formData.zip_code);

    setErrors(errors);

    // Verificar se há erros de validação
    const hasValidationErrors = Object.values(errors).some(error => error !== null);
    if (hasValidationErrors) {
      toast({
        title: "Erro de validação",
        description: "Corrija os erros nos campos antes de salvar",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      await onSave(formData);
      
      toast({
        title: address ? "Endereço atualizado" : "Endereço criado",
        description: address ? "Endereço atualizado com sucesso!" : "Novo endereço adicionado com sucesso!",
        variant: "default",
      });
      
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : 'Erro ao salvar endereço',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    const sanitizedCep = cep.replace(/\D/g, '');
    if (sanitizedCep.length !== 8) {
      return;
    }

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${sanitizedCep}/json/`);
      if (!response.ok) {
        throw new Error('Não foi possível buscar o CEP.');
      }
      const data = await response.json();
      if (data.erro) {
        throw new Error('CEP não encontrado.');
      }

      setFormData(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      }));

      setErrors(prev => ({
        ...prev,
        street: null,
        neighborhood: null,
        city: null,
        state: null,
        zip_code: null
      }));

      toast({
        title: 'CEP encontrado',
        description: 'Preencha o número e o rótulo do endereço para continuar.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: error instanceof Error ? error.message : 'Não foi possível localizar o endereço para este CEP.',
        variant: 'destructive'
      });
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleInputChange = (field: keyof Address, value: string | boolean) => {
    let processedValue = value;
    let error: string | null = null;

    // Aplicar máscaras e validações por campo
    if (typeof value === 'string') {
      switch (field) {
        case 'label':
          error = validateRequired(value, 'Rótulo');
          break;
        case 'street':
          error = validateRequired(value, 'Rua');
          break;
        case 'number':
          error = validateRequired(value, 'Número');
          break;
        case 'neighborhood':
          error = validateRequired(value, 'Bairro');
          break;
        case 'city':
          error = validateRequired(value, 'Cidade');
          break;
        case 'state':
          error = validateRequired(value, 'Estado');
          break;
        case 'zip_code':
          processedValue = formatCEP(value);
          error = validateCEP(processedValue as string);
          break;
      }
    }

    // Atualizar dados
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    if (field === 'zip_code' && typeof processedValue === 'string') {
      const sanitizedCep = processedValue.replace(/\D/g, '');
      if (sanitizedCep.length === 8) {
        fetchAddressByCep(sanitizedCep);
      }
    }

    // Atualizar erros apenas para campos de string
    if (typeof value === 'string') {
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">
            {address ? 'Editar Endereço' : 'Novo Endereço'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha as informações do endereço
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="label">Rótulo do endereço *</Label>
            <Input 
              id="label" 
              placeholder="Ex: Casa, Trabalho, Apartamento" 
              value={formData.label} 
              onChange={(e) => handleInputChange('label', e.target.value)}
              className={errors.label ? 'border-red-500' : ''} 
            />
            {errors.label && <p className="text-sm text-red-500">{errors.label}</p>}
          </div>
          <div>
            <Label htmlFor="zip_code">CEP *</Label>
            <Input 
              id="zip_code" 
              placeholder="00000-000" 
              value={formData.zip_code} 
              onChange={(e) => handleInputChange('zip_code', e.target.value)}
              className={errors.zip_code ? 'border-red-500' : ''} 
              disabled={isFetchingCep}
            />
            {isFetchingCep && (
              <p className="text-sm text-muted-foreground mt-1">Buscando informações do CEP...</p>
            )}
            {errors.zip_code && <p className="text-sm text-red-500">{errors.zip_code}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
          <div>
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
        </div>

        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input 
            id="complement" 
            placeholder="Apto, bloco, etc. (opcional)" 
            value={formData.complement || ''} 
            onChange={(e) => handleInputChange('complement', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
          <div>
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
          <div>
            <Label htmlFor="state">Estado *</Label>
            <Input 
              id="state" 
              placeholder="SP" 
              value={formData.state} 
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={errors.state ? 'border-red-500' : ''} 
              maxLength={2}
            />
            {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_default"
            checked={formData.is_default}
            onCheckedChange={(checked: CheckedState) => handleInputChange('is_default', checked === true)}
          />
          <Label htmlFor="is_default">Definir como endereço padrão</Label>
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            style={{ backgroundColor: hasChanges && !isSaving ? '#58090d' : undefined }}
            className={hasChanges && !isSaving ? "text-white hover:opacity-90" : ""}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : (address ? 'Salvar alterações' : 'Adicionar endereço')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
