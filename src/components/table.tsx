"use client";

import { useState } from "react";

interface TableProps<T> {
    data: T[];
    columns: { key: keyof T; label: string }[];
    rowsPerPage?: number;
    onRowClick?: (row: T) => void;
}

export default function TableWithPagination<T>({
    data,
    columns,
    rowsPerPage = 5,
    onRowClick,
}: TableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = data.slice(startIndex, startIndex + rowsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="w-full">
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 text-sm"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((row, rowIndex) => {
                        type RowKeyType = T[keyof T];
                        // Garante que columns[0] existe e que row[column.key] não é nulo/undefined
                        const firstColumnKey = columns[0]?.key;
                        const rowKey: string =
                            firstColumnKey && row && row[firstColumnKey] != null
                                ? String(row[firstColumnKey] as RowKeyType)
                                : `row-${rowIndex}`;
                        return (
                            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                            <tr
                                key={rowKey}
                                onClick={() => onRowClick?.(row)}
                                className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={String(column.key)}
                                        className="border border-gray-300 px-4 py-2 text-gray-600 text-sm"
                                    >
                                        {row[column.key] != null ? String(row[column.key]) : ""}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between">
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`rounded px-4 py-2 font-medium text-sm ${currentPage === 1
                        ? "cursor-not-allowed bg-gray-300 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                >
                    Anterior
                </button>
                <span className="text-gray-600 text-sm">
                    Página {currentPage} de {totalPages}
                </span>
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`rounded px-4 py-2 font-medium text-sm ${currentPage === totalPages
                        ? "cursor-not-allowed bg-gray-300 text-gray-500"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}