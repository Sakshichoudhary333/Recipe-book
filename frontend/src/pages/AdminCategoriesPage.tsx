import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { CategoryForm } from "@/features/admin/components/CategoryForm";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from "@/features/admin/api";

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<
    Category | undefined
  >();

  // Fetch categories
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getCategories,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category created successfully");
      setFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category updated successfully");
      setFormOpen(false);
      setEditingCategory(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category deleted successfully");
      setDeleteDialogOpen(false);
      setCategoryToDelete(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });

  // Filter categories
  const filteredCategories = data?.data?.filter((category) => {
    const matchesSearch = category.CName.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "meal" && category.Meal_Type) ||
      (typeFilter === "cuisine" && category.cuisine_type);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && category.is_active) ||
      (statusFilter === "inactive" && !category.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: data?.data?.length || 0,
    mealTypes: data?.data?.filter((c) => c.Meal_Type).length || 0,
    cuisines: data?.data?.filter((c) => c.cuisine_type).length || 0,
    active: data?.data?.filter((c) => c.is_active).length || 0,
  };

  const handleCreate = () => {
    setEditingCategory(undefined);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (
    formData: CreateCategoryDto | UpdateCategoryDto
  ) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.CID, data: formData });
    } else {
      createMutation.mutate(formData as CreateCategoryDto);
    }
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.CID);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Categories</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage recipe categories
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Categories</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{stats.mealTypes}</div>
          <div className="text-sm text-muted-foreground">Meal Types</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{stats.cuisines}</div>
          <div className="text-sm text-muted-foreground">Cuisines</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="meal">Meal Type</SelectItem>
            <SelectItem value="cuisine">Cuisine</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Meal Type</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-destructive"
                >
                  Error loading categories
                </TableCell>
              </TableRow>
            ) : filteredCategories?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories?.map((category) => (
                <TableRow key={category.CID}>
                  <TableCell className="font-medium">
                    {category.CName}
                  </TableCell>
                  <TableCell>
                    {category.Meal_Type ? (
                      <Badge variant="secondary">{category.Meal_Type}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.cuisine_type ? (
                      <Badge variant="outline">{category.cuisine_type}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={category.is_active ? "default" : "secondary"}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
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

      {/* Category Form Dialog */}
      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "
              {categoryToDelete?.CName}". This action cannot be undone.
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
