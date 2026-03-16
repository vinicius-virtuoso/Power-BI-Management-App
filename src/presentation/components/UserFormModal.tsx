"use client";

import type { UserProps } from "@/core/domain/entities/user";
import {
  userCreateSchema,
  type UserCreateSchemaType,
} from "@/core/domain/schemas/userCreateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
  // Importando as ações do seu hook de usuários
  const { createUser, userUpdate, fetchUsers } = useUsers();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateSchemaType>({
    resolver: zodResolver(userCreateSchema) as Resolver<UserCreateSchemaType>,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  // Sincroniza o formulário com o usuário selecionado ou limpa para novo cadastro
  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          password: "", // Senha sempre vazia por segurança no modo edição
          role: user.role,
        });
      } else {
        reset({
          name: "",
          email: "",
          password: "",
          role: "USER",
        });
      }
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
              onValueChange={(value) => setValue("role", value as any)}
              value={user ? (user.role as string) : undefined}
              defaultValue="USER"
            >
              <SelectTrigger
                className={errors.role ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Padrão (Visualizador)</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-[11px] text-destructive font-medium italic">
                {errors.role.message}
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
