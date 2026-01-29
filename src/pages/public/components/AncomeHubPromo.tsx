import { Zap, CheckCircle2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const AncomeHubPromo = () => (
    <div className="bg-gradient-to-br from-black to-primary rounded-xl p-5 text-white shadow-lg relative overflow-hidden group border">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all" />
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-white/10 p-1.5 rounded-lg">
                    <Zap className="text-yellow-400 h-5 w-5 fill-yellow-400" />
                </div>
                <h4 className="font-bold text-lg leading-none">Ancome HUB</h4>
            </div>
            <p className="text-xs mb-4 font-medium">
                La plataforma que facilita tus compras con Ancome.
            </p>
            <ul className="space-y-2.5 mb-5">
                {[
                    "Consulta de productos y precios",
                    "Consulta de tiempo de entrega",
                    "Atención preferencial",
                    "Gestión de pedidos",
                    "Gestión de tus facturas y complementos de pago",
                    "Cotizaciones automáticas 24/7",
                    "Todo en un solo lugar",
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
            <Button size="sm" className="w-full  text-white font-semibold text-xs h-9 shadow-lg shadow-primary/50 border-0">
                <Rocket className="mr-2 h-3.5 w-3.5" /> Solicitar Acceso
            </Button>
        </div>
    </div>
);
