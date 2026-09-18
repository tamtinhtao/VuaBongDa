import { Route, Routes } from "react-router-dom";

// Import các components & pages mới
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";

// Import các trang sẵn có
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import RegisterPage from "./pages/RegisterPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import LoginPage from "./pages/LoginPage";
import CustomerPage from "./pages/CustomerPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Customer Routes */}
        <Route path="/customer" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute requiredRole="CUSTOMER"><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute requiredRole="CUSTOMER"><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success/:orderId" element={<ProtectedRoute requiredRole="CUSTOMER"><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute requiredRole="CUSTOMER"><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute requiredRole="CUSTOMER"><OrderDetailPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute requiredRole="ADMIN"><AdminOrdersPage /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requiredRole="ADMIN"><AdminCategoriesPage /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requiredRole="ADMIN"><AdminProductsPage /></ProtectedRoute>} />

        {/* Fallback Routes */}
        <Route path="/unauthorized" element={<div style={{ padding: 20 }}><h1>403 Forbidden</h1><p>Bạn không có quyền truy cập trang này.</p></div>} />
        <Route path="*" element={<div style={{ padding: 20 }}><h1>404</h1><p>Không tìm thấy trang.</p></div>} />
      </Routes>
    </>
  );
}

export default App;