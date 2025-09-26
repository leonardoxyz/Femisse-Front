import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config/api";

interface FilterState {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface Category {
  id: string;
  name: string;
  count?: number;
}

interface ProductFiltersEnhancedProps {
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
  productStats?: {
    categories: Record<string, number>;
    colors: Record<string, number>;
    sizes: Record<string, number>;
    priceRange: { min: number; max: number };
  };
}

// Cores com seus códigos hexadecimais
const COLOR_MAP: Record<string, string> = {
  preto: "#000000",
  pink: "#FF69B4",
  rosa: "#FFC0CB",
  bordo: "#800020",
  bordô: "#800020",
  chocolate: "#D2691E",
  chumbo: "#708090",
  caramelo: "#CD853F",
  vinho: "#722F37",
  marrom: "#8B4513",
  branco: "#FFFFFF",
  azul: "#0000FF",
  verde: "#008000",
  amarelo: "#FFFF00",
  vermelho: "#FF0000",
  cinza: "#808080",
  bege: "#F5F5DC",
  nude: "#E3C4A8",
  lilás: "#B19CD9",
  lilas: "#B19CD9",
};

export function ProductFiltersEnhanced({ 
  onFiltersChange, 
  className,
  productStats 
}: ProductFiltersEnhancedProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 10000 },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [showMoreSizes, setShowMoreSizes] = useState(false);

  // Buscar categorias da API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.categories);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Chamar onFiltersChange com filtros iniciais quando componente for montado
  useEffect(() => {
    const initialFilters: FilterState = {
      categories: [],
      colors: [],
      sizes: [],
      priceRange: { min: 0, max: 10000 },
    };
    onFiltersChange(initialFilters);
  }, []);

  const handleColorChange = (colorId: string, checked: boolean) => {
    const newColors = checked
      ? [...filters.colors, colorId]
      : filters.colors.filter(id => id !== colorId);
    
    const newFilters = { ...filters, colors: newColors };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSizeChange = (sizeId: string, checked: boolean) => {
    const newSizes = checked
      ? [...filters.sizes, sizeId]
      : filters.sizes.filter(id => id !== sizeId);
    
    const newFilters = { ...filters, sizes: newSizes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const newPriceRange = { ...filters.priceRange, [field]: numValue };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Preparar dados de cores baseados nas estatísticas
  const availableColors = productStats ? 
    Object.entries(productStats.colors)
      .map(([color, count]) => ({
        id: color,
        label: color.charAt(0).toUpperCase() + color.slice(1),
        count,
        color: COLOR_MAP[color.toLowerCase()] || "#808080"
      }))
      .sort((a, b) => b.count - a.count)
    : [];

  // Preparar dados de tamanhos baseados nas estatísticas
  const availableSizes = productStats ?
    Object.entries(productStats.sizes)
      .map(([size, count]) => ({
        id: size,
        label: size,
        count
      }))
      .sort((a, b) => {
        const aNum = parseInt(a.id);
        const bNum = parseInt(b.id);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.id.localeCompare(b.id);
      })
    : [];

  const visibleColors = showMoreColors ? availableColors : availableColors.slice(0, 8);
  const visibleSizes = showMoreSizes ? availableSizes : availableSizes.slice(0, 6);

  if (loading) {
    return (
      <div className={`w-full max-w-sm bg-white border border-gray-200 ${className}`}>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200"></div>
              <div className="h-3 bg-gray-200 w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-sm bg-white border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Filtrar por</h2>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Cores */}
        {availableColors.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 tracking-wide mb-3">
              Cor
            </h3>
            <div className="space-y-2">
              {visibleColors.map((color) => (
                <div key={color.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={color.id}
                    checked={filters.colors.includes(color.id)}
                    onCheckedChange={(checked) => 
                      handleColorChange(color.id, checked as boolean)
                    }
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <div
                      className="w-4 h-4 border border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                    <Label
                      htmlFor={color.id}
                      className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex-1"
                    >
                      {color.label} ({color.count})
                    </Label>
                  </div>
                </div>
              ))}
              {availableColors.length > 8 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowMoreColors(!showMoreColors)}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto underline text-sm"
                >
                  {showMoreColors ? "Ver menos" : "Ver mais"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tamanhos */}
        {availableSizes.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 tracking-wide mb-3">
              Tamanho
            </h3>
            <div className="space-y-2">
              {visibleSizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={size.id}
                    checked={filters.sizes.includes(size.id)}
                    onCheckedChange={(checked) => 
                      handleSizeChange(size.id, checked as boolean)
                    }
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor={size.id}
                    className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                  >
                    {size.label} ({size.count})
                  </Label>
                </div>
              ))}
              {availableSizes.length > 6 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowMoreSizes(!showMoreSizes)}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto underline text-sm"
                >
                  {showMoreSizes ? "Ver menos" : "Ver mais"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Preço */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 tracking-wide mb-3">
            Preço
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-gray-600 min-w-[20px]">De</Label>
              <Input
                type="number"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-gray-600 min-w-[20px]">Até</Label>
              <Input
                type="number"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>
            {productStats?.priceRange && (
              <div className="text-xs text-gray-500">
                Faixa disponível: R$ {Math.floor(productStats.priceRange.min)} - R$ {Math.ceil(productStats.priceRange.max)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}