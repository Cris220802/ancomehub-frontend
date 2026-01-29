import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AgentCatalogResponseDto } from "@/types/users";

interface AgentCardProps {
    agent: AgentCatalogResponseDto;
}

export const AgentCard = ({ agent }: AgentCardProps) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden h-[380px] flex flex-col relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent h-24" />

        <div className="relative flex flex-col items-center pt-8 px-6 flex-1">
            {/* Avatar con anillo */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary text-4xl font-bold border-4 border-white shadow-md mb-4 z-10 group-hover:scale-105 transition-transform duration-300">
                {agent.fullName.charAt(0)}
            </div>

            <div className="text-center z-10">
                <h3 className="font-bold text-gray-900 text-xl leading-tight mb-1">{agent.fullName.split(' ')[0]}</h3>
                <p className="text-sm text-gray-500 font-medium mb-4">{agent.fullName.split(' ').slice(1).join(' ')}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Asesor de Ventas Asignado
                </span>
            </div>
        </div>
        <div className="flex items-center justify-center mt-2">
            <span className="text-xs font-medium text-gray-500">¿Tienes dudas?, contácta a tu asesor.</span>
        </div>
        {/* Acciones Rápidas */}
        <div className="p-4 grid grid-cols-2 gap-3 border-t border-gray-100 bg-gray-50/50">

            {agent.phoneNumber && (
                <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm h-10 text-xs"
                    onClick={() => window.open(`https://wa.me/${agent.phoneNumber.replace(/\D/g, '')}`, '_blank')}
                >
                    <Phone className="mr-2 h-3.5 w-3.5" /> WhatsApp
                </Button>
            )}

            <Button
                variant="outline"
                className="w-full border-gray-200 text-gray-700 hover:bg-white h-10 text-xs"
                onClick={() => window.location.href = `mailto:${agent.email}`}
            >
                <Mail className="mr-2 h-3.5 w-3.5" /> Correo
            </Button>
        </div>
    </div>
);
