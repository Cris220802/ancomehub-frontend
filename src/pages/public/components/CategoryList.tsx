import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryListProps {
    categories: any[];
    selectedId?: string;
    onSelect: (id?: string) => void;
}

export const CategoryList = ({ categories, selectedId, onSelect }: CategoryListProps) => (
    <div className="space-y-1">
        <button onClick={() => onSelect(undefined)} className={cn("w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group", selectedId === undefined ? "bg-gray-900 text-white font-medium" : "text-gray-600 hover:bg-gray-50")}>
            Todas {selectedId === undefined && <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {categories.map((cat) => (
            <button key={cat.id} onClick={() => onSelect(cat.id)} className={cn("w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group", selectedId === cat.id ? "bg-gray-900 text-white font-medium" : "text-gray-600 hover:bg-gray-50")}>
                {cat.name} {selectedId === cat.id && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
        ))}
    </div>
);
