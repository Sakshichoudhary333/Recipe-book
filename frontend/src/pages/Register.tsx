import { useState } from "react";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerUser } from "@/api/auth";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  full_name: z.string().optional(),
});

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      full_name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account created successfully. Please login.");
      navigate("/login");
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to register");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    mutation.mutate(values);
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md border shadow-none bg-card">
        <CardHeader className="space-y-1 border-b bg-muted/20">
          <CardTitle className="text-xl font-mono uppercase tracking-wider">
            // Register
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            CREATE_NEW_USER_ENTITY
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
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
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase">
                      Full Name (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••"
                        {...field}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full font-mono uppercase tracking-wider"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Initialize Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-xs text-muted-foreground text-center border-t pt-4 bg-muted/20 font-mono">
          <div>
            EXISTING_USER?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              EXECUTE_LOGIN
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
