import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const InGridBanner = () => (
    <div className="col-span-full w-full h-[180px] bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl overflow-hidden relative flex items-center shadow-md my-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                    <Megaphone className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" /> Ofertas Flash
                </h3>
                <p className="text-slate-300 text-sm md:text-base max-w-md">
                    Precios especiales en lote de cascos V-Gard hasta agotar existencias.
                </p>
            </div>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black shrink-0">
                Ver Ofertas
            </Button>
        </div>
    </div>
);
