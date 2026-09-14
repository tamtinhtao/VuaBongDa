import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
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
    <Routes>

      {/* Trang mac dinh */}
      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* Trang dang nhap */}
      <Route
        path="/login"
        element={<LoginPage />}
      />
      
      <Route
        path="/register"
        element={<RegisterPage />}
      />
      {/* Trang CUSTOMER */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute
            requiredRole="CUSTOMER"
          >
            <CustomerPage />
          </ProtectedRoute>
        }
      />
            <Route
          path="/cart"
          element={
            <ProtectedRoute
              requiredRole="CUSTOMER"
            >
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/checkout"
  element={
    <ProtectedRoute
      requiredRole="CUSTOMER"
    >
      <CheckoutPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/order-success/:orderId"
  element={
    <ProtectedRoute
      requiredRole="CUSTOMER"
    >
      <OrderSuccessPage />
    </ProtectedRoute>
  }
/>
      {/* Trang ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            requiredRole="ADMIN"
          >
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Khong du quyen */}
      <Route
        path="/unauthorized"
        element={
          <div>
            <h1>403 Forbidden</h1>

            <p>
              Ban khong co quyen truy cap
              trang nay.
            </p>
          </div>
        }
      />
      <Route
  path="/orders"
  element={
    <ProtectedRoute
      requiredRole="CUSTOMER"
    >
      <OrdersPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/orders/:orderId"
  element={
    <ProtectedRoute
      requiredRole="CUSTOMER"
    >
      <OrderDetailPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/orders"
  element={
    <ProtectedRoute
      requiredRole="ADMIN"
    >
      <AdminOrdersPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/categories"
  element={
    <ProtectedRoute
      requiredRole="ADMIN"
    >
      <AdminCategoriesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/products"
  element={
    <ProtectedRoute
      requiredRole="ADMIN"
    >
      <AdminProductsPage />
    </ProtectedRoute>
  }
/>
      {/* URL khong ton tai */}
      <Route
        path="*"
        element={
          <div>
            <h1>404</h1>
            <p>Khong tim thay trang.</p>
          </div>
        }
      />

    </Routes>
  );
}

export default App;