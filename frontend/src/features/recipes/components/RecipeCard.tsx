import { Link } from "react-router-dom";
import type { Recipe } from "../types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={
            "http://localhost:3000" + recipe.image_url ||
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={recipe.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1 text-xl">{recipe.name}</CardTitle>
          <Badge
            variant={
              recipe.difficulty_level === "Easy"
                ? "secondary"
                : recipe.difficulty_level === "Medium"
                ? "default"
                : "destructive"
            }
          >
            {recipe.difficulty_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {recipe.description}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {recipe.prep_time ? recipe.prep_time + recipe.cook_time! : 0}m
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>
              {recipe.average_rating
                ? Number(recipe.average_rating).toFixed(1)
                : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/recipes/${recipe.RID}`} className="w-full">
          <Button className="w-full">View Recipe</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
