import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXTAUTH_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

