import { apiClient } from "@/lib/axios";
import type { PixRequestSchema } from "@/scheme/pix";
import type { z } from "zod";
import { paymentRepository } from "@/server/repository/payment.repository";

export async function getToken() {
    try {
        const response = await apiClient.post("/api/payment/token");
        return response.data;
    } catch (error) {
        console.error("Error fetching token:", error);
        throw error;
    }
}
export namespace PaymentDynamicService {
    export type PixRequest = z.infer<typeof PixRequestSchema>;
    export async function createPix(data: PixRequest & { userId: string }) {
        try {
            const response = await apiClient.post("/api/payment/pix/dynamic/create", { ...data, "tipo_transacao": "pixCashin", });
            return response;
        } catch (error) {
            console.error("Error creating Pix payment:", error);
            throw error;
        }
    }

    export async function getPix(id: string) {
        try {
            const response = await apiClient.post("/api/payment/pix/dynamic/consult", {
                id_invoice_pix: id,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching Pix status:", error);
            throw error;
        }
    }
}

export namespace PaymentStaticService {
    export type PixRequest = z.infer<typeof PixRequestSchema>;
    export async function createPix(data: PixRequest & { userId: string }) {
        try {
            const response = await apiClient.post("/api/payment/pix/static/create", { ...data, "tipo_transacao": "pixStaticCashin" });
            return response;
        } catch (error) {
            console.error("Error creating Pix payment:", error);
            throw error;
        }
    }

    export async function getPix(id: string) {
        try {
            const response = await apiClient.post("/api/payment/pix/static/consult", {
                id_invoice_pix: id,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching Pix status:", error);
            throw error;
        }
    }
}