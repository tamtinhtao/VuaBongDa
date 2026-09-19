import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axiosClient from "../api/axiosClient";

function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] =
    useState(null);

  const [payment, setPayment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ================================
  // LOAD ORDER + PAYMENT
  // ================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const orderResponse =
          await axiosClient.get(
            `/api/orders/${orderId}`
          );

        setOrder(
          orderResponse.data
        );

        const paymentResponse =
          await axiosClient.get(
            `/api/payments/order/${orderId}`
          );

        setPayment(
          paymentResponse.data
        );

      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
          "Không thể tải đơn hàng"
        );

      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (price) => {
    return (
      Number(price || 0).toLocaleString(
        "vi-VN"
      ) + " đ"
    );
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

  // ================================
  // PAYMENT METHOD
  // ================================
  const getPaymentMethodLabel = (
    method
  ) => {
    switch (method) {
      case "COD":
        return "Thanh toán khi nhận hàng (COD)";

      case "BANK_TRANSFER":
        return "Chuyển khoản ngân hàng";

      default:
        return method || "Chưa xác định";
    }
  };

  // ================================
  // PAYMENT STATUS
  // ================================
  const getPaymentStatusLabel = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";

      case "PAID":
        return "Đã thanh toán";

      case "FAILED":
        return "Thanh toán thất bại";

      case "CANCELLED":
        return "Đã hủy";

      default:
        return status || "Chưa xác định";
    }
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <p>
        Đang tải đơn hàng...
      </p>
    );
  }

  // ================================
  // ERROR
  // ================================
  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/orders")
          }
        >
          Quay lại đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>
        Chi tiết đơn #{order?.id}
      </h1>

      <button
        type="button"
        onClick={() =>
          navigate("/orders")
        }
      >
        Quay lại
      </button>

      <hr />

      {/* ORDER INFO */}
      <h2>Thông tin đơn hàng</h2>

      <p>
        Trạng thái:{" "}
        <strong>
          {getOrderStatusLabel(
            order?.status
          )}
        </strong>
      </p>

      <p>
        Người nhận:{" "}
        <strong>
          {order?.recipientName}
        </strong>
      </p>

      <p>
        Số điện thoại:{" "}
        {order?.phone}
      </p>

      <p>
        Địa chỉ:{" "}
        {order?.shippingAddress}
      </p>

      <hr />

      {/* PRODUCTS */}
      <h2>Sản phẩm</h2>

      {order?.items?.map(
        (item) => (
          <div key={item.id}>
            <h3>
              {item.productName}
            </h3>

            {/* SIZE */}
            {item.size && (
              <p>
                Size:{" "}
                <strong>
                  {item.size}
                </strong>
              </p>
            )}

            <p>
              Giá:{" "}
              {formatPrice(
                item.unitPrice
              )}
            </p>

            <p>
              Số lượng:{" "}
              {item.quantity}
            </p>

            <p>
              Thành tiền:{" "}
              <strong>
                {formatPrice(
                  item.subtotal
                )}
              </strong>
            </p>

            <hr />
          </div>
        )
      )}

      {/* TOTAL */}
      <h2>
        Tổng tiền:{" "}
        {formatPrice(
          order?.totalAmount
        )}
      </h2>

      <hr />

      {/* PAYMENT */}
      <h2>Thanh toán</h2>

      <p>
        Phương thức:{" "}
        <strong>
          {getPaymentMethodLabel(
            payment?.paymentMethod
          )}
        </strong>
      </p>

      <p>
        Trạng thái:{" "}
        <strong>
          {getPaymentStatusLabel(
            payment?.status
          )}
        </strong>
      </p>

      <p>
        Số tiền:{" "}
        <strong>
          {formatPrice(
            payment?.amount
          )}
        </strong>
      </p>
    </div>
  );
}

export default OrderDetailPage;