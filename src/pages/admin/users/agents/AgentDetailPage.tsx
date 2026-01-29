import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAgents } from '../../hooks/useAdminAgents';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignClientToAgentDialog } from './AssignClientToAgentDialog';
import { AgentClientsList } from './AgentClientsList';
import { useState } from 'react';

export default function AgentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { useGetAgent } = useAdminAgents();
    const { data: agent, isLoading, isError } = useGetAgent(id || '');

    const [assignOpen, setAssignOpen] = useState(false);

    if (isLoading) {
        return <div className="p-8">Cargando detalle del agente...</div>;
    }

    if (isError || !agent) {
        return <div className="p-8 text-red-500">Error al cargar o agente no encontrado.</div>;
    }

    return (
        <div className="p-8 space-y-6 bg-gray-50/50 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => navigate('/admin/agents')} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Agentes
                </Button>
                <Button onClick={() => setAssignOpen(true)}>
                    Asignar Cliente
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Main Profile Card */}
                    <Card className="flex-1 w-full border-none shadow-md">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            {/* ... existing header content ... */}
                            <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${agent.fullName}&background=random`} />
                                <AvatarFallback>{agent.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl font-bold">{agent.fullName}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={agent.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {agent.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 mt-4">
                            {/* ... existing details ... */}
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Correo:</span>
                                <span>{agent.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Rol:</span>
                                <span>Agente de Ventas</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats or other info placeholder */}
                    <Card className="w-full md:w-1/3 border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumen de Actividad</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">
                                Próximamente: Métricas de ventas, clientes asignados, etc.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Clientes Asignados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AgentClientsList agentId={id || ''} />
                    </CardContent>
                </Card>
            </div>

            <AssignClientToAgentDialog
                open={assignOpen}
                onOpenChange={setAssignOpen}
                agentId={id || ''}
            />
        </div>
    );
}
