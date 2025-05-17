"use client";
import { useEffect, useState } from "react";
import TableWithPagination from "@/components/table";
import { signIn, signOut, useSession } from "next-auth/react";
import { formatDate } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import CurrencyInput from "@/components/currency-input";
import { useRouter } from "next/navigation";
import { PaymentListener } from "@/components/payment-listener";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const [form, setForm] = useState({
        valor: "",
        descricao: "",
        tipo_transacao: "pixCashin",
        texto_instrucao: "",
    });

    const columns = [
        { key: "id", label: "ID" },
        { key: "valor", label: "Valor" },
        { key: "vencimento", label: "Vencimento" },
        { key: "description", label: "Descrição" },
        { key: "status", label: "Status" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/payment/pix/dynamic/list", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Erro ao buscar os dados.");
                }

                const result = await response.json();

                setData(result.map((item: any) => ({
                    ...item,
                    vencimento: formatDate(new Date(item.vencimento), "dd/MM/yyyy"),
                    valor: `R$ ${item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                    description: item.purchase?.description || "",
                    status: item.purchase?.status || "",
                })));
            } catch (err: any) {
                setError(err?.message || "Erro desconhecido.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleInputChange2 = (e: any) => {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { valor, descricao, tipo_transacao, texto_instrucao } = form;
            const body = {
                ...form,
                valor: Number(form.valor) * 100,
                userId: session?.user?.id,
                identificador_movimento: uuidv4(),
                enviar_qr_code: true,
                tag: ["tag1", "tag2"],
                ...(tipo_transacao === 'pixCashin'
                    ? { vencimento: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString() }
                    : {}),
            }


            const response = await fetch(`/api/payment/pix/${tipo_transacao === 'pixCashin' ? 'dynamic' : 'static'}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...body
                }),
            });
            if (!response.ok) throw new Error("Erro ao criar pagamento");
            setShowModal(false);
            setForm({
                valor: "",
                descricao: "",
                tipo_transacao: "pixCashin",
                texto_instrucao: "",
            });

            const updated = await response.json();
            router.push(`/dashboard/${updated.payment.id}`);

            // biome-ignore lint/suspicious/noExplicitAny: <explanation>

        } catch (err) {
            alert("Erro ao criar pagamento");
        }
    };

    const handleRowClick = (row: any) => {
        router.push(`/dashboard/${row.id}`);
    };

    if (status === "loading") {
        return <div className="p-8 text-white">Carregando...</div>;
    }
    if (!session) {
        signIn(); // Redireciona automaticamente para a tela de login
        return null;

    }
    return (

        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <PaymentListener />

                <h1 className="font-extrabold text-3xl text-white tracking-tight sm:text-[2rem]">
                    Sistema de criação de pagamentos via Pix
                </h1>
                <div className="flex items-center justify-center">
                    <div className="text-lg">
                        Olá, {session?.user?.name}!
                    </div>
                    <img
                        src={session?.user?.image ?? ""}
                        alt="User Avatar"
                        className="h-12 w-12 rounded-full"
                    />
                </div>
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                    className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    onClick={() => setShowModal(true)}
                >
                    Adicionar Pagamento
                </button>

                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                    className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    Sair
                </button>
            </div>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <TableWithPagination columns={columns} data={data}
                    onRowClick={handleRowClick} />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded bg-white p-8 text-black shadow-lg">
                        <h2 className="mb-4 font-bold text-xl">Novo Pagamento</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <CurrencyInput
                                name="valor"
                                placeholder="Valor"
                                value={form.valor}
                                onChange={handleInputChange2}
                                required
                                className="rounded border p-2"
                            />
                            <input
                                name="descricao"
                                type="text"
                                placeholder="Descrição"
                                value={form.descricao}
                                onChange={handleInputChange}
                                required
                                className="rounded border p-2"
                            />
                            <select
                                name="tipo_transacao"
                                value={form.tipo_transacao}
                                onChange={handleInputChange}
                                className="rounded border p-2"
                            >
                                <option value="pixCashin">Pix Dinâmico</option>
                                <option value="pixStaticCashin">Pix Estático</option>
                            </select>
                            <input
                                name="texto_instrucao"
                                type="text"
                                placeholder="Instruções"
                                value={form.texto_instrucao}
                                onChange={handleInputChange}
                                required
                                className="rounded border p-2"
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-gray-300"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-500 text-white"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}