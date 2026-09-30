import { useLocation, useNavigate } from "react-router-dom";

function AdminHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const username =
        localStorage.getItem("vb_username") || "Admin";

    const getPageTitle = () => {
        if (location.pathname === "/admin") {
            return "Dashboard";
        }

        if (location.pathname.includes("/products")) {
            return "Quản trị sản phẩm";
        }

        if (location.pathname.includes("/categories")) {
            return "Quản trị danh mục";
        }

        if (location.pathname.includes("/orders")) {
            return "Quản lý đơn hàng";
        }

        if (location.pathname.includes("/promotions")) {
            return "Quản lý khuyến mãi";
        }

        return "Quản trị";
    };

    const handleLogout = () => {
        localStorage.removeItem("vb_token");
        localStorage.removeItem("vb_userId");
        localStorage.removeItem("vb_username");
        localStorage.removeItem("vb_role");

        sessionStorage.removeItem("vb_buy_now");
        sessionStorage.removeItem("vb_checkout_cart_items");

        navigate("/login");
    };

    return (
        <header className="vb-admin-header">
            <div className="vb-admin-header-left">
                <span className="vb-admin-toggle">
                    ☰
                </span>

                <div>
                    <h1>{getPageTitle()}</h1>
                    <p>Control panel</p>
                </div>
            </div>

            <div className="vb-admin-header-right">
                <button
                    type="button"
                    className="vb-admin-site-button"
                    onClick={() => navigate("/")}
                >
                    Xem website
                </button>

                <div className="vb-admin-header-user">
                    <div className="vb-admin-header-avatar">
                        A
                    </div>

                    <div>
                        <strong>{username}</strong>
                        <span>Quản trị viên</span>
                    </div>
                </div>

                <button
                    type="button"
                    className="vb-admin-logout"
                    onClick={handleLogout}
                >
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}

export default AdminHeader;