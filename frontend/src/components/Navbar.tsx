import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  ChefHat,
  User,
  LogOut,
  BookOpen,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { href: "/recipes", label: "Explore Recipes", icon: BookOpen },
    ...(user
      ? [{ href: "/my-recipes", label: "My Recipes", icon: ChefHat }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-90"
          >
            <div className="bg-primary/10 p-2 rounded-lg">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <span className="hidden font-bold text-xl tracking-tight sm:inline-block">
              CulinaryCanvas
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={
                    location.pathname === item.href ? "secondary" : "ghost"
                  }
                  className="text-sm font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:block">
              <Button asChild size="sm" className="rounded-full">
                <Link to="/recipes/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Recipe
                </Link>
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.profile_image}
                        alt={user.f_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                        {user.f_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 p-2"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-3 bg-muted/30 rounded-md mb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {user.f_name} {user.l_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center py-2.5">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my-recipes" className="flex items-center py-2.5">
                      <ChefHat className="mr-2 h-4 w-4 text-muted-foreground" />
                      My Recipes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="font-medium shadow-sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 py-6">
                  <div className="flex items-center gap-2 px-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-bold text-xl">CulinaryCanvas</span>
                  </div>

                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                          location.pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    {user && (
                      <Link
                        to="/recipes/create"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted text-primary"
                      >
                        <PlusCircle className="h-5 w-5" />
                        Create Recipe
                      </Link>
                    )}
                  </nav>

                  {!user && (
                    <div className="flex flex-col gap-3 mt-auto px-2">
                      <Link to="/login">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button className="w-full justify-start">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
