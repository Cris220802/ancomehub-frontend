import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
    ArrowRight,
    Cpu,
    Code2,
    Zap,
    ChevronRight,
    ChevronLeft,
    FileText,
    ClipboardList,
    LayoutDashboard,
    Layers,
    Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

const BANNERS = [
    {
        id: "ancome-hub-management",
        brand: "Ancome Hub",
        badge: "Portal del Cliente",
        title: <>Toma el Control de <br /><span className="text-yellow-500">tus Operaciones</span></>,
        description: "Gestiona cotizaciones en tiempo real, descarga tus facturas y consulta complementos de pago al instante desde tu panel.",
        theme: "yellow",
        bgGradient: "from-slate-900 to-slate-800",
        hasButton: false,
        accentColor: "text-yellow-500",
        buttonColor: "bg-yellow-500 hover:bg-yellow-400 text-slate-900",
        features: [
            { icon: FileText, text: "Facturación 24/7" },
            { icon: ClipboardList, text: "Historial de Cotizaciones" }
        ],
        visual: {
            title: "Gestión Digital",
            subtitle: "Documentos y Pagos",
            tag: "Acceso Pro",
            tagColor: "bg-blue-500/20 text-blue-400",
            icon: LayoutDashboard
        }
    },
    {
        id: "ancome-soluciones-strat",
        brand: "Ancome Soluciones",
        badge: "Consultoría e Implementación",
        title: <>Evolución Digital <br /><span className="text-blue-400">Inteligente y Escalable</span></>,
        description: "Integramos ecosistemas digitales y modelos de IA que transforman datos en decisiones. Soluciones robustas para desafíos complejos.",
        theme: "blue",
        bgGradient: "from-slate-900 to-blue-950",
        hasButton: true,
        onClick: () => {
            // redirigir a pagina web
            window.open("https://www.ancomesoluciones.com", "_blank");
        },
        accentColor: "text-blue-400",
        buttonColor: "bg-blue-500 hover:bg-blue-400 text-white",
        features: [
            { icon: Layers, text: "Integración de Sistemas" },
            { icon: Cpu, text: "Modelos de IA" }
        ],
        visual: {
            title: "Ecosistema Digital",
            subtitle: "Liderazgo Tecnológico",
            tag: "SOLUCIONES",
            tagColor: "bg-cyan-500/20 text-cyan-300",
            icon: Share2
        }
    }
];

export function PromotionalBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 6000); // Cambia cada 6 segundos
        return () => clearInterval(interval);
    }, [currentIndex]);

    const handleNext = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
            setIsAnimating(false);
        }, 300); // Sincronizado con la duración de la transición
    };

    const handlePrev = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
            setIsAnimating(false);
        }, 300);
    };

    const banner = BANNERS[currentIndex];
    const VisualIcon = banner.visual.icon;

    return (
        <div className="relative group rounded-xl overflow-hidden shadow-lg border border-slate-800 mb-6">

            {/* Background con transición suave */}
            <div className={cn(
                "absolute inset-0 bg-linear-to-r transition-colors duration-700",
                banner.bgGradient
            )} />

            <div className={cn(
                "relative grid md:grid-cols-2 gap-6 p-6 md:p-8 items-center transition-opacity duration-300 ease-in-out",
                isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            )}>

                {/* Contenido de Texto */}
                <div className="space-y-4 z-10">
                    <div className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-sm backdrop-blur-xl",
                        banner.theme === 'yellow'
                            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                            : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    )}>
                        <span className={cn(
                            "flex h-2 w-2 rounded-full mr-2 animate-pulse",
                            banner.theme === 'yellow' ? "bg-yellow-500" : "bg-blue-400"
                        )}></span>
                        {banner.badge}
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                        {banner.title}
                    </h2>

                    <p className="text-slate-300 max-w-md text-sm md:text-base leading-relaxed">
                        {banner.description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        {banner.hasButton && (
                            <Button onClick={banner.onClick} className={cn("font-semibold border-none transition-all hover:scale-105", banner.buttonColor)}>
                                {banner.theme === 'yellow' ? 'Ver Catálogo' : 'Saber Más'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        <div className="flex gap-4 text-sm text-slate-400 items-center">
                            {banner.features.map((feature, idx) => (
                                <span key={idx} className="flex items-center gap-1.5">
                                    <feature.icon className={cn("h-4 w-4", banner.accentColor)} />
                                    {feature.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Elemento Visual / Tarjeta 3D */}

            </div>

            {/* Controles de Navegación (Flechas) */}
            <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Indicadores (Puntos) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {BANNERS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}