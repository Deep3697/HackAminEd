import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../components/Layouts/DashboardLayout';

// Pages
import HomePage from '../pages/Public/HomePage';
import AuthPage from '../pages/Auth/AuthPage'; 
import AdminDashboard from '../pages/Admin/AdminDashboard';
import UserManagement from '../pages/Admin/UserManagement';
import UserDashboard from '../pages/User/UserDashboard';
import EmployeeDashboard from '../pages/Employee/EmployeeDashboard'; 
import ContractorDashboard from '../pages/Contractor/ContractorDashboard';
import CommandCenter from '../pages/Hubs/CommandCenter';

// Hubs 
import SalesHub from '../pages/Hubs/SalesHub';
import PurchaseHub from '../pages/Hubs/PurchaseHub';
import ProductionHub from '../pages/Hubs/ProductionHub';
import FinanceHub from '../pages/Hubs/FinanceHub';
import HRPayrollHub from '../pages/Hubs/HRPayrollHub';
import LogisticsHub from '../pages/Hubs/LogisticsHub';
import QualityHub from '../pages/Hubs/QualityHub';
import MaintenanceHub from '../pages/Hubs/MaintenanceHub';
import InventoryHub from '../pages/Hubs/InventoryHub';
import AssetsHub from '../pages/Hubs/AssetsHub';
import StatutoryHub from '../pages/Hubs/StatutoryHub';
import SimulationHub from '../pages/Hubs/SimulationHub';
import ReportsHub from '../pages/Hubs/ReportsHub';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} /> 

            <Route element={<DashboardLayout />}>
                {/* =====================================================
                    ADMIN ONLY ROUTES (9 Nav Hubs)
                    Command Center, Users, Sales & Purchase, Production & QC,
                    Inventory & Logistics, Finance & Statutory, HR & Payroll,
                    Maintenance & Assets, Simulation Tool
                   ===================================================== */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<CommandCenter />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/simulation" element={<SimulationHub />} />
                </Route>

                {/* =====================================================
                    ADMIN + EMPLOYEE ROUTES
                    Shared hubs accessible to both admin and employees
                   ===================================================== */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'employee']} />}>
                    <Route path="/employee" element={<EmployeeDashboard />} />
                    <Route path="/production" element={<ProductionHub />} />
                    <Route path="/inventory" element={<InventoryHub />} />
                    <Route path="/logistics" element={<LogisticsHub />} />
                    <Route path="/reports" element={<ReportsHub />} />
                    <Route path="/hr-payroll" element={<HRPayrollHub />} />
                    <Route path="/statutory" element={<StatutoryHub />} />
                    <Route path="/maintenance" element={<MaintenanceHub />} />
                    <Route path="/assets" element={<AssetsHub />} />
                </Route>

                {/* =====================================================
                    ADMIN + EMPLOYEE + USER ROUTES
                    Sales & Finance hubs
                   ===================================================== */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'employee', 'user']} />}>
                    <Route path="/sales" element={<SalesHub />} />
                    <Route path="/finance" element={<FinanceHub />} />
                </Route>

                {/* =====================================================
                    ADMIN + EMPLOYEE + CONTRACTOR ROUTES
                    Purchase & Quality hubs
                   ===================================================== */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'employee', 'contractor']} />}>
                    <Route path="/purchase" element={<PurchaseHub />} />
                    <Route path="/quality" element={<QualityHub />} />
                </Route>

                {/* =====================================================
                    CONTRACTOR ONLY DASHBOARD
                   ===================================================== */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'contractor']} />}>
                    <Route path="/contractor" element={<ContractorDashboard />} />
                </Route>

                {/* =====================================================
                    CUSTOMER/USER ROUTES (3 Nav Hubs)
                    Client Portal, New Orders (Sales), Invoices (Finance)
                   ===================================================== */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'user']} />}>
                    <Route path="/dashboard" element={<UserDashboard />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
    );
};

export default AppRoutes;