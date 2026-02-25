import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { ConfirmInvitationPage } from '../pages/auth/ConfirmInvitationPage';
import { SendEmailRecoveryPage } from '../pages/auth/SendEmailRecoveryPage';
import { RecoveryPasswordPage } from '../pages/auth/RecoveryPasswordPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

import { ProductsPage } from '../pages/products/ProductsPage';
import { CategoriesPage } from '@/pages/categories/CategoriesPage';
import { RoleGuard } from './RoleGuard';
import { UnauthorizedPage } from '../pages/errors/UnauthorizedPage';

import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    Tags,
    LogOut,
    ShoppingBag,
    DockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ClientLayout } from '@/layouts/ClientLayout';
import { CatalogPage } from '@/pages/client/product-detail/CatalogPage';
import { ProductDetailPage } from '@/pages/client/product-detail/ProductDetailPage';
import { CartPage } from '@/pages/client/cart/CartPage';
import { OrdersPage } from '@/pages/client/orders/OrdersPage';
import { OrderDetailPage } from '@/pages/client/orders/OrderDetailPage';
import { QuotesPage } from '@/pages/client/quotes/QuotesPage';
import { QuoteDetailPage } from '@/pages/client/quotes/QuoteDetailPage';
import { FiscalPage } from '@/pages/client/fiscal/FiscalPage';
import { FiscalDetailPage } from '@/pages/client/fiscal/FiscalDetailPage';
import { PaymentDetailPage } from '@/pages/client/payments/PaymentDetailPage';
import { OrdersPage as AdminOrdersPage } from '@/pages/admin/orders/OrdersPage';
import { OrderDetailPage as AdminOrderDetailPage } from '@/pages/admin/orders/OrderDetailPage';
import { QuoteAdminDetailPage } from '@/pages/admin/orders/QuoteAdminDetailPage';
import { FiscalAdminPage } from '@/pages/admin/fiscal/FiscalAdminPage';
import { FiscalAdminDetailPage } from '@/pages/admin/fiscal/FiscalAdminDetailPage';
import PriceListsPage from '@/pages/admin/pricing/PriceListsPage';
import PriceListDetailPage from '@/pages/admin/pricing/PriceListDetailPage';
import { WarehousePage } from '@/pages/admin/warehouse/WarehousePage';
import { MovementProductDetailPage } from '@/pages/admin/warehouse/MovementProductDetailPage';
import ClientsPage from '@/pages/admin/users/clients/ClientsPage';
import ClientDetailPage from '@/pages/admin/users/clients/ClientDetailPage';
import AgentsPage from '@/pages/admin/users/agents/AgentsPage';
import AgentDetailPage from '@/pages/admin/users/agents/AgentDetailPage';
import { ProfilePage } from '@/pages/client/profile/ProfilePage';
import { ScrollToTop } from '@/components/ScrollToTop';
import { CatalogPage as PublicCatalogPage } from '@/pages/public/CatalogPage';
import { NotificationsMenu } from '@/components/layout/NotificationsMenu';

const MainLayout = () => {
    const { logout, user } = useAuthStore();

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r shadow-sm flex flex-col min-h-screen">
                <div className="p-6 border-b flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-primary">AncomeHub</h1>
                </div>

                <div className="p-4 border-b">
                    <p className="text-sm text-muted-foreground">Bienvenido,</p>
                    <p className="font-semibold text-gray-800 truncate">{user?.fullName || 'Usuario'}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {/* <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </NavLink> */}
                    <NavLink
                        to="/admin/clients"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Users className="h-5 w-5" />
                        Clientes
                    </NavLink>
                    <NavLink
                        to="/admin/agents"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Users className="h-5 w-5" />
                        Vendedores
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <ShoppingBag className="h-5 w-5" />
                        Pedidos
                    </NavLink>
                    <NavLink
                        to="/admin/fiscal"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <DockIcon className="h-5 w-5" />
                        Facturas
                    </NavLink>
                    <NavLink
                        to="/admin/pricing"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Tags className="h-5 w-5" />
                        Listas de precios
                    </NavLink>
                    <NavLink
                        to="/admin/warehouse"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <DockIcon className="h-5 w-5" />
                        Almacén
                    </NavLink>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Package className="h-5 w-5" />
                        Productos
                    </NavLink>
                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Tags className="h-5 w-5" />
                        Categorías
                    </NavLink>
                </nav>

                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={logout}
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">

                {/* TOPBAR NUEVA */}
                <header className="h-16 bg-white border-b shadow-sm sticky top-0 z-30 px-8 flex items-center justify-end">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden md:block">
                            Modo Administrador
                        </span>

                        {/* El componente de notificaciones que pediste */}
                        <NotificationsMenu />

                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900 leading-none capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>


        </div>
    );
};

export const AppRouter = () => {
    const { checkAuthStatus, status, user } = useAuthStore();

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    if (status === 'checking') {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl font-semibold text-gray-600">Inicializando...</div>
            </div>
        );
    }

    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public Catalog Routes - Accessible by everyone */}


                <Route path="/auth" element={<PublicRoute />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="recovery" element={<SendEmailRecoveryPage />} />
                    <Route path="recovery-password" element={<RecoveryPasswordPage />} />
                    <Route path="confirm-invitation" element={<ConfirmInvitationPage />} />
                    <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Route>

                <Route path="/" element={<ProtectedRoute />}>
                    {/* 
                    Logic:
                    If user is ADMIN -> MainLayout -> DashboardPage
                    If user is CLIENT -> ClientLayout -> CatalogPage
                 */}

                    {/* ADMIN ROUTES */}
                    {user?.role === 'ADMIN' && (
                        <Route element={<MainLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                                <Route path="admin/clients" element={<ClientsPage />} />
                                <Route path="admin/clients/:id" element={<ClientDetailPage />} />
                                <Route path="admin/agents" element={<AgentsPage />} />
                                <Route path="admin/agents/:id" element={<AgentDetailPage />} />
                                <Route path="admin/products" element={<ProductsPage />} />
                                <Route path="admin/categories" element={<CategoriesPage />} />
                                <Route path="admin/orders" element={<AdminOrdersPage />} />
                                <Route path="admin/orders/:id" element={<AdminOrderDetailPage />} />
                                <Route path="admin/orders/quotes/:id" element={<QuoteAdminDetailPage />} />
                                <Route path="admin/fiscal" element={<FiscalAdminPage />} />
                                <Route path="admin/fiscal/:id" element={<FiscalAdminDetailPage />} />
                                <Route path="admin/pricing" element={<PriceListsPage />} />
                                <Route path="admin/pricing/:id" element={<PriceListDetailPage />} />
                                <Route path="admin/warehouse" element={<WarehousePage />} />
                                <Route path="admin/warehouses/:warehouseId/products/:productId" element={<MovementProductDetailPage />} />
                            </Route>
                        </Route>
                    )}

                    {/* CLIENT ROUTES */}
                    {user?.role === 'CLIENT' && (
                        <Route element={<ClientLayout />}>
                            <Route index element={<CatalogPage />} />
                            <Route path="product/:id" element={<ProductDetailPage />} />
                            <Route path="cart" element={<CartPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="orders/:id" element={<OrderDetailPage />} />
                            <Route path="quotes" element={<QuotesPage />} />
                            <Route path="quotes/:id" element={<QuoteDetailPage />} />
                            <Route path="fiscal" element={<FiscalPage />} />
                            <Route path="fiscal/:id" element={<FiscalDetailPage />} />
                            <Route path="payments/:id" element={<PaymentDetailPage />} />
                            <Route path="client/profile" element={<ProfilePage />} />
                            {/* Prevent clients from accessing admin routes */}
                            <Route path="admin/clients" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/clients/:id" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/agents" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/agents/:id" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/products" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/categories" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/orders" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/orders/:id" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/orders/quotes/:id" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/fiscal" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/fiscal/:id" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/warehouse" element={<Navigate to="/unauthorized" replace />} />
                            <Route path="admin/warehouses/:warehouseId/products/:productId" element={<Navigate to="/unauthorized" replace />} />
                        </Route>
                    )}

                    {/* Fallback for unknown roles or errors */}
                    {(!user?.role || (user.role !== 'ADMIN' && user.role !== 'CLIENT')) && (
                        <Route path="*" element={<Navigate to="/auth/login" replace />} />
                    )}

                </Route>

                <Route path="/catalogo" element={<PublicCatalogPage />} />
                <Route path="/catalogo/:agentId" element={<PublicCatalogPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<Navigate to="/catalogo" replace />} />
            </Routes>
        </>
    );
};
