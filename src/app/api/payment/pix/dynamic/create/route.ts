import { PixRequestSchema } from "@/scheme/pix";
import { paymentRepository } from "@/server/repository/payment.repository";
import { getToken } from "@/services/payment.service";
import { verifyPaymentTask } from "@/trigger/example";
import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = PixRequestSchema.parse(body);
        const { token } = await getToken();
        console.log("Dados recebidos:", data);

        const purchase = await paymentRepository.createPurchase({
            status: "CREATED",
            userId: body.userId,
            descricao: body.descricao
        })

        const response = await axios.post(`${process.env.CANVI_URL}/bt/pix`, {
            ...data,
            identificador_externo: purchase.id,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        console.log({ data: response.data });

        const payment = await paymentRepository.updatePurchase(purchase.id, {
            status: "PENDING",
            payment: {
                ...response.data.data,
                id_invoice_pix: response.data.data.id_invoice_pix,
            },
        });
        if (response.data.code >= 400) {
            const errorResponse = response.data;
            return NextResponse.json(
                { message: "Erro ao enviar para o endpoint externo", error: errorResponse, ...errorResponse },
                { status: response.data.code }
            );
        }
        const responseData = response.data;

        await verifyPaymentTask.trigger({
            externalId: payment.id,
            timezone: "America/Manaus",
            type: "IMPERATIVE",
            scheduleId: "payment-verification",
            timestamp: new Date(),
            upcoming: [],
        });
        return NextResponse.json(
            { message: "Cobrança criada com sucesso!", ...payment },
            { status: 201 }
        );
    } catch (error) {
        console.log("Erro:", error);

        // Retorna erro de validação ou outro erro
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Erro de validação", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}