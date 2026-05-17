"use client";

import { Home, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import NotificationBell from "../site/NotificationBell";

export function Header() {
  const navigate = useRouter();
  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-background px-4 lg:px-6">
      <div className="flex w-full items-center gap-3">
        <Button variant="outline" size="sm" className="h-9" onClick={() => navigate.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="ml-auto flex h-9 items-center gap-2">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
