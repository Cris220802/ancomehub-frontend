import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface Meta {
    page: number;
    lastPage: number;
    total?: number;
    limit?: number;
}

interface CustomPaginationProps {
    meta?: Meta;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    className?: string;
}

export const CustomPagination = ({
    meta,
    onPageChange,
    isLoading = false,
    className
}: CustomPaginationProps) => {
    if (!meta || meta.lastPage <= 1) return null;

    const handlePrevious = () => {
        onPageChange(Math.max(1, (meta.page || 1) - 1));
    };

    const handleNext = () => {
        onPageChange(Math.min(meta.lastPage, (meta.page || 1) + 1));
    };

    const isPreviousDisabled = meta.page === 1 || isLoading;
    const isNextDisabled = meta.page === meta.lastPage || isLoading;

    return (
        <div className={cn("flex justify-center pt-4", className)}>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={handlePrevious}
                            className={cn(
                                "cursor-pointer",
                                isPreviousDisabled ? "pointer-events-none opacity-50" : ""
                            )}
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <div className="flex items-center justify-center px-4 text-sm font-medium">
                            Página {meta.page} de {meta.lastPage}
                        </div>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            onClick={handleNext}
                            className={cn(
                                "cursor-pointer",
                                isNextDisabled ? "pointer-events-none opacity-50" : ""
                            )}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};
