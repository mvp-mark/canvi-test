import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { paymentRepository } from "@/server/repository/payment.repository";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();



        await paymentRepository.updateWebhookPayment(body.paymentId, body.purchaseId, {
            status: body.status,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("Error updating payment:", error);

        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}