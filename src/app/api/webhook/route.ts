// app/api/webhook/route.ts
import { eventBus } from "@/lib/event-bus";
import { paymentRepository } from "@/server/repository/payment.repository";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    console.log("Payment webhook received:", body);

    const payment = await paymentRepository.getPaymentById(body.identificador_externo);
    if (!payment || !payment.purchaseId) {
        return
    }

    // Update the payment status in your database
    await paymentRepository.updateWebhookPayment(payment.id, payment.purchaseId, {
        status: body.status,
    });

    eventBus.emit("payment_received", {
        id: payment.id,
        status: body.status,
        valor: body.valor,
        id_invoice_pix: body.id_invoice_pix,
        nome_pagador: body.nome_pagador,
    });


    return NextResponse.json({ success: true });
}
