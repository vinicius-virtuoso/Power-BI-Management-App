import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["USER", "ADMIN"], {
    message: "Selecione um nível de acesso",
  }),
  // Tornamos opcional no schema base, mas validaremos na lógica do formulário
  password: z.string().optional(),
});

export type UserCreateSchemaType = z.infer<typeof userCreateSchema>;
