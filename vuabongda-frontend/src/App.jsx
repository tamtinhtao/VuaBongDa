import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// CUSTOMER
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CustomerPage from "./pages/CustomerPage";

// AUTH
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminUsersPage from "./pages/AdminUsersPage";
// ADMIN
import AdminLayout from "./layouts/AdminLayout";
import AdminPage from "./pages/AdminPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminPromotionsPage from "./pages/AdminPromotionsPage";
import AdminReportsPage from "./pages/AdminReportsPage";

function App() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith(
      "/admin"
    );

  return (
    <>
      {/* Navbar user KHONG hien trong Admin */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* =========================
            PUBLIC / CUSTOMER
        ========================= */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetailPage />}
        />

        {/* AUTH */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* CUSTOMER PROTECTED */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <CustomerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success/:orderId"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
    ADMIN
========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<AdminPage />}
          />

          <Route
            path="orders"
            element={<AdminOrdersPage />}
          />

          <Route
            path="products"
            element={<AdminProductsPage />}
          />

          <Route
            path="categories"
            element={<AdminCategoriesPage />}
          />

          <Route
            path="promotions"
            element={<AdminPromotionsPage />}
          />

          <Route
            path="users"
            element={<AdminUsersPage />}
          />
          <Route
            path="reports"
            element={<AdminReportsPage />}
          />
        </Route>
        {/* =========================
            ERROR
        ========================= */}

        <Route
          path="/unauthorized"
          element={
            <div style={{ padding: 20 }}>
              <h1>403 Forbidden</h1>

              <p>
                Bạn không có quyền truy cập trang này.
              </p>
            </div>
          }
        />

        <Route
          path="*"
          element={
            <div style={{ padding: 20 }}>
              <h1>404</h1>

              <p>
                Không tìm thấy trang.
              </p>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;