"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("Already authenticated, redirecting...");
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("=== LOGIN ATTEMPT ===");
    console.log("Credentials:", {
      username: credentials.username,
      hasPassword: !!credentials.password,
    });
    console.log("Callback URL:", callbackUrl);

    try {
      const result = await signIn("credentials", {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Login error:", result.error);
        setError("Invalid username or password");
      } else if (result?.ok) {
        console.log("Login successful!");

        // Wait a bit for session to be set
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check session after login
        const newSession = await getSession();
        console.log("Session after login:", newSession);

        if (newSession) {
          console.log("Session confirmed, redirecting to:", callbackUrl);
          router.push(callbackUrl);
          router.refresh();
        } else {
          console.error("No session after successful login");
          setError(
            "Login successful but session not created. Please try again."
          );
        }
      } else {
        console.error("Unexpected login result:", result);
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login exception:", error);
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Show loading if checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-white animate-pulse" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Website Monitor
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Sign in to access the monitoring dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                placeholder="Enter your username"
                required
                className="h-11 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  required
                  className="h-11 pr-10 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
