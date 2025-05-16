import { getToken } from "@/services/payment.service";
import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";

// Define o esquema de validação do corpo da requisição
const PixConsultRequestSchema = z.object({
    id_invoice_pix: z.number(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = PixConsultRequestSchema.parse(body);
        const { token } = await getToken();

        console.log("Dados recebidos:", data);

        const formData = new FormData();
        formData.append("id_invoice_pix", data.id_invoice_pix.toString());

        const response = await axios.post(`${process.env.CANVI_URL}/bt/pix/estatico/consulta`, {
            ...data,
        }, {
            headers: {
                "Content-Type": "multipart/form-data",
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