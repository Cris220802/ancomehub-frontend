import { ColumnDef } from "@tanstack/react-table";
import { FiscalDocument, FiscalStatus } from "@/types/fiscal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import {
    Eye,
    Download,
    FileText
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const statusColors: Record<FiscalStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PARTIALLY_PAID: 'bg-orange-100 text-orange-800 border-orange-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels: Record<FiscalStatus, string> = {
    PENDING: 'Pendiente',
    PARTIALLY_PAID: 'Pago Parcial',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
};

export const columns: ColumnDef<FiscalDocument>[] = [
    {
        accessorKey: "fiscalUuid",
        header: "Folio Fiscal (UUID)",
        cell: ({ row }) => {
            const uuid = row.getValue("fiscalUuid") as string;
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="font-mono text-gray-600 cursor-help">
                                {uuid.substring(0, 8)}...
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{uuid}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: "uploadedAt",
        header: "Fecha de Emisión",
        cell: ({ row }) => {
            return new Date(row.getValue("uploadedAt")).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Monto Total</div>,
        cell: ({ row }) => (
            <div className="text-right font-medium text-gray-900">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(row.getValue("amount"))}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Estatus",
        cell: ({ row }) => {
            const status = row.getValue("status") as FiscalStatus;
            return (
                <Badge variant="outline" className={`border ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[status] || status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
            const doc = row.original;
            return (
                <div className="flex justify-end gap-2">
                    {/* Descarga rápida si hay PDF */}
                    {doc.pdfUrl && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => window.open(doc.pdfUrl, '_blank')}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">PDF</span>
                        </Button>
                    )}

                    <Link to={`/fiscal/${doc.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalle</span>
                        </Button>
                    </Link>
                </div>
            );
        },
    },
];
