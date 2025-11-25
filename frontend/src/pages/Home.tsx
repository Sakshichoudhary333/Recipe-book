import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChefHat, Clock, Users, Star } from "lucide-react";

import { getRecipes } from "@/api/recipes";
import { getCuisines, getMealTypes } from "@/api/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GetRecipesParams } from "@/types";

export default function Home() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GetRecipesParams>({
    search: "",
    cuisine_id: undefined,
    meal_type_id: undefined,
    difficulty_level: undefined,
  });

  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ["recipes", filters],
    queryFn: () => getRecipes(filters),
  });

  const { data: cuisines } = useQuery({
    queryKey: ["cuisines"],
    queryFn: getCuisines,
  });

  const { data: mealTypes } = useQuery({
    queryKey: ["mealTypes"],
    queryFn: getMealTypes,
  });

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleCuisineChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      cuisine_id: value === "all" ? undefined : Number(value),
    }));
  };

  const handleMealTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      meal_type_id: value === "all" ? undefined : Number(value),
    }));
  };

  const handleDifficultyChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      difficulty_level:
        value === "all"
          ? undefined
          : (value as "Easy" | "Medium" | "Hard" | undefined),
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      cuisine_id: undefined,
      meal_type_id: undefined,
      difficulty_level: undefined,
    });
  };

  return (
    <div className="space-y-8 mt-4">
      {/* Hero Section */}
      <div className="border-b pb-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
            <span className="text-primary block text-2xl md:text-3xl mt-2 font-normal normal-case tracking-normal">
              // Discover & Share Culinary Code
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            A collection of algorithms for your kitchen. Execute delicious
            instructions with precision.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-[8fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search recipes..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <Select
          value={filters.cuisine_id?.toString() || "all"}
          onValueChange={handleCuisineChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
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

        <Select
          value={filters.meal_type_id?.toString() || "all"}
          onValueChange={handleMealTypeChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Meal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
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

        <Select
          value={filters.difficulty_level || "all"}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters} className="px-3">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Query Results
        </h2>
        <span className="text-sm font-mono">
          {recipesLoading ? "Loading..." : `[${recipes?.length || 0}] Found`}
        </span>
      </div>

      {/* Recipe Grid */}
      {recipesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border bg-card">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card
              key={recipe.recipe_id}
              className="group cursor-pointer border bg-card hover:border-primary transition-colors duration-200"
              onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
            >
              {/* Recipe Image */}
              <div className="aspect-video relative bg-muted border-b overflow-hidden">
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.recipe_name}
                    className="w-full h-full object-cover transition-all duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2626&auto=format&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur border text-xs font-mono uppercase"
                  >
                    {recipe.difficulty_level}
                  </Badge>
                </div>
              </div>

              {/* Recipe Info */}
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors font-mono">
                    {recipe.recipe_name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2 font-sans">
                    {recipe.description || "No description available"}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono border-t pt-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {(recipe.preparation_time || 0) +
                        (recipe.cooking_time || 0)}
                      m
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{recipe.servings}ppl</span>
                  </div>
                  {recipe.average_rating &&
                    Number(recipe.average_rating) > 0 && (
                      <div className="flex items-center gap-1.5 ml-auto text-foreground">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{Number(recipe.average_rating).toFixed(1)}</span>
                      </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {recipe.cuisine_name && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider rounded-none"
                    >
                      {recipe.cuisine_name}
                    </Badge>
                  )}
                  {recipe.meal_type_name && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider rounded-none"
                    >
                      {recipe.meal_type_name}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed rounded-lg">
          <ChefHat className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-mono font-medium mb-2">NO_DATA_FOUND</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Adjust search parameters to find results.
          </p>
          <Button onClick={clearFilters} variant="outline">
            RESET_FILTERS
          </Button>
        </div>
      )}
    </div>
  );
}
