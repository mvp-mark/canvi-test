"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { auth } from "@/server/auth";
import { PaymentListener } from "@/components/payment-listener";
import { useEffect, useState } from "react";
import { PaymentDynamicService } from "@/services/payment.service";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
export default function HomePage() {

	const { data: session } = useSession();

	const [loading, setLoading] = useState(false);
	const [responseMessage, setResponseMessage] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (session) {
			router.push("/dashboard");
		}
	}, [session, router]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
				<h1 className="font-extrabold text-5xl text-white tracking-tight sm:text-[5rem]">
					Simulador de <span className="text-[hsl(280,100%,70%)]">Pix</span> App
				</h1>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">

				</div>
				<div className="mt-8">

					{session ? (
						<>
							<p className="mb-4">Bem-vindo, {session.user?.name}!</p>
							{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
							<button
								className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
								onClick={() => signOut()}
							>
								Sair
							</button>
						</>
					) : (
						// biome-ignore lint/a11y/useButtonType: <explanation>
						<button
							className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
							onClick={() => signIn("discord")}
						>
							Entrar com Discord
						</button>
					)}
				</div>
			</div>

			{session && (
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="font-extrabold text-5xl text-white tracking-tight sm:text-[5rem]">
						Criar Pix Dinâmico
					</h1>
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}

					{responseMessage && (
						<p className="mt-4 text-lg">{responseMessage}</p>
					)}
				</div>
			)}
		</main>
	);
}