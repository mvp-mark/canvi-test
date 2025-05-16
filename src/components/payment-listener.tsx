"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
export function PaymentListener() {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>


    useEffect(() => {
        const eventSource = new EventSource("/api/sse");

        eventSource.onmessage = (event) => {
            console.log("Received event:", event);

            const data = JSON.parse(event.data);

            toast.success(`Pagamento recebido de : ${data.valor}`, {
                duration: 4000,
                position: "top-right",
                style: {
                    background: "#27272a",
                    color: "#fff",
                },
            });

            return () => {
                eventSource.close();
            };
        }
    }, []);

    return (
        <div className="">

        </div>
    );
}