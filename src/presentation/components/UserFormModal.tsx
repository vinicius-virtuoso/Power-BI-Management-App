"use client";

import type { UserProps } from "@/core/domain/entities/user";
import {
  userCreateSchema,
  type UserCreateSchemaType,
} from "@/core/domain/schemas/userCreateSchema";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { cn } from "@/shared/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProps | null;
}

export default function UserFormModal({
  isOpen,
  onClose,
  user,
}: UserFormModalProps) {
  const { userUpdate, fetchUsers, createUser } = useUsers();
  const { user: loggedInUser } = useUserMeStore(); // Pegamos o usuário logado

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    setError, // Importante para observar o valor em tempo real
    formState: { errors, isSubmitting },
  } = useForm<UserCreateSchemaType>({
    resolver: zodResolver(userCreateSchema) as any,
  });

  // Observa o valor da role no formulário para o Select refletir a mudança
  const currentRole = watch("role");

  // Verifica se o usuário que estou editando sou EU mesmo
  const isEditingMe = user?.id === loggedInUser?.id;

  useEffect(() => {
    if (isOpen) {
      reset({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        role: user?.role || "USER",
      });
    }
  }, [user, reset, isOpen]);

  const onSubmit = async (formData: UserCreateSchemaType) => {
    try {
      // 1. Validação manual para NOVO usuário (Senha obrigatória)
      if (!user && (!formData.password || formData.password.length < 6)) {
        setError("password", {
          type: "manual",
          message:
            "Senha obrigatória (mínimo 6 caracteres) para novos usuários",
        });
        return;
      }

      if (user?.id) {
        // MODO EDIÇÃO
        const updatePayload = { ...formData };

        // Se a senha estiver vazia na edição, removemos para não alterar a atual
        if (!updatePayload.password || updatePayload.password.trim() === "") {
          delete updatePayload.password;
        }

        await userUpdate(user.id, updatePayload);
      } else {
        // MODO CRIAÇÃO
        await createUser(formData);
      }

      // 2. Atualiza a lista da tabela e fecha o modal
      await fetchUsers();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Altere as informações do perfil abaixo."
              : "Preencha os dados para cadastrar um novo acesso."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Ex: João Silva"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium italic">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium italic">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">
              {user ? "Nova Senha (opcional)" : "Senha"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-[11px] text-destructive font-medium italic">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Nível de Acesso</Label>
            <Select
              // 1. Vincula a mudança ao hook-form
              onValueChange={(value) => setValue("role", value as any)}
              // 2. Faz o Select ler o valor atual do formulário
              value={currentRole}
              // 3. Desabilita se for o próprio usuário
              disabled={isEditingMe}
            >
              <SelectTrigger
                className={cn(
                  errors.role && "border-destructive",
                  isEditingMe && "bg-muted cursor-not-allowed",
                )}
              >
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Padrão (Visualizador)</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>

            {isEditingMe && (
              <p className="text-[10px] text-muted-foreground italic">
                Você não pode alterar seu próprio nível de acesso.
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Usuário"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
