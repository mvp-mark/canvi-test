import { getToken } from "@/services/payment.service";
import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";

const PixRefundRequestSchema = z.object({
    id_invoice_pix: z.string(),
    identificador_externo: z.string(),
    descricao: z.string(),
    texto_instrucao: z.string(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = PixRefundRequestSchema.parse(body);
        const { token } = await getToken();

        const response = await axios.post(`${process.env.CANVI_URL}/bt/pix/dinamico/devolucao`, {
            ...data,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        return NextResponse.json(
            { ...response.data },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Erro de validação", errors: error.errors },
                { status: 400 }
            );
        }
        console.log("Erro:", error);


        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}