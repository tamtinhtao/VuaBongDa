import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  requiredRole,
}) {
  const token =
    localStorage.getItem("vb_token");

  const role =
    localStorage.getItem("vb_role");

  // Chua dang nhap
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Da dang nhap nhung sai role
  if (
    requiredRole &&
    role !== requiredRole
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // Dung quyen
  return children;
}

export default ProtectedRoute;