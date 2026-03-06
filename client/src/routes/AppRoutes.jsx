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
import ContractorDashboard from '../pages/Contractor/ContractorDashboard'; // <-- Added Contractor Import

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
                {/* Admin Only */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                </Route>

                {/* Employee Only */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'employee']} />}>
                    <Route path="/employee" element={<EmployeeDashboard />} />
                </Route>

                {/* Contractor Only */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'contractor']} />}>
                    <Route path="/contractor" element={<ContractorDashboard />} />
                </Route>

                {/* All logged-in users */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'user', 'employee', 'contractor']} />}>
                    <Route path="/dashboard" element={<UserDashboard />} />
                    
                    {/* The 13 Hubs */}
                    <Route path="/sales" element={<SalesHub />} />
                    <Route path="/purchase" element={<PurchaseHub />} />
                    <Route path="/production" element={<ProductionHub />} />
                    <Route path="/finance" element={<FinanceHub />} />
                    <Route path="/hr-payroll" element={<HRPayrollHub />} />
                    <Route path="/logistics" element={<LogisticsHub />} />
                    <Route path="/quality" element={<QualityHub />} />
                    <Route path="/maintenance" element={<MaintenanceHub />} />
                    <Route path="/inventory" element={<InventoryHub />} />
                    <Route path="/assets" element={<AssetsHub />} />
                    <Route path="/statutory" element={<StatutoryHub />} />
                    <Route path="/simulation" element={<SimulationHub />} />
                    <Route path="/reports" element={<ReportsHub />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
    );
};

export default AppRoutes;