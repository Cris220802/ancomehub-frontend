import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
// IMPORTANTE: Importa tus imágenes aquí si usas Vite/Webpack
import imgFaros from "@/assets/banners/FarosLamparas.png";
import imgGuantes from "@/assets/banners/Guante.png";
import imgFiltros from "@/assets/banners/Filtros.png";
import imgSoluciones from "@/assets/banners/AncomeSoluciones.png";

const BANNER_SLIDES = [
    {
        id: 1,
        title: "Confort y Seguridad de Alta Calidad",
        subtitle: "Guante de Seguridad que cumplen con estándares de calidad internacionales.",
        cta: "Conocer Más",
        bgColor: "bg-black", // Usamos un color oscuro para que resalte la imagen
        image: imgGuantes, // Aquí iría tu imagen importada
        // Usando una URL de ejemplo para visualizarlo:
        // image: "https://png.pngtree.com/png-vector/20240131/ourmid/pngtree-industrial-led-floodlight-isolated-on-transparent-background-png-image_11577858.png"
    },
    {
        id: 2,
        title: "Iluminación de Alto Rendimiento",
        subtitle: "Lámparas y faros diseñados para las condiciones más extremas.",
        cta: "Conocer Más",
        bgColor: "bg-slate-800", // Usamos un color oscuro para que resalte la imagen
        image: imgFaros, // Aquí iría tu imagen importada
        // Usando una URL de ejemplo para visualizarlo:
        // image: "https://png.pngtree.com/png-vector/20240131/ourmid/pngtree-industrial-led-floodlight-isolated-on-transparent-background-png-image_11577858.png"
    },
    {
        id: 3,
        title: "Filtros y Mascarillas",
        subtitle: "Protección respiratoria de alta calidad para entornos exigentes.",
        cta: "Conocer Más",
        bgColor: "bg-slate-800", // Usamos un color oscuro para que resalte la imagen
        image: imgFiltros, // Aquí iría tu imagen importada
        // Usando una URL de ejemplo para visualizarlo:
        // image: "https://png.pngtree.com/png-vector/20240131/ourmid/pngtree-industrial-led-floodlight-isolated-on-transparent-background-png-image_11577858.png"
    },
    {
        id: 4,
        title: "IA y Software",
        subtitle: "Soluciones digitales que transforman la industria. Lleva tu operación al siguiente nivel con Ancome Soluciones.",
        cta: "Descubrir Servicios",
        bgColor: "bg-white", // Tono Guinda/Vino en Tailwind
        image: imgSoluciones,
    },


];

export const MainBannerSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const timeoutRef = useRef<any | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrentSlide((prev) => (prev === BANNER_SLIDES.length - 1 ? 0 : prev + 1));
        }, 6000); // Aumenté un poco el tiempo
        return () => resetTimeout();
    }, [currentSlide]);

    return (
        <div className="relative w-full h-[320px] md:h-[380px] rounded-2xl overflow-hidden shadow-lg group bg-gray-900">
            {BANNER_SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={cn(
                        // Ajusté el padding derecho (pr-0 en md) para que la imagen llegue al borde
                        "absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out flex flex-col justify-center px-8 md:pl-12 md:pr-0",
                        index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
                        slide.bgColor
                    )}
                >
                    {/* Patrón de fondo sutil */}
                    <div className="absolute inset-0 bg-white/5 opacity-20 pattern-grid-lg" />

                    {/* --- IMAGEN DEL PRODUCTO A LA DERECHA --- */}
                    {slide.image && (
                        <img
                            src={slide.image}
                            alt={slide.title}
                            // CAMBIO 2: Ajuste de clases para tamaño
                            // - md:w-3/4: Ahora ocupa el 75% del ancho derecho (antes 50%)
                            // - object-contain: Se asegura que se vea completa
                            // - scale-110: Un pequeño zoom extra
                            className="absolute top-0 right-0 h-full w-full md:w-3/4 object-contain object-right-bottom md:object-right opacity-60 md:opacity-100 mix-blend-normal z-0 md:scale-110 origin-bottom-right"
                        />
                    )}

                    {/* Gradiente para legibilidad del texto (más fuerte en la izquierda) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 md:via-black/40 to-transparent z-10" />

                    {/* Contenido de Texto (A la izquierda) */}
                    {/* Se ajustó max-w-2xl a md:max-w-lg para evitar que el texto se encime a la imagen en desktop */}
                    <div className="relative z-20 max-w-2xl md:max-w-lg space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <Badge className="bg-yellow-500 text-black hover:bg-yellow-400 border-0 font-bold px-3 py-1 text-xs w-fit">
                            Destacado Ancome
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-md">
                            {slide.title}
                        </h2>
                        <p className="text-gray-200 text-base md:text-lg font-medium line-clamp-2 drop-shadow-sm">
                            {slide.subtitle}
                        </p>
                        {
                            slide.id === 4 && (
                                <a href="https://www.ancomesoluciones.com" target="_blank" className="bg-white text-gray-900 hover:bg-gray-100 font-bold mt-2 border-0 w-fit shadow-md ">
                                    {slide.cta} <ChevronRight className="ml-2 h-4 w-4" />
                                </a>
                            )
                        }
                        {/* <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold mt-2 border-0 w-fit shadow-md">
                            {slide.cta} <ChevronRight className="ml-2 h-4 w-4" />
                        </Button> */}
                    </div>
                </div>
            ))}

            {/* Dots de navegación */}
            <div className="absolute bottom-6 left-8 z-30 flex gap-2">
                {BANNER_SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm",
                            currentSlide === idx ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};