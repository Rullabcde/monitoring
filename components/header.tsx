"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Moon, Sun, Laptop, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="border-b border-white/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Website Monitor
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time monitoring dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="text-xs animate-pulse border-green-200 text-green-600 dark:border-green-400 dark:text-green-400"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Live
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-blue-50 dark:hover:bg-slate-700"
                >
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-blue-600" />
                  ) : theme === "light" ? (
                    <Sun className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Laptop className="h-5 w-5 text-slate-600" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600"
              >
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="hover:bg-orange-50 dark:hover:bg-slate-700"
                >
                  <Sun className="mr-2 h-4 w-4 text-orange-500" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="hover:bg-blue-50 dark:hover:bg-slate-700"
                >
                  <Moon className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Laptop className="mr-2 h-4 w-4 text-slate-600" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-700"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {session?.user?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600"
              >
                <DropdownMenuItem disabled className="opacity-70">
                  <User className="h-4 w-4 mr-2" />
                  {session?.user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-600" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
