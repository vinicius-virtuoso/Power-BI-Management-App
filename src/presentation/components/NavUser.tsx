"use client";

import {
  ChevronsUpDown,
  LogOut,
  Proportions,
  User,
  UserPen,
  Users,
} from "lucide-react";

import { useAuthStore } from "@/core/store/auth/authStore";
import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useUsersMeStore } from "@/core/store/users/userMeStore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

export function NavUser({
  user,
  isCollapsed,
}: {
  user: {
    name: string;
    email: string;
  };
  isCollapsed: boolean;
}) {
  const { isMobile } = useSidebar();
  const { setAuthenticated } = useAuthStore();
  const { clearUser } = useUsersMeStore();
  const { clearReports } = useReportsStore();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro ao limpar cookie no servidor", error);
    } finally {
      setAuthenticated(false);
      clearUser();
      clearReports();
      router.push("/login");
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem
        className={cn(
          "w-full flex items-center",
          {
            "items-center justify-center": isCollapsed === true,
          },
          { "justify-between": isCollapsed === false },
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn("hover:bg-primary/10 flex items-center", {
                "justify-center": isCollapsed,
              })}
            >
              <div className="w-4 h-4 rounded-full bg-primary/10">
                <User className="w-4 h-4 text-primary self-center" />
              </div>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="space-y-3">
              <DropdownMenuItem>
                <UserPen />
                Conta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users />
                Usuários
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Proportions />
                Relatórios
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="mt-2">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
