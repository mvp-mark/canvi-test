"use client";

import { Toaster } from "react-hot-toast";

export function Toast({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    className: "bg-zinc-800 text-white",
                    style: {
                        background: "#27272a",
                        color: "#fff",
                    },
                }}
            />
        </>
    );
}
