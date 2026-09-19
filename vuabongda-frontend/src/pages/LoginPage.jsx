import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await axiosClient.post("/api/auth/login", {
        username: form.username,
        password: form.password,
      });

      const data = response.data;

      localStorage.setItem("vb_token", data.token);
      localStorage.setItem("vb_userId", data.userId);
      localStorage.setItem("vb_username", data.username);
      localStorage.setItem("vb_role", data.role);

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setForm({
      ...form,
      username: "admin1",
      password: "123456",
    });
  };

  const fillCustomer = () => {
    setForm({
      ...form,
      username: "customer1",
      password: "123456",
    });
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* LEFT */}
        <section className="auth-intro">
          <p className="auth-badge">VUABONGDA STORE</p>

          <h1>Đăng nhập để tiếp tục mua sắm</h1>

          <p className="auth-description">
            Truy cập tài khoản của bạn để theo dõi đơn hàng, quản lý giỏ hàng
            và mua sắm nhanh hơn tại VuaBongDa.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="feature-dot">✓</span>
              <div>
                <h4>Mua hàng nhanh chóng</h4>
                <p>Lưu thông tin và thanh toán tiện lợi hơn.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <span className="feature-dot">✓</span>
              <div>
                <h4>Theo dõi đơn hàng</h4>
                <p>Kiểm tra trạng thái đơn hàng của bạn bất cứ lúc nào.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <span className="feature-dot">✓</span>
              <div>
                <h4>Ưu tiên cho thành viên</h4>
                <p>Nhận ưu đãi và cập nhật sản phẩm mới sớm hơn.</p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="auth-form-wrap">
          <div className="auth-card">
            <h2>Đăng nhập</h2>
            <p className="auth-form-subtitle">
              Nhập thông tin tài khoản để tiếp tục.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-row">
                <label className="remember-box">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                <Link to="/forgot-password" className="auth-link">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="auth-divider">
              <span>hoặc</span>
            </div>

            <div className="quick-login-box">
              <p>Tài khoản thử nghiệm</p>
              <div className="quick-login-actions">
                <button type="button" onClick={fillAdmin}>
                  Admin
                </button>
                <button type="button" onClick={fillCustomer}>
                  Khách hàng
                </button>
              </div>
            </div>

            <p className="auth-bottom-text">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="auth-link strong-link">
                Đăng ký ngay
              </Link>
            </p>

            <Link to="/" className="back-home-link">
              ← Quay lại trang chủ
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;