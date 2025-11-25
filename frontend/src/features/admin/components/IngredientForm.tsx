import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Ingredient } from "../api";

const formSchema = z.object({
  I_Name: z.string().min(2, "Ingredient name must be at least 2 characters"),
  Unit: z.string().optional(),
  Quantity: z.coerce.number().positive().optional().or(z.literal("")),
  calories_per_unit: z.coerce.number().min(0).optional().or(z.literal("")),
  allergen_info: z.string().optional(),
  is_vegetarian: z.boolean().default(true),
  is_vegan: z.boolean().default(false),
  is_gluten_free: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface IngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  ingredient?: Ingredient;
  isLoading?: boolean;
}

export function IngredientForm({
  open,
  onOpenChange,
  onSubmit,
  ingredient,
  isLoading,
}: IngredientFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: ingredient
      ? {
          I_Name: ingredient.I_Name,
          Unit: ingredient.Unit || "",
          Quantity: ingredient.Quantity || ("" as any),
          calories_per_unit: ingredient.calories_per_unit || ("" as any),
          allergen_info: ingredient.allergen_info || "",
          is_vegetarian: ingredient.is_vegetarian,
          is_vegan: ingredient.is_vegan,
          is_gluten_free: ingredient.is_gluten_free,
        }
      : {
          I_Name: "",
          Unit: "",
          Quantity: "" as any,
          calories_per_unit: "" as any,
          allergen_info: "",
          is_vegetarian: true,
          is_vegan: false,
          is_gluten_free: true,
        },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    if (!ingredient) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? "Edit Ingredient" : "Create Ingredient"}
          </DialogTitle>
          <DialogDescription>
            {ingredient
              ? "Update the ingredient information below."
              : "Add a new ingredient to the database."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="I_Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tomato, Olive Oil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="Unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., cup, tbsp" {...field} />
                    </FormControl>
                    <FormDescription>Measurement unit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1.0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Default amount</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="calories_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories/Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Nutritional info</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allergen_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergen Information</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Contains nuts, gluten"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    List any allergens or dietary warnings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Dietary Properties</FormLabel>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="is_vegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vegetarian</FormLabel>
                        <FormDescription>
                          This ingredient is suitable for vegetarians
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_vegan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vegan</FormLabel>
                        <FormDescription>
                          This ingredient is suitable for vegans
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_gluten_free"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Gluten-Free</FormLabel>
                        <FormDescription>
                          This ingredient does not contain gluten
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : ingredient
                  ? "Update Ingredient"
                  : "Create Ingredient"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
