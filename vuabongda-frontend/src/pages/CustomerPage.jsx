import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../styles/customer-account.css";

function CustomerPage() {
  const navigate =
    useNavigate();
  const [searchParams] =
    useSearchParams();
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [showEdit, setShowEdit] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);
  useEffect(() => {
    const tab =
      searchParams.get("tab");

    if (
      tab === "password"
    ) {
      setShowPassword(true);
      setShowEdit(false);
    } else {
      setShowPassword(false);
      setShowEdit(false);
    }
  }, [searchParams]);
  const [profileForm, setProfileForm] =
    useState({
      fullName: "",
      phone: "",
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  // ================================
  // LOAD PROFILE
  // ================================
  const loadProfile =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosClient.get(
            "/api/users/me"
          );

        setProfile(
          response.data
        );

        setProfileForm({
          fullName:
            response.data
              ?.fullName || "",

          phone:
            response.data
              ?.phone || "",
        });
      } catch (err) {
        console.error(
          "LOAD PROFILE ERROR:",
          err
        );

        if (
          err.response?.status ===
          401
        ) {
          handleLogout();
          return;
        }

        setError(
          err.response?.data
            ?.message ||
          "Không thể tải thông tin tài khoản."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================
  // LOGOUT
  // ================================
  const handleLogout = () => {
    localStorage.removeItem(
      "vb_token"
    );

    localStorage.removeItem(
      "vb_userId"
    );

    localStorage.removeItem(
      "vb_username"
    );

    localStorage.removeItem(
      "vb_role"
    );

    navigate("/login");
  };

  // ================================
  // UPDATE PROFILE
  // ================================
  const handleUpdateProfile =
    async (e) => {
      e.preventDefault();

      setMessage("");
      setError("");

      if (
        !profileForm.fullName.trim()
      ) {
        setError(
          "Họ tên không được để trống."
        );
        return;
      }

      try {
        setSaving(true);

        const response =
          await axiosClient.put(
            "/api/users/me",
            {
              fullName:
                profileForm.fullName
                  .trim(),

              phone:
                profileForm.phone
                  .trim(),
            }
          );

        setProfile(
          response.data
        );

        setProfileForm({
          fullName:
            response.data
              ?.fullName || "",

          phone:
            response.data
              ?.phone || "",
        });

        setShowEdit(false);

        setMessage(
          "Cập nhật thông tin cá nhân thành công."
        );
      } catch (err) {
        console.error(
          "UPDATE PROFILE ERROR:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể cập nhật thông tin."
        );
      } finally {
        setSaving(false);
      }
    };

  // ================================
  // CHANGE PASSWORD
  // ================================
  const handleChangePassword =
    async (e) => {
      e.preventDefault();

      setMessage("");
      setError("");

      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setError(
          "Vui lòng nhập đầy đủ thông tin mật khẩu."
        );

        return;
      }

      if (
        passwordForm.newPassword
          .length < 6
      ) {
        setError(
          "Mật khẩu mới phải có ít nhất 6 ký tự."
        );

        return;
      }

      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setError(
          "Xác nhận mật khẩu mới không khớp."
        );

        return;
      }

      try {
        setChangingPassword(
          true
        );

        await axiosClient.put(
          "/api/users/me/password",
          passwordForm
        );

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setShowPassword(false);

        setMessage(
          "Đổi mật khẩu thành công."
        );
      } catch (err) {
        console.error(
          "CHANGE PASSWORD ERROR:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể đổi mật khẩu."
        );
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  // ================================
  // DATE
  // ================================
  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "vi-VN"
    );
  };

  // ================================
  // FIRST LETTER
  // ================================
  const avatarLetter =
    profile?.fullName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    profile?.username
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  if (loading) {
    return (
      <div className="vb-account-loading">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  return (
    <main className="vb-account-page">
      <div className="vb-account-container">
        {/* TITLE */}
        <div className="vb-account-heading">
          <div>
            <p className="vb-account-breadcrumb">
              Trang chủ / Tài khoản
            </p>

            <h1>
              Tài khoản của tôi
            </h1>

            <p>
              Quản lý thông tin cá nhân và
              tài khoản của bạn.
            </p>
          </div>
        </div>

        {message && (
          <div className="vb-account-alert success">
            {message}
          </div>
        )}

        {error && (
          <div className="vb-account-alert error">
            {error}
          </div>
        )}

        <div className="vb-account-layout">
          {/* =======================
              LEFT
          ======================= */}
          <aside className="vb-account-sidebar">
            <div className="vb-account-user-card">
              <div className="vb-account-avatar">
                {avatarLetter}
              </div>

              <h3>
                {profile?.fullName ||
                  profile?.username}
              </h3>

              <p>
                @{profile?.username}
              </p>

              <span className="vb-account-status">
                Đang hoạt động
              </span>
            </div>

            <div className="vb-account-menu">
              <button
                type="button"
                className="active"
                onClick={() => {
                  setShowEdit(false);
                  setShowPassword(false);
                }}
              >
                Thông tin tài khoản
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEdit(true);
                  setShowPassword(false);
                  setMessage("");
                  setError("");
                }}
              >
                Chỉnh sửa thông tin
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPassword(true);
                  setShowEdit(false);
                  setMessage("");
                  setError("");
                }}
              >
                Đổi mật khẩu
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/orders")
                }
              >
                Đơn hàng của tôi
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/cart")
                }
              >
                Giỏ hàng
              </button>

              <button
                type="button"
                className="logout"
                onClick={
                  handleLogout
                }
              >
                Đăng xuất
              </button>
            </div>
          </aside>

          {/* =======================
              RIGHT
          ======================= */}
          <section className="vb-account-content">
            {!showEdit &&
              !showPassword && (
                <>
                  <div className="vb-account-section-title">
                    <div>
                      <h2>
                        Thông tin cá nhân
                      </h2>

                      <p>
                        Thông tin tài khoản
                        hiện tại của bạn.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="vb-account-primary-btn"
                      onClick={() =>
                        setShowEdit(
                          true
                        )
                      }
                    >
                      Chỉnh sửa
                    </button>
                  </div>

                  <div className="vb-account-info-grid">
                    <div className="vb-account-info-item">
                      <span>
                        Họ và tên
                      </span>

                      <strong>
                        {profile?.fullName ||
                          "Chưa cập nhật"}
                      </strong>
                    </div>

                    <div className="vb-account-info-item">
                      <span>
                        Tên đăng nhập
                      </span>

                      <strong>
                        {profile?.username ||
                          "—"}
                      </strong>
                    </div>

                    <div className="vb-account-info-item">
                      <span>
                        Email
                      </span>

                      <strong>
                        {profile?.email ||
                          "—"}
                      </strong>
                    </div>

                    <div className="vb-account-info-item">
                      <span>
                        Số điện thoại
                      </span>

                      <strong>
                        {profile?.phone ||
                          "Chưa cập nhật"}
                      </strong>
                    </div>

                    <div className="vb-account-info-item">
                      <span>
                        Loại tài khoản
                      </span>

                      <strong>
                        Khách hàng
                      </strong>
                    </div>

                    <div className="vb-account-info-item">
                      <span>
                        Trạng thái
                      </span>

                      <strong className="vb-account-active-text">
                        {profile?.status ===
                          "ACTIVE"
                          ? "Đang hoạt động"
                          : profile?.status}
                      </strong>
                    </div>

                    <div className="vb-account-info-item">
                      <span>
                        Ngày tham gia
                      </span>

                      <strong>
                        {formatDate(
                          profile?.createdAt
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="vb-account-quick-title">
                    Truy cập nhanh
                  </div>

                  <div className="vb-account-quick-grid">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/orders"
                        )
                      }
                    >
                      <span className="vb-account-quick-icon">
                        ▤
                      </span>

                      <div>
                        <strong>
                          Đơn hàng của tôi
                        </strong>

                        <p>
                          Theo dõi và xem
                          lịch sử mua hàng
                        </p>
                      </div>

                      <span>
                        ›
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/cart"
                        )
                      }
                    >
                      <span className="vb-account-quick-icon">
                        🛒
                      </span>

                      <div>
                        <strong>
                          Giỏ hàng
                        </strong>

                        <p>
                          Xem các sản phẩm
                          đang chọn
                        </p>
                      </div>

                      <span>
                        ›
                      </span>
                    </button>
                  </div>
                </>
              )}

            {/* =======================
                EDIT PROFILE
            ======================= */}
            {showEdit && (
              <>
                <div className="vb-account-section-title">
                  <div>
                    <h2>
                      Chỉnh sửa thông tin
                    </h2>

                    <p>
                      Cập nhật họ tên và số
                      điện thoại.
                    </p>
                  </div>
                </div>

                <form
                  className="vb-account-form"
                  onSubmit={
                    handleUpdateProfile
                  }
                >
                  <div className="vb-account-form-group">
                    <label>
                      Tên đăng nhập
                    </label>

                    <input
                      type="text"
                      value={
                        profile?.username ||
                        ""
                      }
                      disabled
                    />

                    <small>
                      Không thể thay đổi tên
                      đăng nhập.
                    </small>
                  </div>

                  <div className="vb-account-form-group">
                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      value={
                        profile?.email ||
                        ""
                      }
                      disabled
                    />

                    <small>
                      Email tài khoản hiện
                      không cho phép thay đổi.
                    </small>
                  </div>

                  <div className="vb-account-form-group">
                    <label>
                      Họ và tên *
                    </label>

                    <input
                      type="text"
                      value={
                        profileForm.fullName
                      }
                      onChange={(e) =>
                        setProfileForm(
                          {
                            ...profileForm,
                            fullName:
                              e.target
                                .value,
                          }
                        )
                      }
                      maxLength={100}
                    />
                  </div>

                  <div className="vb-account-form-group">
                    <label>
                      Số điện thoại
                    </label>

                    <input
                      type="text"
                      value={
                        profileForm.phone
                      }
                      onChange={(e) =>
                        setProfileForm(
                          {
                            ...profileForm,
                            phone:
                              e.target
                                .value,
                          }
                        )
                      }
                      maxLength={20}
                    />
                  </div>

                  <div className="vb-account-form-actions">
                    <button
                      type="button"
                      className="vb-account-secondary-btn"
                      onClick={() => {
                        setShowEdit(
                          false
                        );

                        setProfileForm(
                          {
                            fullName:
                              profile?.fullName ||
                              "",

                            phone:
                              profile?.phone ||
                              "",
                          }
                        );
                      }}
                    >
                      Hủy
                    </button>

                    <button
                      type="submit"
                      className="vb-account-primary-btn"
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? "Đang lưu..."
                        : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* =======================
                PASSWORD
            ======================= */}
            {showPassword && (
              <>
                <div className="vb-account-section-title">
                  <div>
                    <h2>
                      Đổi mật khẩu
                    </h2>

                    <p>
                      Sử dụng mật khẩu đủ dài
                      và không chia sẻ với
                      người khác.
                    </p>
                  </div>
                </div>

                <form
                  className="vb-account-form"
                  onSubmit={
                    handleChangePassword
                  }
                >
                  <div className="vb-account-form-group">
                    <label>
                      Mật khẩu hiện tại *
                    </label>

                    <input
                      type="password"
                      value={
                        passwordForm.currentPassword
                      }
                      onChange={(e) =>
                        setPasswordForm(
                          {
                            ...passwordForm,
                            currentPassword:
                              e.target
                                .value,
                          }
                        )
                      }
                    />
                  </div>

                  <div className="vb-account-form-group">
                    <label>
                      Mật khẩu mới *
                    </label>

                    <input
                      type="password"
                      value={
                        passwordForm.newPassword
                      }
                      onChange={(e) =>
                        setPasswordForm(
                          {
                            ...passwordForm,
                            newPassword:
                              e.target
                                .value,
                          }
                        )
                      }
                    />

                    <small>
                      Tối thiểu 6 ký tự.
                    </small>
                  </div>

                  <div className="vb-account-form-group">
                    <label>
                      Xác nhận mật khẩu mới *
                    </label>

                    <input
                      type="password"
                      value={
                        passwordForm.confirmPassword
                      }
                      onChange={(e) =>
                        setPasswordForm(
                          {
                            ...passwordForm,
                            confirmPassword:
                              e.target
                                .value,
                          }
                        )
                      }
                    />
                  </div>

                  <div className="vb-account-form-actions">
                    <button
                      type="button"
                      className="vb-account-secondary-btn"
                      onClick={() => {
                        setShowPassword(
                          false
                        );

                        setPasswordForm(
                          {
                            currentPassword:
                              "",

                            newPassword:
                              "",

                            confirmPassword:
                              "",
                          }
                        );
                      }}
                    >
                      Hủy
                    </button>

                    <button
                      type="submit"
                      className="vb-account-primary-btn"
                      disabled={
                        changingPassword
                      }
                    >
                      {changingPassword
                        ? "Đang xử lý..."
                        : "Đổi mật khẩu"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default CustomerPage;