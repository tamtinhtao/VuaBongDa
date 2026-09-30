import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import "../styles/admin.css";

function AdminLayout() {
    return (
        <div className="vb-admin-layout">
            <AdminSidebar />

            <div className="vb-admin-main">
                <AdminHeader />

                <main className="vb-admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;