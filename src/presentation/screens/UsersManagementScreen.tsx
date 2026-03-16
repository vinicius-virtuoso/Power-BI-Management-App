"use client";

import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Ban,
  ChevronLeft,
  Clock,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserPen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import UserFormModal from "../components/UserFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";

import { UserProps } from "@/core/domain/entities/user";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { cn } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useUsers } from "../hooks/useUsers";

export default function UsersManagementScreen() {
  const router = useRouter();
  const { usersData, isLoading, fetchUsers, removeUserFromList } = useUsers();
  const { user } = useUserMeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);

  const loggedInUserId = user?.id;

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const usersList = usersData?.users || [];

    if (!searchTerm) return usersList;

    const lowerSearch = searchTerm.toLowerCase();
    return usersList.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch),
    );
  }, [searchTerm, usersData.users]);

  const handleEdit = (user: UserProps) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOpenDeleteAlert = (user: UserProps) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedUser) return;

    removeUserFromList(selectedUser.id);
    setIsDeleteAlertOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.section
          // Ajustado: h-screen (ou calc) para manter o layout fixo e permitir scroll interno
          // grid-rows-[auto_1fr] faz a primeira parte ser dinâmica e a segunda ocupar o resto
          className="p-4 max-w-7xl mx-auto grid grid-rows-[auto_1fr] grid-cols-1 gap-4 h-full overflow-hidden"
          key="users-loader"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* PRIMEIRA LINHA: Cabeçalho e Busca (Max 250px implícito pelo conteúdo e gap) */}
          <div className="flex flex-col gap-4 shrink-0">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit gap-2 text-muted-foreground hover:text-primary transition-colors -ml-2 mb-2"
                onClick={() => router.push("/dashboard")}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar para os Relatórios
              </Button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Gerenciamento de Usuários
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Administre perfis e permissões do sistema.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedUser(null);
                    setIsModalOpen(true);
                  }}
                  size="lg"
                  className="gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" /> Novo Usuário
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-card px-4 py-1.5 rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all h-10">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <Input
                placeholder="Pesquisar por nome ou e-mail..."
                className="border-none shadow-none focus-visible:ring-0 bg-transparent h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* SEGUNDA LINHA: Tabela com Scroll Independente */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 relative custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                {/* sticky top-0 mantém o header visível durante o scroll */}
                <thead className="bg-muted/90 backdrop-blur-sm border-b text-muted-foreground font-medium text-xs uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-4 font-semibold">Usuário</th>
                    <th className="p-4 font-semibold">Nível</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold hidden md:table-cell">
                      Membro desde
                    </th>
                    <th className="p-4 font-semibold hidden lg:table-cell">
                      Acesso
                    </th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p>Carregando usuários...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="h-64 text-center text-muted-foreground"
                      >
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isMe = user.id === loggedInUserId;

                      return (
                        <tr
                          key={user.id}
                          className={cn(
                            "transition-colors group relative",
                            isMe
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-muted/20",
                          )}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {isMe && (
                                <div className="absolute left-0 w-1 h-3/4 top-1/2 -translate-y-1/2 bg-primary rounded-r-full" />
                              )}

                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center font-bold border shrink-0 text-sm",
                                  isMe
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground border-border",
                                )}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold truncate text-foreground">
                                    {user.name}
                                  </span>
                                  {isMe && (
                                    <Badge
                                      variant="outline"
                                      className="h-4 px-1.5 text-[9px] font-bold uppercase bg-primary/10 text-primary border-primary/20 shadow-none"
                                    >
                                      Você
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[11px] text-muted-foreground truncate italic">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <Badge
                              variant={
                                user.role === "ADMIN" ? "default" : "secondary"
                              }
                              className="gap-1.5 shadow-none font-medium h-6"
                            >
                              {user.role === "ADMIN" ? (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              ) : (
                                <User className="w-3.5 h-3.5" />
                              )}
                              {user.role === "ADMIN" ? "Admin" : "Padrão"}
                            </Badge>
                          </td>

                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1.5 py-0 h-6 px-2 font-medium shadow-none",
                                user.isActive
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200",
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  user.isActive
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500",
                                )}
                              />
                              {user.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>

                          <td className="p-4 hidden md:table-cell text-muted-foreground text-xs font-medium">
                            {format(new Date(user.createdAt), "dd MMM yyyy", {
                              locale: ptBR,
                            })}
                          </td>

                          <td className="p-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2 text-foreground/70 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              {user.lastAccess
                                ? formatDistanceToNow(
                                    new Date(user.lastAccess),
                                    {
                                      addSuffix: true,
                                      locale: ptBR,
                                    },
                                  )
                                : "---"}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-background border"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                                  Opções
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(user)}
                                >
                                  <UserPen className="w-4 h-4 mr-2" /> Editar
                                  Cadastro
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  disabled={isMe}
                                  className={
                                    user.isActive
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }
                                >
                                  {user.isActive ? (
                                    <>
                                      <Ban className="w-4 h-4 mr-2" /> Bloquear
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />{" "}
                                      Ativar
                                    </>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={isMe}
                                  className="bg-destructive focus:bg-destructive/50 focus:text-primary-foreground cursor-pointer text-accent-foreground"
                                  onClick={() =>
                                    !isMe && handleOpenDeleteAlert(user)
                                  }
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Remover do
                                  Sistema
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modais fora do fluxo do grid */}
          <UserFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={selectedUser}
          />

          <AlertDialog
            open={isDeleteAlertOpen}
            onOpenChange={setIsDeleteAlertOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Remover{" "}
                  <span className="font-bold text-foreground">
                    {selectedUser?.name}
                  </span>
                  ? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedUser(null)}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.section>
      </AnimatePresence>
    </>
  );
}
