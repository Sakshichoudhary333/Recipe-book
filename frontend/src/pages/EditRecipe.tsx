import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  ChefHat,
  Clock,
  Users,
  Utensils,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getRecipeById, updateRecipe } from "@/api/recipes";
import { getCuisines, getMealTypes } from "@/api/categories";

const formSchema = z.object({
  recipe_name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  preparation_time: z.coerce.number().min(1, "Must be at least 1 minute"),
  cooking_time: z.coerce.number().min(0, "Cannot be negative"),
  servings: z.coerce.number().min(1, "Must be at least 1 serving"),
  difficulty_level: z.enum(["Easy", "Medium", "Hard"]),
  cuisine_id: z.coerce.number().min(1, "Select a cuisine"),
  meal_type_id: z.coerce.number().min(1, "Select a meal type"),
  image_url: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        ingredient_name: z.string().min(1, "Required"),
        quantity: z.coerce.number().min(0.1, "Required"),
        unit: z.string().min(1, "Required"),
        category: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, "Add at least one ingredient"),
  instructions: z
    .array(
      z.object({
        step_number: z.number(),
        instruction_text: z.string().min(1, "Required"),
      })
    )
    .min(1, "Add at least one instruction"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recipeId = Number(id);

  const { data: recipe, isLoading: recipeLoading } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipeById(recipeId),
    enabled: !!recipeId,
  });

  const { data: cuisines } = useQuery({
    queryKey: ["cuisines"],
    queryFn: getCuisines,
  });

  const { data: mealTypes } = useQuery({
    queryKey: ["mealTypes"],
    queryFn: getMealTypes,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipe_name: "",
      description: "",
      preparation_time: 15,
      cooking_time: 30,
      servings: 2,
      difficulty_level: "Medium" as const,
      image_url: "",
      cuisine_id: 1,
      meal_type_id: 1,
      ingredients: [
        {
          ingredient_name: "",
          quantity: 1,
          unit: "cup",
          category: "",
          notes: "",
        },
      ],
      instructions: [{ step_number: 1, instruction_text: "" }],
    },
  });

  // Populate form when recipe data is loaded
  useEffect(() => {
    if (recipe && cuisines && mealTypes) {
      form.reset({
        recipe_name: recipe.recipe_name,
        description: recipe.description || "",
        preparation_time: recipe.preparation_time || 15,
        cooking_time: recipe.cooking_time || 30,
        servings: recipe.servings || 2,
        difficulty_level: recipe.difficulty_level || "Medium",
        cuisine_id: recipe.cuisine_id || 1,
        meal_type_id: recipe.meal_type_id || 1,
        image_url: recipe.image_url || "",
        ingredients:
          recipe.ingredients?.map((ing) => ({
            ingredient_name: ing.ingredient_name || "",
            quantity: ing.quantity || 1,
            unit: ing.unit || "",
            category: ing.category || "",
            notes: ing.notes || "",
          })) || [],
        instructions:
          recipe.instructions?.map((inst) => ({
            step_number: inst.step_number,
            instruction_text: inst.instruction_text,
          })) || [],
      });
    }
  }, [recipe, cuisines, mealTypes, form.reset]);

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => updateRecipe(recipeId, data),
    onSuccess: () => {
      toast.success("Recipe updated successfully!");
      navigate(`/recipes/${recipeId}`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update recipe");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    // Ensure step numbers are correct
    const formattedValues = {
      ...values,
      instructions: values.instructions.map((inst, index) => ({
        ...inst,
        step_number: index + 1,
      })),
    };
    mutation.mutate(formattedValues);
  }

  // Watch values for preview
  const watchedValues = useWatch({ control: form.control });

  if (recipeLoading) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="w-full md:w-1/2 h-full overflow-y-auto p-6 md:p-8 border-r bg-background">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div className="hidden md:block w-1/2 h-full bg-muted/30 p-8">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left Side: Form */}
      <ScrollArea className="w-full md:w-1/2 h-full border-r bg-background">
        <div className="p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/recipes/${recipeId}`)}
                className="mb-4 font-mono text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-2" />
                BACK_TO_RECIPE
              </Button>
              <h1 className="text-2xl font-bold tracking-tight font-mono uppercase">
                // Edit_Recipe
              </h1>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                Modify existing culinary parameters.
              </p>
            </div>
            <Separator />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Basic Info */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-mono uppercase flex items-center gap-2">
                    <ChefHat className="w-4 h-4" /> Basic_Info
                  </h2>

                  <FormField
                    control={form.control}
                    name="recipe_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase">
                          Recipe Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Spicy Ramen Bowl"
                            {...field}
                            className="font-mono"
                          />
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
                        <FormLabel className="font-mono text-xs uppercase">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the taste, texture, and story..."
                            className="resize-none h-24 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase">
                          Image URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription className="font-mono text-[10px]">
                          Provide a direct link to an image resource.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold font-mono uppercase flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Parameters
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preparation_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase">
                            Prep Time (m)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={(field.value as number) ?? ""}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cooking_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase">
                            Cook Time (m)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={(field.value as number) ?? ""}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="servings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase">
                            Servings
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={(field.value as number) ?? ""}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="difficulty_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase">
                            Difficulty
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="font-mono">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cuisine_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase">
                            Cuisine
                          </FormLabel>
                          <Select
                            key={`cuisine-${recipe?.cuisine_id || "default"}`}
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value?.toString()}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="font-mono">
                                <SelectValue placeholder="Select cuisine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cuisines?.map((cuisine) => (
                                <SelectItem
                                  key={cuisine.cuisine_id}
                                  value={cuisine.cuisine_id.toString()}
                                >
                                  {cuisine.cuisine_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meal_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase">
                            Meal Type
                          </FormLabel>
                          <Select
                            key={`meal-type-${
                              recipe?.meal_type_id || "default"
                            }`}
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value?.toString()}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="font-mono">
                                <SelectValue placeholder="Select meal type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mealTypes?.map((type) => (
                                <SelectItem
                                  key={type.meal_type_id}
                                  value={type.meal_type_id.toString()}
                                >
                                  {type.meal_type_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Ingredients */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-mono uppercase flex items-center gap-2">
                      <Utensils className="w-4 h-4" /> Ingredients_Array
                    </h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendIngredient({
                          ingredient_name: "",
                          quantity: 1,
                          unit: "",
                          category: "",
                          notes: "",
                        })
                      }
                      className="font-mono text-xs h-7"
                    >
                      <Plus className="w-3 h-3 mr-2" /> ADD_ITEM
                    </Button>
                  </div>
                  <Separator />

                  <div className="space-y-2">
                    {ingredientFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-2 items-start border p-2 bg-card"
                      >
                        <div className="col-span-5">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.ingredient_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Name"
                                    {...field}
                                    className="font-mono h-8 text-xs"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Qty"
                                    {...field}
                                    value={(field.value as number) || ""}
                                    className="font-mono h-8 text-xs"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Unit"
                                    {...field}
                                    className="font-mono h-8 text-xs"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90 h-8 w-8"
                            onClick={() => removeIngredient(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Instructions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-mono uppercase flex items-center gap-2">
                      <Users className="w-4 h-4" /> Instruction_Sequence
                    </h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendInstruction({
                          step_number: instructionFields.length + 1,
                          instruction_text: "",
                        })
                      }
                      className="font-mono text-xs h-7"
                    >
                      <Plus className="w-3 h-3 mr-2" /> ADD_STEP
                    </Button>
                  </div>
                  <Separator />

                  <div className="space-y-2">
                    {instructionFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex gap-2 items-start border p-2 bg-card"
                      >
                        <div className="flex-none w-6 h-6 border flex items-center justify-center font-mono text-xs font-bold mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`instructions.${index}.instruction_text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder={`Step ${
                                      index + 1
                                    } instructions...`}
                                    {...field}
                                    className="font-mono min-h-[60px] text-xs resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 h-6 w-6 mt-1"
                          onClick={() => removeInstruction(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 font-mono uppercase"
                    onClick={() => navigate(`/recipes/${recipeId}`)}
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 font-mono uppercase"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        UPDATING...
                      </>
                    ) : (
                      "UPDATE_RECIPE"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </ScrollArea>

      {/* Right Side: Preview */}
      <ScrollArea className="hidden md:block w-1/2 h-full bg-muted/10 border-l">
        <div className="p-8">
          <div className="sticky top-0 max-w-md mx-auto">
            <h2 className="text-xs font-bold mb-4 text-muted-foreground uppercase tracking-wider font-mono">
              // LIVE_PREVIEW
            </h2>
            <Card className="overflow-hidden border shadow-none bg-card">
              <div className="aspect-video relative bg-muted flex items-center justify-center text-muted-foreground border-b">
                {watchedValues.image_url ? (
                  <img
                    src={watchedValues.image_url}
                    alt="Recipe preview"
                    className="w-full h-full object-cover grayscale"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2626&auto=format&fit=crop";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ChefHat className="w-12 h-12 opacity-20" />
                    <span className="text-xs opacity-50 font-mono">
                      NO_IMAGE_DATA
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge
                    variant="outline"
                    className="bg-background/80 backdrop-blur font-mono text-xs uppercase"
                  >
                    {watchedValues.difficulty_level || "DIFFICULTY"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold leading-tight font-mono uppercase">
                    {watchedValues.recipe_name || "RECIPE_NAME"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 font-mono">
                    <span>
                      {cuisines?.find(
                        (c) => c.cuisine_id === Number(watchedValues.cuisine_id)
                      )?.cuisine_name || "CUISINE"}
                    </span>
                    <span>//</span>
                    <span>
                      {mealTypes?.find(
                        (m) =>
                          m.meal_type_id === Number(watchedValues.meal_type_id)
                      )?.meal_type_name || "TYPE"}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-3 font-mono">
                  {watchedValues.description ||
                    "// Description will be rendered here..."}
                </p>

                <div className="flex items-center justify-between text-xs border-t pt-4 font-mono text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {Number(watchedValues.preparation_time || 0) +
                        Number(watchedValues.cooking_time || 0)}{" "}
                      MIN
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{Number(watchedValues.servings) || 0} PPL</span>
                  </div>
                </div>

                {watchedValues.ingredients &&
                  watchedValues.ingredients.length > 0 && (
                    <div className="pt-2 border-t mt-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 font-mono">
                        INGREDIENTS_PREVIEW
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.ingredients.slice(0, 5).map(
                          (ing, i) =>
                            ing.ingredient_name && (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-[10px] font-mono font-normal"
                              >
                                {String(ing.quantity)} {ing.unit}{" "}
                                {ing.ingredient_name}
                              </Badge>
                            )
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
