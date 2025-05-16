import { z } from "zod";

export const PixRequestSchema = z.object({
    valor: z.number(),
    vencimento: z.string(),
    descricao: z.string(),
    tipo_transacao: z.string().optional(),
    texto_instrucao: z.string(),
    identificador_externo: z.string().optional(),
    identificador_movimento: z.string(),
    enviar_qr_code: z.boolean(),
    tag: z.array(z.string()),
});