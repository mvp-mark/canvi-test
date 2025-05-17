import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { paymentRepository } from '@/server/repository/payment.repository';
import { helloWorldTask } from '@/trigger/example';

export async function GET(req: NextRequest) {

    await helloWorldTask.trigger({
        externalId: '1234567890',
        timezone: 'America/Manaus',
        type: 'IMPERATIVE',
        scheduleId: 'payment-verification',
        timestamp: new Date(),
        upcoming: [],
    });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    try {
        const payment = await paymentRepository.getPaymentById(id);
        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }
        return NextResponse.json(payment);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}