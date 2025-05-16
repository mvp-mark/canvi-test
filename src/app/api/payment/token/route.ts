import axios from "axios";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = await axios.post("https://gateway-homol.service-canvi.com.br/bt/token", {
            client_id: "105F0B108954FF",
            private_key: "F7DD2108954105F0BF765DFFDB210C880101B4D107363F7DD2"
        })



        if (response.status >= 400) {
            const errorResponse = await response.data();
            return NextResponse.json(
                { message: "Erro ao enviar para o endpoint externo", error: errorResponse, ...errorResponse },
                { status: response.status }
            );
        }
        const responseData = await response.data;

        return NextResponse.json(
            { token: responseData.token },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}