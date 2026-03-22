"use client";

import { UserProps } from "@/core/domain/entities/user";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { handleGlobalError } from "@/presentation/utils/errorHandler";
import { tableContainerVariants, tableRowVariants } from "@/shared/animations";
import { cn } from "@/shared/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  ChevronLeft,
  CircleFadingPlus,
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
import { toast } from "sonner";
import ShareReportsModal from "../components/ShareReportsModal";
import { SortSelect, USER_SORT_OPTIONS } from "../components/SortSelect";
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
import { useSortedUsers } from "../hooks/useSortedUsers";
import { useUsers } from "../hooks/useUsers";

export default function UsersManagementScreen() {
  const router = useRouter();
  const {
    usersData,
    isLoading,
    fetchUsers,
    userActivate,
    isUpdating,
    userDelete,
  } = useUsers();
  const { user: loggedInUser } = useUserMeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        handleGlobalError(error);
        if ((error as any).statusCode === 401) router.push("/login");
      }
    };
    load();
  }, [fetchUsers, router]);

  const filteredUsers = useMemo(() => {
    const usersList = Array.isArray(usersData?.users) ? usersData.users : [];
    if (!searchTerm) return usersList;
    const lowerSearch = searchTerm.toLowerCase();
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(lowerSearch) ||
        u.email.toLowerCase().includes(lowerSearch),
    );
  }, [searchTerm, usersData?.users]);

  const {
    sorted: sortedUsers,
    sortKey,
    setSortKey,
  } = useSortedUsers(filteredUsers);

  const handleEdit = (user: UserProps) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleActivatedUser = async (user: UserProps) => {
    try {
      await userActivate(user.id, user.isActive);
    } catch (error) {
      handleGlobalError(error);
    }
  };

  const handleOpenDeleteAlert = (user: UserProps) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    if (selectedUser.id === loggedInUser?.id) {
      toast.error("Você não pode excluir sua própria conta.");
      setIsDeleteAlertOpen(false);
      return;
    }
    try {
      await userDelete(selectedUser.id);
      setIsDeleteAlertOpen(false);
      setSelectedUser(null);
    } catch (error) {
      handleGlobalError(error);
    }
  };

  const formatterName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <>
      <AnimatePresence mode="sync">
        <motion.section
          className="p-4 max-w-7xl mx-auto grid grid-rows-[auto_1fr] gap-4 h-full overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* CABEÇALHO */}
          <div className="flex flex-col gap-4 shrink-0">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-primary -ml-2 mb-2"
                onClick={() => router.push("/dashboard")}
              >
                <ChevronLeft className="w-4 h-4" />
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
                  size="default"
                  className="gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Novo Usuário
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 bg-card px-4 rounded-md border shadow-sm focus-within:ring-2 focus-within:ring-primary/80 transition-all h-10">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou e-mail..."
                  className="border-none shadow-none focus-visible:ring-0 bg-transparent h-full text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <SortSelect
                value={sortKey}
                onChange={setSortKey}
                options={USER_SORT_OPTIONS}
              />
            </div>
          </div>

          {/* TABELA COM SCROLL */}
          <div className="rounded-md border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/90 backdrop-blur-sm border-b text-muted-foreground sticky top-0 z-10">
                  <tr className="text-[10px] uppercase tracking-wider font-bold">
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Nível</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 hidden md:table-cell">Membro desde</th>
                    <th className="p-4 hidden lg:table-cell">Último Acesso</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>

                {/* ── MUDANÇA 1: tbody → motion.tbody com variantes de stagger ── */}
                <motion.tbody
                  className="divide-y divide-border"
                  variants={tableContainerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-xs">Carregando usuários...</p>
                        </div>
                      </td>
                    </tr>
                  ) : sortedUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="h-64 text-center text-muted-foreground"
                      >
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="sync" initial={false}>
                      {sortedUsers.map((u) => {
                        const isMe = u.id === loggedInUser?.id;

                        return (
                          <motion.tr
                            key={u.id}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            layout
                            className={cn(
                              "transition-colors group",
                              isMe
                                ? "bg-primary/5 hover:bg-primary/10 opacity-0"
                                : "hover:bg-muted/20",
                            )}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center font-bold border shrink-0 text-xs",
                                    isMe
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-muted text-muted-foreground border-border",
                                  )}
                                >
                                  {formatterName(u.name)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold truncate">
                                      {u.name}
                                    </span>
                                    {isMe && (
                                      <Badge className="h-4 px-1 text-[9px] bg-primary/20 text-primary border-none shadow-none">
                                        Você
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <Badge
                                variant={
                                  u.role === "ADMIN" ? "default" : "secondary"
                                }
                                className="gap-1 shadow-none h-6 text-[10px]"
                              >
                                {u.role === "ADMIN" ? (
                                  <ShieldCheck className="w-3 h-3" />
                                ) : (
                                  <User className="w-3 h-3" />
                                )}
                                {u.role === "ADMIN" ? "Admin" : "Padrão"}
                              </Badge>
                            </td>

                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "gap-1.5 h-6 px-2 font-medium shadow-none text-[10px]",
                                  u.isActive
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200",
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    u.isActive
                                      ? "bg-green-500 animate-pulse"
                                      : "bg-red-500",
                                  )}
                                />
                                {u.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </td>

                            <td className="p-4 hidden md:table-cell text-muted-foreground text-xs italic">
                              {format(new Date(u.createdAt), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </td>

                            <td className="p-4 hidden lg:table-cell text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {u.lastAccess
                                  ? formatDistanceToNow(
                                      new Date(u.lastAccess),
                                      {
                                        addSuffix: true,
                                        locale: ptBR,
                                      },
                                    )
                                  : "Nunca"}
                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 border hover:bg-background"
                                  >
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-52"
                                >
                                  <DropdownMenuLabel className="text-[9px] font-bold text-muted-foreground uppercase">
                                    Opções
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(u)}
                                  >
                                    <UserPen className="w-4 h-4 mr-2" /> Editar
                                    Cadastro
                                  </DropdownMenuItem>

                                  {isMe || u.role === "ADMIN" ? (
                                    <DropdownMenuItem disabled={true}>
                                      <UserPen className="w-4 h-4 mr-2" />{" "}
                                      Compartilhar Relatórios
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setIsShareModalOpen(true);
                                      }}
                                    >
                                      <CircleFadingPlus className="w-4 h-4 mr-2" />{" "}
                                      Compartilhar Relatórios
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem
                                    onClick={() => handleActivatedUser(u)}
                                    disabled={isMe || isUpdating}
                                    className={
                                      u.isActive
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : u.isActive ? (
                                      <Ban className="w-4 h-4 mr-2" />
                                    ) : (
                                      <UserCheck className="w-4 h-4 mr-2" />
                                    )}
                                    {u.isActive
                                      ? "Desativar Acesso"
                                      : "Ativar Acesso"}
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    disabled={isMe}
                                    className="text-red-600 focus:bg-destructive focus:text-accent-foreground"
                                    onClick={() => handleOpenDeleteAlert(u)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Remover
                                    do Sistema
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </motion.tbody>
              </table>
            </div>
          </div>

          {/* MODAIS */}
          <ShareReportsModal
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />
          <UserFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
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
                  Deseja realmente remover{" "}
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
