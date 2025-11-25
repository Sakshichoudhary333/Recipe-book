import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createRecipe, updateRecipe, uploadRecipeImage } from "../api";
import { createIngredient } from "../../ingredients/api";
import type { Recipe } from "../types";
import type { Ingredient } from "../../ingredients/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, AlertCircle, ImageIcon } from "lucide-react";
import { IngredientInput } from "./IngredientInput";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  prep_time: z.coerce.number().min(0),
  cook_time: z.coerce.number().min(0),
  servings: z.coerce.number().min(1),
  difficulty_level: z.enum(["Easy", "Medium", "Hard"]),
  instructions: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        IID: z.coerce.number(),
        I_Name: z.string().optional(),
        quantity: z.coerce.number().min(0),
        unit: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecipeFormProps {
  recipe?: Recipe;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!recipe;
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    recipe?.image_url || null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: recipe?.name || "",
      description: recipe?.description || "",
      prep_time: recipe?.prep_time || 0,
      cook_time: recipe?.cook_time || 0,
      servings: recipe?.servings || 4,
      difficulty_level:
        (recipe?.difficulty_level as "Easy" | "Medium" | "Hard") || "Medium",
      instructions: recipe?.instructions || "",
      ingredients:
        recipe?.ingredients?.map((i) => ({
          IID: i.IID,
          I_Name: i.I_Name,
          quantity: i.quantity,
          unit: i.unit,
          notes: i.notes || "",
        })) || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateIngredient = async (name: string): Promise<Ingredient> => {
    try {
      const newIngredient = await createIngredient({ I_Name: name });
      toast.success(`Ingredient "${name}" created successfully`);
      return newIngredient;
    } catch (error: any) {
      toast.error(error.message || "Failed to create ingredient");
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      setError(null);

      // Validate that all ingredients have been selected (IID > 0)
      const invalidIngredients = values.ingredients?.filter((i) => i.IID === 0);
      if (invalidIngredients && invalidIngredients.length > 0) {
        throw new Error(
          "Please select or create all ingredients before submitting"
        );
      }

      const payload = {
        ...values,
        ingredients: values.ingredients?.map((i) => ({
          IID: i.IID,
          quantity: i.quantity,
          unit: i.unit,
          notes: i.notes,
        })),
      };

      let recipeId = recipe?.RID;

      if (isEditing) {
        await updateRecipe(recipe!.RID, payload as any);
      } else {
        const response = await createRecipe(payload as any);
        recipeId = response.data.RID;
      }

      if (selectedImage && recipeId) {
        await uploadRecipeImage(recipeId, selectedImage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success(`Recipe ${isEditing ? "updated" : "created"} successfully`);
      navigate("/my-recipes");
    },
    onError: (error: any) => {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Failed to save recipe";
      setError(errorMessage);
      toast.error(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Name</FormLabel>
              <FormControl>
                <Input placeholder="Spaghetti Carbonara" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A classic Italian pasta dish..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Recipe Image</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {!imagePreview && (
                <div className="w-full max-w-md h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">No image selected</p>
                  </div>
                </div>
              )}
            </div>
          </FormControl>
        </FormItem>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="prep_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (mins)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cook_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (mins)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="difficulty_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[200px]"
                  placeholder="Step 1: Boil water..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Ingredients</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  IID: 0,
                  I_Name: "",
                  quantity: 1,
                  unit: "",
                  notes: "",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              <p>No ingredients added yet</p>
              <p className="text-sm mt-1">
                Click "Add Ingredient" to start adding ingredients
              </p>
            </div>
          )}

          {fields.map((field, index) => {
            const ingredientValue = form.watch(`ingredients.${index}`) || {
              IID: 0,
              I_Name: "",
              quantity: 1,
              unit: "",
              notes: "",
            };

            return (
              <IngredientInput
                key={field.id}
                value={ingredientValue}
                onChange={(value) => update(index, value)}
                onRemove={() => remove(index)}
                onCreateIngredient={handleCreateIngredient}
              />
            );
          })}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : isEditing
            ? "Update Recipe"
            : "Create Recipe"}
        </Button>
      </form>
    </Form>
  );
}
