import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import axiosClient from "../api/axiosClient";

function Navbar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const dropdownRef =
    useRef(null);

  const [keyword, setKeyword] =
    useState("");

  const [cartCount, setCartCount] =
    useState(0);

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false);

  const token =
    localStorage.getItem(
      "vb_token"
    );

  const username =
    localStorage.getItem(
      "vb_username"
    );

  const role =
    localStorage.getItem(
      "vb_role"
    );

  // ================================
  // LOAD CART COUNT
  // ================================
  const loadCartCount =
    async () => {
      const currentToken =
        localStorage.getItem(
          "vb_token"
        );

      const currentRole =
        localStorage.getItem(
          "vb_role"
        );

      if (
        !currentToken ||
        currentRole !==
        "CUSTOMER"
      ) {
        setCartCount(0);
        return;
      }

      try {
        const response =
          await axiosClient.get(
            "/api/cart"
          );

        const items =
          response.data?.items ||
          [];

        const count =
          items.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity ||
                0
              ),
            0
          );

        setCartCount(count);
      } catch (error) {
        console.error(
          "LOAD CART COUNT THAT BAI:",
          error
        );

        setCartCount(0);
      }
    };

  // ================================
  // LOAD KHI DOI TRANG
  // ================================
  useEffect(() => {
    loadCartCount();

    // Doi trang thi dong dropdown
    setUserMenuOpen(false);
  }, [
    location.pathname,
    location.search,
  ]);

  // ================================
  // LANG NGHE CART UPDATED
  // ================================
  useEffect(() => {
    const handleCartUpdated =
      () => {
        loadCartCount();
      };

    window.addEventListener(
      "cart-updated",
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdated
      );
    };
  }, []);

  // ================================
  // BAM RA NGOAI -> DONG MENU
  // ================================
  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {
          setUserMenuOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ================================
  // LOGOUT
  // ================================
  const logout = () => {
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

    sessionStorage.removeItem(
      "vb_buy_now"
    );

    sessionStorage.removeItem(
      "vb_checkout_cart_items"
    );

    setCartCount(0);

    setUserMenuOpen(false);

    navigate("/login");
  };

  // ================================
  // SEARCH
  // ================================
  const handleSearch = (
    e
  ) => {
    e.preventDefault();

    const value =
      keyword.trim();

    if (value) {
      navigate(
        `/products?keyword=${encodeURIComponent(
          value
        )}`
      );
    } else {
      navigate("/products");
    }
  };

  // ================================
  // PROFILE
  // ================================
  const handleProfile = () => {
    setUserMenuOpen(false);

    navigate("/customer");
  };

  // ================================
  // CHANGE PASSWORD
  // ================================
  const handleChangePassword =
    () => {
      setUserMenuOpen(false);

      navigate(
        "/customer?tab=password"
      );
    };

  const navClass = ({
    isActive,
  }) =>
    isActive
      ? "shop-nav-link active"
      : "shop-nav-link";

  return (
    <header className="shop-header">
      <div className="shop-navbar">
        {/* =====================
            LOGO
        ===================== */}
        <Link
          to="/"
          className="shop-logo"
        >
          <span className="shop-logo-ball">
            ⚽
          </span>

          <div>
            <strong>
              VuaBongDa
            </strong>

            <small>
              Football Store
            </small>
          </div>
        </Link>

        {/* =====================
            MAIN NAV
        ===================== */}
        <nav className="shop-nav">
          <NavLink
            to="/"
            end
            className={
              navClass
            }
          >
            Trang chủ
          </NavLink>

          <Link
            to="/products?category=GIAY"
            className="shop-nav-link"
          >
            Giày
          </Link>

          <Link
            to="/products?category=QUAN_AO"
            className="shop-nav-link"
          >
            Quần áo
          </Link>

          <Link
            to="/products?category=BONG"
            className="shop-nav-link"
          >
            Bóng
          </Link>

          <Link
            to="/products?category=PHU_KIEN"
            className="shop-nav-link"
          >
            Phụ kiện
          </Link>
        </nav>

        {/* =====================
            SEARCH
        ===================== */}
        <form
          className="shop-search"
          onSubmit={
            handleSearch
          }
        >
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={keyword}
            onChange={(e) =>
              setKeyword(
                e.target.value
              )
            }
          />

          <button type="submit">
            Tìm
          </button>
        </form>

        {/* =====================
            ACTIONS
        ===================== */}
        <div className="shop-actions">
          {/* GUEST */}
          {!token && (
            <>
              <Link
                to="/login"
                className="header-text-link"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="header-primary-link"
              >
                Đăng ký
              </Link>
            </>
          )}

          {/* =====================
              CUSTOMER
          ===================== */}
          {token &&
            role ===
            "CUSTOMER" && (
              <>
                {/* CART */}
                <Link
                  to="/cart"
                  className="header-text-link cart-nav-link"
                >
                  Giỏ hàng

                  {cartCount >
                    0 && (
                      <span className="cart-badge">
                        {cartCount >
                          99
                          ? "99+"
                          : cartCount}
                      </span>
                    )}
                </Link>

                {/* ORDERS */}
                <Link
                  to="/orders"
                  className="header-text-link"
                >
                  Đơn hàng
                </Link>

                {/* USER DROPDOWN */}
                <div
                  className="header-user-dropdown"
                  ref={
                    dropdownRef
                  }
                >
                  <button
                    type="button"
                    className="header-user-trigger"
                    onClick={() =>
                      setUserMenuOpen(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                  >
                    <div className="header-user-avatar">
                      {username
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}
                    </div>

                    <div className="header-user-trigger-info">
                      <strong>
                        {username}
                      </strong>

                      <small>
                        Khách hàng
                      </small>
                    </div>

                    <span
                      className={`header-user-arrow ${userMenuOpen
                          ? "open"
                          : ""
                        }`}
                    >
                      ▼
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="header-user-menu">
                      <div className="header-user-menu-head">
                        <strong>
                          {username}
                        </strong>

                        <span>
                          Tài khoản khách hàng
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleProfile
                        }
                      >
                        <span className="header-dropdown-icon">
                          👤
                        </span>

                        <div>
                          <strong>
                            Thông tin tài khoản
                          </strong>

                          <small>
                            Xem và chỉnh sửa hồ sơ
                          </small>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleChangePassword
                        }
                      >
                        <span className="header-dropdown-icon">
                          🔒
                        </span>

                        <div>
                          <strong>
                            Đổi mật khẩu
                          </strong>

                          <small>
                            Cập nhật mật khẩu đăng nhập
                          </small>
                        </div>
                      </button>

                      <div className="header-user-menu-divider" />

                      <button
                        type="button"
                        className="header-dropdown-logout"
                        onClick={
                          logout
                        }
                      >
                        <span className="header-dropdown-icon">
                          ↪
                        </span>

                        <div>
                          <strong>
                            Đăng xuất
                          </strong>

                          <small>
                            Thoát khỏi tài khoản
                          </small>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

          {/* =====================
              ADMIN
          ===================== */}
          {token &&
            role ===
            "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className="admin-header-link"
                >
                  Quản trị
                </Link>

                <div className="header-user">
                  <strong>
                    {username}
                  </strong>

                  <small>
                    Quản trị viên
                  </small>
                </div>

                <button
                  type="button"
                  className="header-logout"
                  onClick={
                    logout
                  }
                >
                  Đăng xuất
                </button>
              </>
            )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;