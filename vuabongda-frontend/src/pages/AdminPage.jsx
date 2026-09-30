import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function AdminPage() {
  const [stats, setStats] = useState({
    orders: null,
    products: null,
    categories: null,
    promotions: null,
  });

  const [recentOrders, setRecentOrders] =
    useState([]);

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + " đ";

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString("vi-VN");
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      SHIPPING: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };

    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const value =
      String(status || "").toLowerCase();

    return `vb-admin-status ${value}`;
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const [
        ordersResult,
        productsResult,
        categoriesResult,
        promotionsResult,
      ] = await Promise.allSettled([
        axiosClient.get("/api/admin/orders"),

        axiosClient.get("/api/products", {
          params: {
            page: 0,
            size: 1,
            sortBy: "id",
            direction: "desc",
          },
        }),

        axiosClient.get("/api/categories"),

        axiosClient.get("/api/admin/promotions"),
      ]);

      let orderCount = null;
      let productCount = null;
      let categoryCount = null;
      let promotionCount = null;

      if (ordersResult.status === "fulfilled") {
        const orders =
          Array.isArray(ordersResult.value.data)
            ? ordersResult.value.data
            : [];

        orderCount = orders.length;

        setRecentOrders(
          [...orders]
            .sort(
              (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
            )
            .slice(0, 5)
        );
      }

      if (productsResult.status === "fulfilled") {
        const data =
          productsResult.value.data;

        productCount =
          data.totalElements ??
          data.content?.length ??
          0;
      }

      if (categoriesResult.status === "fulfilled") {
        categoryCount =
          Array.isArray(categoriesResult.value.data)
            ? categoriesResult.value.data.length
            : 0;
      }

      if (promotionsResult.status === "fulfilled") {
        promotionCount =
          Array.isArray(promotionsResult.value.data)
            ? promotionsResult.value.data.length
            : 0;
      }

      setStats({
        orders: orderCount,
        products: productCount,
        categories: categoryCount,
        promotions: promotionCount,
      });
    };

    loadDashboard();
  }, []);

  const showValue = (value) =>
    value === null ? "—" : value;

  return (
    <div>
      <div className="vb-admin-page-heading">
        <h2>Dashboard</h2>
        <p>
          Tổng quan hoạt động của VuaBongDa Store
        </p>
      </div>

      {/* THONG KE */}
      <section className="vb-admin-stats">
        <div className="vb-admin-stat vb-admin-blue">
          <div className="vb-admin-stat-content">
            <h3>
              {showValue(stats.orders)}
            </h3>
            <p>Đơn hàng</p>
          </div>

          <div className="vb-admin-stat-icon">
            ▤
          </div>

          <Link
            to="/admin/orders"
            className="vb-admin-stat-link"
          >
            Xem chi tiết →
          </Link>
        </div>

        <div className="vb-admin-stat vb-admin-green">
          <div className="vb-admin-stat-content">
            <h3>
              {showValue(stats.products)}
            </h3>
            <p>Sản phẩm</p>
          </div>

          <div className="vb-admin-stat-icon">
            ◫
          </div>

          <Link
            to="/admin/products"
            className="vb-admin-stat-link"
          >
            Xem chi tiết →
          </Link>
        </div>

        <div className="vb-admin-stat vb-admin-orange">
          <div className="vb-admin-stat-content">
            <h3>
              {showValue(stats.categories)}
            </h3>
            <p>Danh mục</p>
          </div>

          <div className="vb-admin-stat-icon">
            ≡
          </div>

          <Link
            to="/admin/categories"
            className="vb-admin-stat-link"
          >
            Xem chi tiết →
          </Link>
        </div>

        <div className="vb-admin-stat vb-admin-red">
          <div className="vb-admin-stat-content">
            <h3>
              {showValue(stats.promotions)}
            </h3>
            <p>Khuyến mãi</p>
          </div>

          <div className="vb-admin-stat-icon">
            %
          </div>

          <Link
            to="/admin/promotions"
            className="vb-admin-stat-link"
          >
            Xem chi tiết →
          </Link>
        </div>
      </section>

      {/* NOI DUNG */}
      <section className="vb-admin-dashboard-grid">
        <div className="vb-admin-panel">
          <div className="vb-admin-panel-heading">
            <h3>
              ĐƠN ĐẶT HÀNG MỚI
            </h3>

            <Link
              to="/admin/orders"
              className="vb-admin-detail-btn"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="vb-admin-panel-body">
            {recentOrders.length === 0 ? (
              <div className="vb-admin-empty">
                Chưa có dữ liệu đơn hàng.
              </div>
            ) : (
              <table className="vb-admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        #{order.id}
                      </td>

                      <td>
                        {order.recipientName}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            order.status
                          )}
                        >
                          {getStatusLabel(
                            order.status
                          )}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      <td>
                        {formatPrice(
                          order.totalAmount
                        )}
                      </td>

                      <td>
                        <Link
                          to="/admin/orders"
                          className="vb-admin-detail-btn"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="vb-admin-panel orange">
          <div className="vb-admin-panel-heading">
            <h3>
              THÔNG TIN HỆ THỐNG
            </h3>
          </div>

          <div className="vb-admin-panel-body">
            <table className="vb-admin-table">
              <tbody>
                <tr>
                  <td>
                    Sản phẩm
                  </td>

                  <td>
                    <strong>
                      {showValue(
                        stats.products
                      )}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td>
                    Danh mục
                  </td>

                  <td>
                    <strong>
                      {showValue(
                        stats.categories
                      )}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td>
                    Đơn hàng
                  </td>

                  <td>
                    <strong>
                      {showValue(
                        stats.orders
                      )}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td>
                    Khuyến mãi
                  </td>

                  <td>
                    <strong>
                      {showValue(
                        stats.promotions
                      )}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;