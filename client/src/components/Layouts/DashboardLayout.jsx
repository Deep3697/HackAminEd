import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            {/* Sidebar and Top Navigation will go here */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
