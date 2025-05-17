import { db } from '@/server/db'
import type { Purchase } from '@prisma/client';

export const paymentRepository = {
    async createPurchase(data: { status: string, userId: string, descricao: string }) {
        try {
            const payment = await db.purchase.create({
                data: {
                    userId: data.userId,
                    status: data.status,
                    description: data.descricao

                },
            });
            return payment;
        } catch (error) {
            console.error("Error creating payment:", error);
            throw error;
        }
    },
    async updatePurchase(id: string, data: any) {
        try {
            console.log({ updatePurchase: data.payment });

            const payment = await db.purchase.update({
                where: { id },
                data: {
                    status: data.status,
                    payment: {
                        connectOrCreate: {
                            where: { purchaseId: id },
                            create: {
                                ...data.payment,
                            }
                        }
                    }
                },
                include: {
                    payment: true,
                }
            });
            return payment;
        } catch (error) {
            console.error("Error updating payment:", error);
            throw error;
        }
    },
    async getPaymentById(id: string) {
        try {
            const payment = await db.payment.findFirst({
                where: {
                    OR: [
                        { id: id },
                        { purchaseId: id }

                    ]
                },
                include: {
                    purchase: {
                        include: {
                            user: true,
                        }
                    },
                }
            });
            return payment;
        } catch (error) {
            console.error("Error fetching payment:", error);
            throw error;
        }
    },
    async getPaymentByPixInvoice(id: number) {
        try {
            const payment = await db.payment.findUnique({
                where: { id_invoice_pix: id },
                include: {
                    purchase: {
                        include: {
                            user: true,
                        }
                    },
                }
            });
            return payment;
        } catch (error) {
            console.error("Error fetching payment:", error);
            throw error;
        }
    },
    async updatePayment(id: string, data: { status: string }) {
        try {
            const payment = await db.payment.update({
                where: { id: id },
                data: {
                    ...data,
                    purchase: {
                        update: {
                            status: data.status,
                        }
                    }
                },
            });
            return payment;
        } catch (error) {
            console.error("Error updating payment:", error);
            throw error;
        }
    },
    async updateWebhookPayment(paymentId: string, purchaseId: string, data: { status: string }) {
        try {
            await db.payment.update({
                where: {
                    id: paymentId,
                },
                data: {
                    status: data.status,
                },
            });
            await db.purchase.update({
                where: {
                    id: purchaseId,
                },
                data: {
                    status: data.status,
                },
            });

        }
        catch (error) {
            console.error("Error updating payment:", error);
            throw error;
        }
    },
    async getDynamicPix() {
        try {
            const payment = await db.payment.findMany({
                where: {
                    NOT: {
                        purchaseId: null,
                    },
                },
                include: {
                    purchase: true
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });
            return payment;
        } catch (error) {
            console.error("Error fetching dynamic Pix payments:", error);
            throw error;
        }
    }
}