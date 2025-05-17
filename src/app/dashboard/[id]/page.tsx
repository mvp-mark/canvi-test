"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PaymentListener } from "@/components/payment-listener";
import toast from "react-hot-toast";
import axios from "axios";

type Payment = {
    id_invoice_pix: number;
    valor: string;
    vencimento: string;
    descricao: string;
    status: string;
    qrcode?: string;
    tx_id?: string;
    [key: string]: unknown;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    purchase: {
        id: string;
        status: string;
        createdAt: string;
        description: string;
        updatedAt: string;
        userId: string;
        user: {
            id: string;
            name: string;
            email: string;
            image: string;
            emailVerified: string | boolean;
            createdAt: string;
            updatedAt: string;
        }
    }
};

export default function PurchaseDetailsPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [purchase, setPurchase] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastStatus, setLastStatus] = useState<string | undefined>(undefined);


    useEffect(() => {
        if (!id) return;

        fetch(`/api/payment/pix/dynamic/getById?id=${id}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Erro ao buscar a compra");
                return res.json();
            })
            .then((data) => {
                setPurchase((prev) => {
                    // Exibe toast se o status mudou
                    if (prev && prev.status !== data.status) {
                        toast.success(`Status atualizado: ${data.status}`);
                    }
                    return data;
                });
                setLastStatus(data.status);
            })
            .catch(() => { }).finally(() => {
                setLoading(false);
            });

    }, [id]);
    const purchaseIdRef = useRef(purchase?.id_invoice_pix)

    useEffect(() => {
        purchaseIdRef.current = purchase?.id_invoice_pix
    }, [purchase?.id_invoice_pix])

    useEffect(() => {
        if (!id) return
        if (!purchase?.id_invoice_pix) return
        if (purchase?.status === "credited") return

        const fetchPurchase = async () => {
            try {
                const res = await fetch("/api/payment/pix/dynamic/consult", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id_invoice_pix: purchaseIdRef.current,
                    }),
                })

                if (!res.ok) throw new Error("Erro ao buscar a compra")

                const { data } = await res.json()


                if (purchaseIdRef.current === purchase?.id_invoice_pix) {
                    if (purchase.status !== data.status) {
                        toast.success(`Compra atualizada: ${data.status}`)
                    }

                    setPurchase((prev) => {
                        if (!prev) return prev
                        return {
                            ...prev,
                            status: data.status,
                            purchase: {
                                ...prev.purchase,
                                status: data.status,
                                user: {
                                    ...prev?.purchase?.user,
                                },
                            },
                        }
                    })
                    await axios.post("/api/payment/pix/dynamic/update", {
                        paymentId: purchase.id,
                        status: data.status,
                        purchaseId: purchase.purchase.id,
                    });
                }

            } catch (error) {
                console.error("Error fetching purchase:", error)
            } finally {

            }
        }

        fetchPurchase()
        const intervalId = setInterval(fetchPurchase, 60000)
        return () => clearInterval(intervalId)
    }, [id, purchase?.id_invoice_pix, purchase?.status])


    useEffect(() => {
        const eventSource = new EventSource("/api/sse");
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id_invoice_pix === purchase?.id_invoice_pix) {
                setPurchase((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        status: data.status,
                        purchase: {
                            ...prev.purchase,
                            status: data.status,
                        }
                    };
                });
            }
        };
        return () => {
            eventSource.close();
        };
    }, [purchase?.id_invoice_pix]);

    if (loading) return <div className="p-8 text-white">Carregando...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!purchase) return <div className="p-8 text-white">Compra não encontrada.</div>;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <PaymentListener />
            <div className="w-full max-w-lg rounded bg-white/10 p-8">
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                    className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    onClick={() => router.back()}
                >
                    Voltar
                </button>
                <h1 className="mb-4 font-bold text-2xl">Detalhes da Compra</h1>
                <div className="mb-2"><b>ID:</b> {purchase.id}</div>
                <div className="mb-2"><b>Status:</b> {purchase.purchase.status}</div>
                <div className="mb-2"><b>Criada em:</b> {new Date(purchase.createdAt).toLocaleString("pt-BR")}</div>
                <div className="mb-2"><b>Atualizada em:</b> {new Date(purchase.updatedAt).toLocaleString("pt-BR")}</div>
                <div className="mb-2"><b>Quem gerou o Pix:</b> {purchase.purchase.user.name}</div>
                {purchase.purchase && (
                    <>
                        <hr className="my-4 border-white/20" />
                        <h2 className="mb-2 font-semibold text-xl">Pagamento</h2>
                        <div className="mb-2"><b>ID Pix:</b> {purchase.id_invoice_pix}</div>
                        <div className="mb-2"><b>Valor:</b> {Number(purchase.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                        <div className="mb-2"><b>Vencimento:</b> {new Date(purchase.vencimento).toLocaleString("pt-BR")}</div>
                        <div className="mb-2"><b>Descrição:</b> {purchase.purchase.description}</div>
                        <div className="mb-2"><b>Status:</b> {purchase.status}</div>
                        <div className="mb-2"><b>TxID:</b> {purchase.tx_id}</div>
                        {purchase.qrcode && (
                            <div className="mb-2">
                                <b>QR Code:</b><br />
                                <img src={purchase.qrcode} alt="QR Code" className="w-40 h-40 bg-white p-2 rounded" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}