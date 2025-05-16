import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { paymentRepository } from '@/server/repository/payment.repository'

export async function GET(req: NextRequest) {
    try {
        const result = await paymentRepository.getDynamicPix();
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch dynamic pix payments.' }, { status: 500 });
    }
}