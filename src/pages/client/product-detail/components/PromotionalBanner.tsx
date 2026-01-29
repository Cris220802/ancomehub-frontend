import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
    ArrowRight,
    Truck,
    ShieldCheck,
    Cpu,
    Code2,
    Zap,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const BANNERS = [
    {
        id: "ancome-safety",
        brand: "Ancome",
        badge: "Oferta Especial",
        title: <>Seguridad Industrial <br /><span className="text-yellow-500">al Mejor Precio</span></>,
        description: "Equipa a tu personal minero e industrial con lo último en protección. Envío gratis en pedidos superiores a $5,000 MXN.",
        theme: "yellow", // Para estilos condicionales
        bgGradient: "from-slate-900 to-slate-800",
        accentColor: "text-yellow-500",
        buttonColor: "bg-yellow-500 hover:bg-yellow-400 text-slate-900",
        features: [
            { icon: Truck, text: "Envío Rápido" },
            { icon: ShieldCheck, text: "Norma Oficial" }
        ],
        visual: {
            title: "Kit Minero Pro",
            subtitle: "Casco, Lámpara y Guantes",
            tag: "-15% OFF",
            tagColor: "bg-green-500/20 text-green-400",
            icon: ShieldCheck // Icono visual si no hay imagen
        }
    },
    {
        id: "ancome-soluciones",
        brand: "Ancome Soluciones",
        badge: "Nueva División",
        title: <>Transformación Digital <br /><span className="text-blue-400">Software & IA</span></>,
        description: "Desarrollamos el software a la medida que tu empresa necesita. Automatización, ERPs personalizados y Consultoría en IA.",
        theme: "blue",
        bgGradient: "from-slate-900 via-slate-800 to-blue-950",
        accentColor: "text-blue-400",
        buttonColor: "bg-blue-500 hover:bg-blue-400 text-white",
        features: [
            { icon: Code2, text: "Desarrollo a Medida" },
            { icon: Cpu, text: "Inteligencia Artificial" }
        ],
        visual: {
            title: "Consultoría IT",
            subtitle: "Diagnóstico Gratuito",
            tag: "NUEVO",
            tagColor: "bg-blue-500/20 text-blue-300",
            icon: Zap
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
                        <Button className={cn("font-semibold border-none transition-all hover:scale-105", banner.buttonColor)}>
                            {banner.theme === 'yellow' ? 'Ver Catálogo' : 'Cotizar Proyecto'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
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
                <div className="hidden md:flex justify-end relative z-10">
                    {/* Efecto Glow de Fondo */}
                    <div className={cn(
                        "absolute inset-0 blur-3xl rounded-full translate-x-10 translate-y-10 opacity-40 transition-colors duration-700",
                        banner.theme === 'yellow' ? "bg-yellow-500/20" : "bg-blue-500/30"
                    )}></div>

                    <div className="relative p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 w-full max-w-sm shadow-2xl hover:bg-white/10 transition-colors duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-lg text-white">{banner.visual.title}</h3>
                                <p className="text-slate-400 text-xs">{banner.visual.subtitle}</p>
                            </div>
                            <span className={cn("px-2 py-1 text-[10px] rounded font-bold tracking-wider", banner.visual.tagColor)}>
                                {banner.visual.tag}
                            </span>
                        </div>

                        {/* Placeholder de Imagen o Icono Gigante */}
                        <div className="h-32 bg-slate-800/50 rounded-lg border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
                            <VisualIcon className={cn("h-16 w-16 opacity-50", banner.accentColor)} />
                        </div>
                    </div>
                </div>
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