"use client";

import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/atoms/theme-toggle";

export default function Header({ user, setIsOpen }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-slate-900 px-4 md:px-6 shadow-sm shrink-0">
      <button 
        onClick={() => setIsOpen(true)} 
        className="md:hidden text-slate-500 hover:text-slate-700"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-2 text-sm font-medium border-l border-r px-4 sm:px-4 border-slate-200 dark:border-slate-700">
          <User className="h-4 w-4 text-ulbi-orange" />
          <span className="capitalize">{user?.username} ({user?.role})</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout} 
          title="Logout" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
