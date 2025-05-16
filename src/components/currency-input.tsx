"use client"

import { useRef, type ChangeEvent } from "react"

interface CurrencyInputProps {
    name: string
    value: number | string
    onChange: (e: { target: { name: string; value: number | string } }) => void
    placeholder?: string
    required?: boolean
    className?: string
}

export default function CurrencyInput({
    name,
    value,
    onChange,
    placeholder = "0,00",
    required = false,
    className = "border p-2 rounded",
}: CurrencyInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    // Formata o valor para exibição
    const getDisplayValue = () => {
        if (value === "" || value === undefined || value === null) {
            return ""
        }

        // Converte para número se for string
        const numValue = typeof value === "string" ? Number.parseFloat(value) : value

        if (Number.isNaN(numValue)) {
            return ""
        }

        // Formata o número para o formato brasileiro (1.234,56)
        return numValue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value

        // Remove o símbolo R$ e espaços se o usuário colar um valor formatado
        inputValue = inputValue.replace(/R\$\s?/g, "").trim()

        // Substitui pontos por nada (remove separadores de milhar)
        inputValue = inputValue.replace(/\./g, "")

        // Substitui vírgula por ponto para cálculos internos
        const numericValue = inputValue.replace(",", ".")

        // Se estiver vazio ou for apenas uma vírgula/ponto
        if (inputValue === "" || inputValue === "," || inputValue === ".") {
            onChange({ target: { name, value: "" } })
            return
        }

        // Converte para número
        const numValue = Number.parseFloat(numericValue)

        // Verifica se é um número válido
        if (!Number.isNaN(numValue)) {
            onChange({ target: { name, value: numValue } })
        }
    }

    return (
        <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-500">R$</div>
            <input
                ref={inputRef}
                name={name}
                type="text"
                placeholder={placeholder}
                value={getDisplayValue()}
                onChange={handleInputChange}
                required={required}
                className={`${className} pl-8`}
                inputMode="decimal"
                aria-label="Valor em reais"
            />
        </div>
    )
}
