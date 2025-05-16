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
            descricao: body.descricao,
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

        const { id_invoice_pix_documento, ...rest } = response.data.data
        const payment = await paymentRepository.updatePurchase(purchase.id, {
            status: "PENDING",
            payment: {
                ...rest,
                id_invoice_pix: id_invoice_pix_documento,
                status: "static",
            },
        });
        if (response.data.code >= 400) {
            const errorResponse = response.data;
            return NextResponse.json(
                { message: "Erro ao enviar para o endpoint externo", error: errorResponse, ...errorResponse },
                { status: response.data.code }
            );
        }


        await verifyPaymentTask.trigger({
            externalId: payment.id, // ou o id do payment, conforme sua lógica
            timezone: "America/Sao_Paulo", // ajuste conforme necessário
            type: "IMPERATIVE", // ou "DECLARATIVE", conforme seu uso
            scheduleId: "payment-verification", // ajuste conforme necessário
            timestamp: new Date(),
            upcoming: [], // Adiciona a propriedade obrigatória upcoming como array vazio ou conforme necessário
        });

        return NextResponse.json(
            { message: "Cobrança criada com sucesso!", payment },
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