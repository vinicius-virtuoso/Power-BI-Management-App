"use client";

import {
  CheckCircle2,
  ChevronsUpDown,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Proportions,
  User,
  UserPen,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuthStore } from "@/core/store/auth/authStore";
import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { cn } from "@/shared/utils";
import { usePathname, useRouter } from "next/navigation";

import { useUsers } from "../hooks/useUsers";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

type ProfileFormData = {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
};

interface NavUserProps {
  isCollapsed: boolean;
}

export function NavUser({ isCollapsed }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { setAuthenticated } = useAuthStore();
  const { user, clearUser } = useUserMeStore();
  const { clearReports } = useReportsStore();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isAdmin = user?.role.toLowerCase() === "admin";

  const { userUpdate, isUpdating } = useUsers();

  const pathname = usePathname();
  const isUserManagementActive = pathname === "/dashboard/users-management";
  const isReportsManagementActive =
    pathname === "/dashboard/reports-management";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  const watchPassword = watch("password");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro logout:", error);
    } finally {
      setAuthenticated(false);
      router.push("/login");
      clearUser();
      clearReports();
      localStorage.removeItem("pbi_report_states");
    }
  };

  const onUpdateProfile = async (data: ProfileFormData) => {
    // O hook já trata o toast e a atualização da store interna
    if (user) {
      await userUpdate(user.id, {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setIsProfileOpen(false);
      reset(data);
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem
          className={cn("w-full flex items-center", {
            "justify-center": isCollapsed,
            "justify-between": !isCollapsed,
          })}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={cn("hover:bg-primary/10 transition-colors", {
                  "justify-center": isCollapsed,
                })}
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                {!isCollapsed && (
                  <>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                      <span className="truncate font-semibold text-xs">
                        {user?.name}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsProfileOpen(true)}
                  className="cursor-pointer"
                >
                  <UserPen className="mr-2 size-4" />
                  Conta
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      className={cn(
                        "cursor-pointer",
                        isUserManagementActive && "bg-primary/10 text-primary",
                      )}
                      onClick={() => router.push("/dashboard/users-management")}
                    >
                      <Users className="mr-2 size-4" />
                      Usuários
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className={cn(
                        "cursor-pointer",
                        isReportsManagementActive &&
                          "bg-primary/10 text-primary",
                      )}
                      onClick={() =>
                        router.push("/dashboard/reports-management")
                      }
                    >
                      <Proportions className="mr-2 size-4" />
                      Relatórios
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive focus:text-accent-foreground cursor-pointer"
              >
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Configurações da Conta
            </DialogTitle>
            <DialogDescription>
              Altere o seu nome ou senha de acesso.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onUpdateProfile)}
            className="space-y-4 pt-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Ex: João Silva"
                {...register("name", { required: "O nome é obrigatório" })}
              />
              {errors.name && (
                <p className="text-[10px] text-destructive font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">E-mail corporativo</Label>
                {!isAdmin && (
                  <Mail className="w-3 h-3 text-muted-foreground opacity-50" />
                )}
              </div>
              {isAdmin ? (
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "E-mail é obrigatório" })}
                />
              ) : (
                <Input
                  id="email"
                  type="email"
                  disabled={!isAdmin}
                  defaultValue={user?.email}
                  className={cn(
                    !isAdmin &&
                      "bg-muted/50 grayscale opacity-80 cursor-not-allowed",
                  )}
                />
              )}
            </div>
            {!isAdmin && (
              <p className="text-[10px] text-muted-foreground italic">
                * Apenas administradores podem editar os campos Nome e E-mail.
              </p>
            )}

            <div className="pt-4 mt-4 border-t space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Alterar Senha
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    {...register("password", {
                      minLength: {
                        value: 6,
                        message: "A senha deve ter pelo menos 6 caracteres",
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-[10px] text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a nova senha"
                    {...register("confirmPassword", {
                      validate: (value) =>
                        !watchPassword ||
                        value === watchPassword ||
                        "As senhas não coincidem",
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsProfileOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-w-[120px]"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Guardar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
