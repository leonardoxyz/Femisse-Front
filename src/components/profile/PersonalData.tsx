import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";

import { useUserData } from "@/hooks/useUserData";
import { updateUserProfile, UpdateProfileData } from "@/services/userService";

// Função auxiliar para formatar data
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  // Se já está no formato YYYY-MM-DD, retorna como está
  if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateString.split('T')[0];
  }
  // Se está em outro formato, converte
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
};

// Máscaras para formatação
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return value;
};

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

// Validações frontend
const validateName = (name: string): string | null => {
  if (!name || name.trim().length < 3) {
    return 'Nome deve ter pelo menos 3 caracteres';
  }
  if (name.trim().length > 100) {
    return 'Nome deve ter no máximo 100 caracteres';
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim())) {
    return 'Nome deve conter apenas letras e espaços';
  }
  return null;
};

const validateCPF = (cpf: string): string | null => {
  if (cpf) return null; 
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) {
    return 'CPF deve ter 11 dígitos';
  }
  if (/^(\d)\1{10}$/.test(numbers)) {
    return 'CPF inválido';
  }
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Telefone é opcional
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length < 10 || numbers.length > 11) {
    return 'Telefone deve ter 10 ou 11 dígitos';
  }
  return null;
};

interface PersonalDataProps {
  highlightCPF?: boolean;
  onCPFUpdated?: (cpf: string | null) => void;
}

export function PersonalData({ highlightCPF = false, onCPFUpdated }: PersonalDataProps) {
  const { userData, loading, updateUserData } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    nome: '',
    data_nascimento: '',
    cpf: '',
    telefone: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string | null}>({
    nome: null,
    cpf: null,
    telefone: null
  });

  // Inicializar dados editáveis quando userData estiver disponível
  useEffect(() => {
    if (userData) {
      setEditedData({
        nome: userData.nome || '',
        data_nascimento: userData.data_nascimento || '',
        cpf: userData.cpf || '',
        telefone: userData.telefone || ''
      });
    }
  }, [userData]);

  // Auto-habilitar edição se highlightCPF for true e CPF estiver vazio
  useEffect(() => {
    if (highlightCPF && userData && !userData.cpf) {
      setIsEditing(true);
    }
  }, [highlightCPF, userData]);

  // Verificar se há mudanças
  useEffect(() => {
    if (userData) {
      const hasChanged = 
        editedData.nome !== (userData.nome || '') ||
        editedData.data_nascimento !== (userData.data_nascimento || '') ||
        editedData.cpf !== (userData.cpf || '') ||
        editedData.telefone !== (userData.telefone || '');
      setHasChanges(hasChanged);
    }
  }, [editedData, userData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Resetar para os dados originais
    if (userData) {
      setEditedData({
        nome: userData.nome || '',
        data_nascimento: userData.data_nascimento || '',
        cpf: userData.cpf || '',
        telefone: userData.telefone || ''
      });
    }
  };

  const handleSave = async () => {
    // Verificar se há erros de validação
    const hasValidationErrors = Object.values(fieldErrors).some(error => error !== null);
    if (hasValidationErrors) {
      setSaveError('Corrija os erros nos campos antes de salvar');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    
    try {
      const profileData: UpdateProfileData = {
        nome: editedData.nome,
        data_nascimento: editedData.data_nascimento,
        cpf: editedData.cpf,
        telefone: editedData.telefone
      };
      
      const response = await updateUserProfile(profileData);
      
      setSaveSuccess(response.message);
      setIsEditing(false);
      
      // Atualizar os dados locais com a resposta do servidor
      const updatedData = {
        nome: response.user.nome || '',
        data_nascimento: response.user.data_nascimento || '',
        cpf: response.user.cpf || '',
        telefone: response.user.telefone || ''
      };
      
      setEditedData(updatedData);
      
      // Atualizar o contexto global do usuário (para atualizar header)
      updateUserData(response.user);

      if (onCPFUpdated) {
        onCPFUpdated(updatedData.cpf || null);
      }
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSaveSuccess(null), 3000);
      
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar dados');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    let error: string | null = null;

    // Aplicar máscaras e validações por campo
    switch (field) {
      case 'nome':
        error = validateName(value);
        break;
      case 'cpf':
        processedValue = formatCPF(value);
        error = validateCPF(processedValue);
        break;
      case 'telefone':
        processedValue = formatPhone(value);
        error = validatePhone(processedValue);
        break;
    }

    // Atualizar dados
    setEditedData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Atualizar erros
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Meus Dados</h2>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e de acesso</p>
        </div>
        <Card className="border-[#58090d]/20 bg-[#58090d]/5">
          <CardHeader className="flex flex-col space-y-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-1/4 bg-[#58090d]/30" />
              <Skeleton className="h-3 w-1/2 bg-[#58090d]/20" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-24 rounded-sm bg-[#58090d]/30" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="space-y-2">
                  <Skeleton className="h-3 w-1/3 bg-[#58090d]/30" />
                  <Skeleton className="h-10 w-full rounded-sm bg-[#58090d]/20" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <Skeleton className="h-9 w-24 rounded-sm bg-[#58090d]/20" />
              <Skeleton className="h-9 w-32 rounded-sm bg-[#58090d]/30" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded bg-[#58090d]/30" />
              <Skeleton className="h-3 w-40 bg-[#58090d]/20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!userData) {
    console.warn('⚠️ PersonalData - userData é null/undefined');
    return <div>Não foi possível carregar os dados.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Meus Dados</h2>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e de acesso</p>
      </div>
      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Dados pessoais</CardTitle>
            <p className="text-sm text-muted-foreground">Todas as informações são obrigatórias</p>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mensagens de erro e sucesso */}
          {saveError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {saveSuccess}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nome completo</Label>
              <Input 
                id="fullName" 
                placeholder="Insira seu nome completo" 
                value={editedData.nome} 
                onChange={(e) => handleInputChange('nome', e.target.value)}
                disabled={!isEditing} 
                className={`${!isEditing ? "bg-muted" : ""} ${fieldErrors.nome && isEditing ? "border-red-500" : ""}`} 
              />
              {fieldErrors.nome && isEditing && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.nome}</p>
              )}
            </div>
            <div>
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input 
                id="birthDate" 
                type={isEditing ? "date" : "text"}
                placeholder="Insira sua data de nascimento" 
                value={isEditing 
                  ? formatDateForInput(editedData.data_nascimento) 
                  : formatDateForDisplay(editedData.data_nascimento)
                } 
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                disabled={!isEditing} 
                className={!isEditing ? "bg-muted" : ""} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${highlightCPF && !editedData.cpf ? 'relative' : ''}`}>
              {highlightCPF && !editedData.cpf && (
                <div className="absolute -inset-2 bg-amber-200/30 rounded-lg animate-pulse border-2 border-amber-400" />
              )}
              <div className="relative">
                <Label htmlFor="cpf" className={highlightCPF && !editedData.cpf ? 'text-amber-700 font-semibold' : ''}>
                  CPF {highlightCPF && !editedData.cpf && <span className="text-amber-600">*</span>}
                </Label>
                <Input 
                  id="cpf" 
                  placeholder="Insira seu CPF" 
                  value={editedData.cpf} 
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  disabled={!isEditing} 
                  className={`${!isEditing ? "bg-muted" : ""} ${fieldErrors.cpf && isEditing ? "border-red-500" : ""} ${highlightCPF && !editedData.cpf ? "border-amber-500 border-2" : ""}`} 
                />
                {fieldErrors.cpf && isEditing && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.cpf}</p>
                )}
                {highlightCPF && !editedData.cpf && (
                  <p className="text-amber-700 text-sm mt-1 font-medium">⚠ CPF obrigatório para finalizar compra</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                placeholder="Insira seu telefone" 
                value={editedData.telefone} 
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                disabled={!isEditing} 
                className={`${!isEditing ? "bg-muted" : ""} ${fieldErrors.telefone && isEditing ? "border-red-500" : ""}`} 
              />
              {fieldErrors.telefone && isEditing && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.telefone}</p>
              )}
            </div>
          </div>
          
          {/* Botões de ação quando editando */}
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
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
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="newsletter" checked disabled />
            <Label htmlFor="newsletter">Receber novidades por e-mail</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
