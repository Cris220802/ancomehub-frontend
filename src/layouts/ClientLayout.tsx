import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
    Search,
    LogOut,
    User,
    FileText,
    Receipt,
    Menu,
    Bell,
    Package,
    ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartTrigger } from '@/components/layout/CartTrigger';
import { CartSheet } from '@/pages/client/cart/components/CartSheet';
import { cn } from '@/lib/utils';
import { NotificationsMenu } from '@/components/layout/NotificationsMenu';

// Configuración centralizada de la navegación
const navItems = [
    { label: 'Catálogo', path: '/', icon: Package, exact: true },
    { label: 'Mis Pedidos', path: '/orders', icon: ShoppingBag },
    { label: 'Mis Cotizaciones', path: '/quotes', icon: FileText },
    { label: 'Mis Facturas', path: '/fiscal', icon: Receipt },
];

export const ClientLayout = () => {
    const { user, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Sticky Header Principal */}
            <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4">

                    {/* Fila Superior */}
                    <div className="flex items-center justify-between h-16 md:h-20 gap-4 md:gap-8">

                        {/* IZQUIERDA: Menú Móvil + Logo */}
                        <div className="flex items-center gap-2 md:gap-0">
                            {/* Trigger Menú Móvil (Solo visible en mobile) */}
                            {/* Trigger Menú Móvil (Solo visible en mobile) */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden -ml-2"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="h-6 w-6 text-gray-700" />
                            </Button>

                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetContent side="left" className="w-[250px] sm:w-[400px]">
                                    <SheetHeader className="mb-6 text-left">
                                        <SheetTitle>
                                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                                Ancome<span className="text-primary">Hub</span>
                                            </span>
                                        </SheetTitle>
                                    </SheetHeader>

                                    {/* Búsqueda en Móvil */}
                                    <div className="mb-6 relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Buscar productos..."
                                            className="pl-9 bg-gray-100 border-none"
                                        />
                                    </div>

                                    {/* Enlaces de Navegación Móvil */}
                                    <nav className="flex flex-col gap-2">
                                        {navItems.map((item) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                end={item.exact}
                                                className={({ isActive }) => cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                {item.label}
                                            </NavLink>
                                        ))}
                                    </nav>
                                </SheetContent>
                            </Sheet>

                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-2 shrink-0">
                                <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                                    Ancome<span className="text-primary">Hub</span>
                                </span>
                            </Link>
                        </div>

                        {/* CENTRO: Search Bar (Solo Desktop) */}
                        {/* <div className="hidden md:flex flex-1 max-w-2xl relative">
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por nombre, SKU o categoría..."
                                    className="w-full pl-12 h-11 rounded-md bg-gray-100 border-transparent focus:bg-white focus:border-primary transition-all text-base"
                                />
                            </div>
                        </div> */}

                        {/* DERECHA: Acciones */}
                        <div className="flex items-center gap-2 md:gap-4 shrink-0">

                            {/* Notificaciones (Nuevo) */}
                            <NotificationsMenu />

                            {/* Carrito */}
                            <CartTrigger />

                            {/* Menú de Usuario */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full p-0 hover:bg-gray-100 ring-offset-2 focus:ring-2 focus:ring-primary/20">
                                        <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-gray-200">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.fullName}&background=d0b22e&color=fff`} alt={user?.fullName} />
                                            <AvatarFallback className="bg-primary text-white text-xs md:text-sm">
                                                {user?.fullName?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal px-2 py-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold text-gray-900 leading-none truncate">{user?.fullName}</p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">
                                                {user?.email}
                                            </p>
                                            <p className="pt-2 text-[10px] uppercase font-bold text-primary tracking-wider">
                                                {user?.role} ACCOUNT
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                                        <Link to="/client/profile">
                                            <User className="mr-3 h-4 w-4 text-gray-500" />
                                            <span>Mi Perfil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2.5">
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Fila Inferior: Navegación Desktop (Oculta en Mobile) */}
                    <div className="hidden md:block border-t border-gray-100 mt-2">
                        <nav className="flex items-center gap-8 h-12">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-2 h-full text-sm font-medium border-b-2 transition-colors px-1",
                                        isActive
                                            ? "border-primary text-primary"
                                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200"
                                    )}
                                >
                                    {/* Icono opcional en desktop, descomentar si se desea */}
                                    {/* <item.icon className="h-4 w-4" /> */}
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-10rem)]">
                <Outlet />
            </main>

            {/* Footer Simple */}
            <footer className="bg-white border-t border-gray-200 py-8 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500">© 2026 AncomeHub B2B Platform. Todos los derechos reservados.</p>
                </div>
            </footer>

            <CartSheet />
        </div>
    );
};