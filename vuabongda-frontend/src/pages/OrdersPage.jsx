import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ================================
  // LOAD ORDERS
  // ================================
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response =
          await axiosClient.get(
            "/api/orders"
          );

        setOrders(response.data);
        setError("");

        console.log(
          "GET ORDERS THANH CONG:",
          response.data
        );
      } catch (err) {
        console.error(
          "GET ORDERS THAT BAI:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Không thể tải đơn hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (price) => {
    return (
      Number(price || 0)
        .toLocaleString("vi-VN") +
      " đ"
    );
  };

  // ================================
  // FORMAT DATE
  // ================================
  const formatDate = (date) => {
    if (!date) {
      return "Chưa xác định";
    }

    return new Date(date)
      .toLocaleString("vi-VN");
  };

  // ================================
  // ORDER STATUS
  // ================================
  const getOrderStatusLabel = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";

      case "CONFIRMED":
        return "Đã xác nhận";

      case "SHIPPING":
        return "Đang giao hàng";

      case "COMPLETED":
        return "Đã hoàn thành";

      case "CANCELLED":
        return "Đã hủy";

      default:
        return status || "Chưa xác định";
    }
  };

  if (loading) {
    return (
      <p>
        Đang tải đơn hàng...
      </p>
    );
  }

  return (
    <div>
      <h1>Đơn hàng của tôi</h1>

      <button
        type="button"
        onClick={() =>
          navigate("/")
        }
      >
        Tiếp tục mua sắm
      </button>

      <br />
      <br />

      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div>
          <p>
            Bạn chưa có đơn hàng nào.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Xem sản phẩm
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border:
                "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h2>
              Đơn hàng #{order.id}
            </h2>

            <p>
              Trạng thái:{" "}
              <strong>
                {getOrderStatusLabel(
                  order.status
                )}
              </strong>
            </p>

            <p>
              Người nhận:{" "}
              {order.recipientName}
            </p>

            <p>
              Tổng tiền:{" "}
              <strong>
                {formatPrice(
                  order.totalAmount
                )}
              </strong>
            </p>

            <p>
              Ngày đặt:{" "}
              {formatDate(
                order.createdAt
              )}
            </p>

            <p>
              Số sản phẩm:{" "}
              {order.items?.reduce(
                (total, item) =>
                  total +
                  item.quantity,
                0
              ) || 0}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/orders/${order.id}`
                )
              }
            >
              Xem chi tiết
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default OrdersPage;