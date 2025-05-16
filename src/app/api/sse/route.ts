// app/api/sse/route.ts
import type { NextRequest } from "next/server";
import { eventBus } from "@/lib/event-bus";

export async function GET(req: NextRequest) {
    const stream = new ReadableStream({
        start(controller) {
            const send = (data: string) => {
                controller.enqueue(`data: ${data}\n\n`);
            };

            const onPayment = (payload: unknown) => {
                send(JSON.stringify(payload));
            };

            eventBus.on("payment_received", onPayment);

            req.signal.addEventListener("abort", () => {
                eventBus.off("payment_received", onPayment);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
