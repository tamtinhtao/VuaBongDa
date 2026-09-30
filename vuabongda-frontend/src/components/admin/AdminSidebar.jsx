import { NavLink } from "react-router-dom";

function AdminSidebar() {
    const menuClass = ({
        isActive,
    }) =>
        isActive
            ? "vb-admin-menu-item active"
            : "vb-admin-menu-item";

    return (
        <aside className="vb-admin-sidebar">
            <div className="vb-admin-brand">
                <div className="vb-admin-brand-icon">
                    VB
                </div>

                <div>
                    <strong>
                        VuaBongDa
                    </strong>

                    <span>
                        ADMIN PANEL
                    </span>
                </div>
            </div>

            <div className="vb-admin-profile">
                <div className="vb-admin-avatar">
                    A
                </div>

                <div>
                    <strong>
                        {localStorage.getItem(
                            "vb_username"
                        ) || "Admin"}
                    </strong>

                    <span>
                        <i />
                        Online
                    </span>
                </div>
            </div>

            <p className="vb-admin-menu-title">
                MAIN NAVIGATION
            </p>

            <nav className="vb-admin-menu">
                <NavLink
                    to="/admin"
                    end
                    className={
                        menuClass
                    }
                >
                    <span className="vb-admin-menu-icon">
                        ▦
                    </span>

                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/categories"
                    className={
                        menuClass
                    }
                >
                    <span className="vb-admin-menu-icon">
                        ≡
                    </span>

                    Quản trị danh mục
                </NavLink>

                <NavLink
                    to="/admin/products"
                    className={
                        menuClass
                    }
                >
                    <span className="vb-admin-menu-icon">
                        ◫
                    </span>

                    Quản trị sản phẩm
                </NavLink>

                <NavLink
                    to="/admin/orders"
                    className={
                        menuClass
                    }
                >
                    <span className="vb-admin-menu-icon">
                        ▤
                    </span>

                    Quản lý đơn hàng
                </NavLink>

                <NavLink
                    to="/admin/promotions"
                    className={
                        menuClass
                    }
                >
                    <span className="vb-admin-menu-icon">
                        %
                    </span>

                    Quản lý khuyến mãi
                </NavLink>

                <NavLink
                    to="/admin/users"
                    className={
                        menuClass
                    }
                >
                    <span className="vb-admin-menu-icon">
                        ♙
                    </span>

                    Quản lý tài khoản
                </NavLink>
                <NavLink
                    to="/admin/reports"
                    className={menuClass}
                >
                    <span className="vb-admin-menu-icon">
                        ▥
                    </span>

                    Báo cáo - Thống kê
                </NavLink>
            </nav>

            <div className="vb-admin-sidebar-bottom">
                <NavLink
                    to="/"
                    className="vb-admin-view-site"
                >
                    ← Xem website
                </NavLink>
            </div>
        </aside>
    );
}

export default AdminSidebar;