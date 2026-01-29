import { useState } from "react";
import { Plus, Edit, Trash2, Info, Building2, MapPin, Mail, CreditCard } from "lucide-react";
import { useClientProfile } from "@/hooks/useClientProfile";
import { AddressFormDialog } from "@/components/client/profile/AddressFormDialog";
import { Address } from "@/types/users";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ProfilePage = () => {
    const { client, isLoading, isError, updateShippingAddresses } = useClientProfile();
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<{ address: Address; index: number } | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ index: number } | null>(null);

    if (isLoading) {
        return (
            <div className="container max-w-5xl py-8 space-y-8 animate-pulse">
                <div className="h-8 w-1/3 bg-gray-200 rounded" />
                <div className="h-64 bg-gray-200 rounded" />
            </div>
        );
    }

    if (isError || !client) {
        return (
            <div className="container max-w-5xl py-8">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>No se pudieron cargar los datos del perfil.</AlertDescription>
                </Alert>
            </div>
        )
    }

    const { clientProfile, email, phoneNumber } = client;

    const handleCreateAddress = async (data: Address) => {
        // Agregar nueva dirección al array
        const newAddresses = [...(clientProfile.shippingAddresses as Address[] || []), data];
        await updateShippingAddresses(newAddresses);
    };

    const handleUpdateAddress = async (data: Address) => {
        if (editingAddress === null) return;
        const currentAddresses = [...(clientProfile.shippingAddresses as Address[] || [])];
        currentAddresses[editingAddress.index] = data;
        await updateShippingAddresses(currentAddresses);
        setEditingAddress(null);
    };

    const handleDeleteAddress = async () => {
        if (deleteConfirmation === null) return;
        const currentAddresses = [...(clientProfile.shippingAddresses as Address[] || [])];
        currentAddresses.splice(deleteConfirmation.index, 1);
        await updateShippingAddresses(currentAddresses);
        setDeleteConfirmation(null);
    };

    const openNewAddressDialog = () => {
        setEditingAddress(null);
        setIsAddressDialogOpen(true);
    };

    const openEditAddressDialog = (address: Address, index: number) => {
        setEditingAddress({ address, index });
        setIsAddressDialogOpen(true);
    };

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mi Perfil</h1>
                <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {clientProfile.companyName}
                </p>
            </div>

            <Tabs defaultValue="fiscal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="fiscal">Datos Fiscales</TabsTrigger>
                    <TabsTrigger value="shipping">Direcciones de Entrega</TabsTrigger>
                </TabsList>

                {/* TAB 1: DATOS FISCALES */}
                <TabsContent value="fiscal" className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                        <Info className="h-4 w-4 text-blue-800" />
                        <AlertTitle>Modo Lectura</AlertTitle>
                        <AlertDescription>
                            Por seguridad fiscal, estos datos no son editables desde la web. Contacta a tu asesor de ventas para solicitar cambios.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-gray-500" />
                                    Información General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-gray-500">Razón Social</span>
                                    <span className="text-base font-medium">{clientProfile.companyName}</span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-gray-500">RFC / Tax ID</span>
                                    <span className="text-base font-medium">{clientProfile.taxId || 'N/A'}</span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-gray-500">Email de Contacto</span>
                                    <span className="text-base font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {email}
                                    </span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-gray-500">Telefono</span>
                                    <span className="text-base font-medium">{phoneNumber || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-gray-500" />
                                    Dirección de Facturación
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {clientProfile.billingAddress ? (
                                    <div className="text-sm space-y-1 text-gray-700">
                                        <p className="font-medium text-base text-gray-900">{clientProfile.billingAddress.street} {clientProfile.billingAddress.exteriorNumber} {clientProfile.billingAddress.interiorNumber ? `Int. ${clientProfile.billingAddress.interiorNumber}` : ''}</p>
                                        <p>{clientProfile.billingAddress.neighborhood}</p>
                                        <p>{clientProfile.billingAddress.city}, {clientProfile.billingAddress.state}</p>
                                        <p>CP: {clientProfile.billingAddress.zipCode}</p>
                                        <p>{clientProfile.billingAddress.country || 'México'}</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">No hay dirección fiscal asignada.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: DIRECCIONES DE ENVÍO */}
                <TabsContent value="shipping" className="space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={openNewAddressDialog} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Dirección
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {(clientProfile.shippingAddresses as Address[] || []).map((addr, index) => (
                            <Card key={index} className="relative group overflow-hidden border-l-4 border-l-primary/0 hover:border-l-primary transition-all">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <MapPin className="h-5 w-5 text-primary mt-1" />
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        <p className="font-semibold text-gray-900 line-clamp-1">
                                            {addr.street} {addr.exteriorNumber} {addr.interiorNumber ? `Int. ${addr.interiorNumber}` : ''}
                                        </p>
                                        <p className="text-sm text-gray-600">{addr.neighborhood}</p>
                                        <p className="text-sm text-gray-600">{addr.city}, {addr.state}</p>
                                        <p className="text-sm text-gray-600">CP: {addr.zipCode}</p>
                                    </div>

                                    <div className="flex items-center gap-2 border-t pt-4 mt-auto">
                                        <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => openEditAddressDialog(addr, index)}>
                                            <Edit className="h-3 w-3" />
                                            Editar
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setDeleteConfirmation({ index })}>
                                            <Trash2 className="h-3 w-3" />
                                            Eliminar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {(!clientProfile.shippingAddresses || (clientProfile.shippingAddresses as Address[]).length === 0) && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-gray-50">
                                <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No tienes direcciones de envío</h3>
                                <p className="text-gray-500 mb-4">Agrega direcciones para agilizar tus pedidos.</p>
                                <Button variant="outline" onClick={openNewAddressDialog}>Agregar la primera dirección</Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <AddressFormDialog
                title={editingAddress ? "Editar Dirección" : "Nueva Dirección"}
                open={isAddressDialogOpen}
                onOpenChange={setIsAddressDialogOpen}
                onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
                initialData={editingAddress?.address}
            />

            <AlertDialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la dirección de envío de tu perfil.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAddress} className="bg-red-600 hover:bg-red-700 text-white">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
};
