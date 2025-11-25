import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Leaf,
  Sprout,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IngredientForm } from "@/features/admin/components/IngredientForm";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  type Ingredient,
  type CreateIngredientDto,
  type UpdateIngredientDto,
} from "@/features/admin/api";

export function AdminIngredientsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [formOpen, setFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<
    Ingredient | undefined
  >();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<
    Ingredient | undefined
  >();

  // Fetch ingredients
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "ingredients", page],
    queryFn: () => getIngredients({ page, limit }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ingredients"] });
      toast.success("Ingredient created successfully");
      setFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create ingredient"
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIngredientDto }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ingredients"] });
      toast.success("Ingredient updated successfully");
      setFormOpen(false);
      setEditingIngredient(undefined);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update ingredient"
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ingredients"] });
      toast.success("Ingredient deleted successfully");
      setDeleteDialogOpen(false);
      setIngredientToDelete(undefined);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete ingredient"
      );
    },
  });

  // Filter ingredients
  const filteredIngredients = data?.data?.filter((ingredient) => {
    const matchesSearch = ingredient.I_Name.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "vegetarian" && ingredient.is_vegetarian) ||
      (typeFilter === "vegan" && ingredient.is_vegan) ||
      (typeFilter === "gluten_free" && ingredient.is_gluten_free);

    return matchesSearch && matchesType;
  });

  // Calculate stats
  const stats = {
    total: data?.meta?.total || data?.data?.length || 0,
    vegetarian: data?.data?.filter((i) => i.is_vegetarian).length || 0,
    vegan: data?.data?.filter((i) => i.is_vegan).length || 0,
    glutenFree: data?.data?.filter((i) => i.is_gluten_free).length || 0,
  };

  const handleCreate = () => {
    setEditingIngredient(undefined);
    setFormOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (
    formData: CreateIngredientDto | UpdateIngredientDto
  ) => {
    if (editingIngredient) {
      updateMutation.mutate({ id: editingIngredient.IID, data: formData });
    } else {
      createMutation.mutate(formData as CreateIngredientDto);
    }
  };

  const confirmDelete = () => {
    if (ingredientToDelete) {
      deleteMutation.mutate(ingredientToDelete.IID);
    }
  };

  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Ingredients</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage recipe ingredients
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ingredient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Ingredients</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <div className="text-2xl font-bold">{stats.vegetarian}</div>
          </div>
          <div className="text-sm text-muted-foreground">Vegetarian</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-700" />
            <div className="text-2xl font-bold">{stats.vegan}</div>
          </div>
          <div className="text-sm text-muted-foreground">Vegan</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-amber-600" />
            <div className="text-2xl font-bold">{stats.glutenFree}</div>
          </div>
          <div className="text-sm text-muted-foreground">Gluten-Free</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="gluten_free">Gluten-Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Calories/Unit</TableHead>
              <TableHead>Allergens</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading ingredients...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-destructive"
                >
                  Error loading ingredients
                </TableCell>
              </TableRow>
            ) : filteredIngredients?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No ingredients found
                </TableCell>
              </TableRow>
            ) : (
              filteredIngredients?.map((ingredient) => (
                <TableRow key={ingredient.IID}>
                  <TableCell className="font-medium">
                    {ingredient.I_Name}
                  </TableCell>
                  <TableCell>
                    {ingredient.Unit || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ingredient.calories_per_unit ? (
                      `${ingredient.calories_per_unit} cal`
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ingredient.allergen_info ? (
                      <span className="text-sm">
                        {ingredient.allergen_info}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {ingredient.is_vegetarian && (
                        <Badge variant="secondary" className="text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Veg
                        </Badge>
                      )}
                      {ingredient.is_vegan && (
                        <Badge variant="secondary" className="text-xs">
                          <Sprout className="h-3 w-3 mr-1" />
                          Vegan
                        </Badge>
                      )}
                      {ingredient.is_gluten_free && (
                        <Badge variant="outline" className="text-xs">
                          <Wheat className="h-3 w-3 mr-1" />
                          GF
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(ingredient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ingredient)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Ingredient Form Dialog */}
      <IngredientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        ingredient={editingIngredient}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the ingredient "
              {ingredientToDelete?.I_Name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
