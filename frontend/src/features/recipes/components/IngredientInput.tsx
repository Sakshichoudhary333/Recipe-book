import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchIngredients } from "../../ingredients/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ingredient } from "../../ingredients/types";

interface IngredientInputProps {
  value: {
    IID: number;
    I_Name?: string;
    quantity: number;
    unit: string;
    notes?: string;
  };
  onChange: (value: {
    IID: number;
    I_Name?: string;
    quantity: number;
    unit: string;
    notes?: string;
  }) => void;
  onRemove: () => void;
  onCreateIngredient?: (name: string) => Promise<Ingredient>;
}

export function IngredientInput({
  value,
  onChange,
  onRemove,
  onCreateIngredient,
}: IngredientInputProps) {
  const [searchQuery, setSearchQuery] = useState(value.I_Name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search ingredients
  const { data: ingredients, isLoading } = useQuery({
    queryKey: ["ingredients", "search", debouncedQuery],
    queryFn: () => searchIngredients(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectIngredient = (ingredient: Ingredient) => {
    onChange({
      ...value,
      IID: ingredient.IID,
      I_Name: ingredient.I_Name,
    });
    setSearchQuery(ingredient.I_Name);
    setShowDropdown(false);
  };

  const handleCreateNew = async () => {
    if (!onCreateIngredient || !searchQuery.trim()) return;

    try {
      const newIngredient = await onCreateIngredient(searchQuery.trim());
      handleSelectIngredient(newIngredient);
    } catch (error) {
      console.error("Failed to create ingredient:", error);
    }
  };

  return (
    <div className="flex items-start gap-2">
      {/* Ingredient Name with Autocomplete */}
      <div className="relative flex-1" ref={dropdownRef}>
        <Input
          placeholder="Search ingredient..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className={cn(value.IID === 0 && "border-yellow-500")}
        />

        {/* Dropdown */}
        {showDropdown && debouncedQuery.length > 1 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500">Searching...</div>
            ) : ingredients && ingredients.length > 0 ? (
              <>
                {ingredients.map((ingredient) => (
                  <button
                    key={ingredient.IID}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    onClick={() => handleSelectIngredient(ingredient)}
                  >
                    <div className="font-medium">{ingredient.I_Name}</div>
                    {ingredient.allergen_info && (
                      <div className="text-xs text-gray-500">
                        {ingredient.allergen_info}
                      </div>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="p-3">
                <div className="text-sm text-gray-500 mb-2">
                  No ingredients found
                </div>
                {onCreateIngredient && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNew}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create "{searchQuery}"
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quantity */}
      <Input
        type="number"
        placeholder="Qty"
        value={value.quantity || ""}
        onChange={(e) =>
          onChange({ ...value, quantity: parseFloat(e.target.value) || 0 })
        }
        className="w-20"
        min="0"
        step="0.1"
      />

      {/* Unit */}
      <Input
        placeholder="Unit"
        value={value.unit}
        onChange={(e) => onChange({ ...value, unit: e.target.value })}
        className="w-24"
      />

      {/* Notes (Optional) */}
      <Input
        placeholder="Notes (optional)"
        value={value.notes || ""}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
        className="flex-1"
      />

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="shrink-0"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
