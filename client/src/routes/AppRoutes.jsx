import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Auth/Login';
import SalesDashboard from '../pages/Sales/SalesDashboard';
import PurchaseDashboard from '../pages/Purchase/PurchaseDashboard';
import ProductionDashboard from '../pages/Production/ProductionDashboard';
import FinanceDashboard from '../pages/Finance/FinanceDashboard';
import HRDashboard from '../pages/HR/HRDashboard';
import LogisticsDashboard from '../pages/Logistics/LogisticsDashboard';
import QualityDashboard from '../pages/Quality/QualityDashboard';
import MaintenanceDashboard from '../pages/Maintenance/MaintenanceDashboard';
import Settings from '../pages/Settings/Settings';
import Dashboard from '../pages/Dashboard/Dashboard';

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <h2 className="text-3xl font-bold text-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-slate-500 to-slate-300">
      {title} Module Integration Pending
    </h2>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard" element={<Placeholder title="Main Dashboard" />} />
          <Route path="sales" element={<SalesDashboard />} />
          <Route path="purchase" element={<PurchaseDashboard />} />
          <Route path="production" element={<ProductionDashboard />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="hr" element={<HRDashboard />} />
          <Route path="logistics" element={<LogisticsDashboard />} />
          <Route path="quality" element={<QualityDashboard />} />
          <Route path="contractors" element={<Placeholder title="Contractors" />} />
          <Route path="maintenance" element={<MaintenanceDashboard />} />
          <Route path="warehouse" element={<Placeholder title="Warehouse" />} />
          <Route path="assets" element={<Placeholder title="Assets" />} />
          <Route path="statutory" element={<Placeholder title="Statutory" />} />
          <Route path="simulation" element={<Placeholder title="Simulation" />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;