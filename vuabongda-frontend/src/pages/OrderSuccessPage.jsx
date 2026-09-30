import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import axiosClient from "../api/axiosClient";

function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState(null);

  const [payment, setPayment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (value) =>
    Number(value || 0).toLocaleString(
      "vi-VN"
    ) + " đ";

  // ================================
  // FORMAT DATE
  // ================================
  const formatDate = (value) => {
    if (!value) return "";

    return new Date(
      value
    ).toLocaleString("vi-VN");
  };

  // ================================
  // ORDER STATUS
  // ================================
  const getOrderStatusLabel = (
    status
  ) => {
    const labels = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      SHIPPING: "Đang giao hàng",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };

    return (
      labels[status] || status
    );
  };

  // ================================
  // PAYMENT METHOD
  // ================================
  const getPaymentMethodLabel = (
    method
  ) => {
    if (
      method === "COD"
    ) {
      return "Thanh toán khi nhận hàng (COD)";
    }

    if (
      method ===
      "BANK_TRANSFER"
    ) {
      return "Chuyển khoản ngân hàng";
    }

    return method || "Chưa cập nhật";
  };

  // ================================
  // PAYMENT STATUS
  // ================================
  const getPaymentStatusLabel = (
    status
  ) => {
    const labels = {
      PENDING: "Chờ thanh toán",
      PAID: "Đã thanh toán",
      FAILED: "Thanh toán thất bại",
      CANCELLED: "Đã hủy",
    };

    return (
      labels[status] ||
      status ||
      "Chưa cập nhật"
    );
  };

  // ================================
  // LOAD
  // ================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const orderResponse =
          await axiosClient.get(
            `/api/orders/${orderId}`
          );

        setOrder(
          orderResponse.data
        );

        /*
         * Payment loi thi van cho xem
         * Order Success.
         */
        try {
          const paymentResponse =
            await axiosClient.get(
              `/api/payments/order/${orderId}`
            );

          setPayment(
            paymentResponse.data
          );
        } catch (
        paymentError
        ) {
          console.error(
            "LOAD PAYMENT THAT BAI:",
            paymentError
          );

          setPayment(null);
        }
      } catch (err) {
        console.error(
          "LOAD ORDER THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể tải thông tin đơn hàng."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-page-message">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-page-message">
        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/orders")
          }
        >
          Xem đơn hàng
        </button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const originalAmount =
    Number(
      order.originalAmount ??
      order.totalAmount ??
      0
    );

  const discountAmount =
    Number(
      order.discountAmount || 0
    );

  return (
    <main className="order-view-page">
      <div className="order-view-container">

        {/* SUCCESS */}
        <section className="order-success-heading">
          <div className="order-success-icon">
            ✓
          </div>

          <p className="order-eyebrow">
            VUABONGDA STORE
          </p>

          <h1>
            Đặt hàng thành công
          </h1>

          <p>
            Cảm ơn bạn đã đặt hàng.
            Đơn hàng của bạn đã được
            hệ thống tiếp nhận.
          </p>
        </section>

        <div className="order-view-layout">

          {/* LEFT */}
          <section className="order-view-main">

            <div className="order-info-box">
              <div className="order-box-heading">
                <h2>
                  Đơn hàng #{order.id}
                </h2>

                <span className="order-status-badge">
                  {getOrderStatusLabel(
                    order.status
                  )}
                </span>
              </div>

              <p className="order-created-date">
                Ngày đặt:{" "}
                {formatDate(
                  order.createdAt
                )}
              </p>

              <div className="order-product-list">
                {(order.items || []).map(
                  (item) => (
                    <div
                      className="order-product-row"
                      key={item.id}
                    >
                      <div>
                        <strong>
                          {
                            item.productName
                          }
                        </strong>

                        {item.size && (
                          <p>
                            Size:{" "}
                            {item.size}
                          </p>
                        )}

                        <p>
                          Số lượng:{" "}
                          {
                            item.quantity
                          }
                        </p>

                        <p>
                          Đơn giá:{" "}
                          {formatPrice(
                            item.unitPrice
                          )}
                        </p>
                      </div>

                      <strong className="order-product-subtotal">
                        {formatPrice(
                          item.subtotal
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* SHIPPING */}
            <div className="order-info-box">
              <h2>
                Thông tin nhận hàng
              </h2>

              <div className="order-info-grid">
                <div>
                  <span>
                    Người nhận
                  </span>
                  <strong>
                    {
                      order.recipientName
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Số điện thoại
                  </span>
                  <strong>
                    {order.phone}
                  </strong>
                </div>

                <div className="order-info-full">
                  <span>
                    Địa chỉ
                  </span>
                  <strong>
                    {
                      order.shippingAddress
                    }
                  </strong>
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            {payment && (
              <div className="order-info-box">
                <h2>
                  Thanh toán
                </h2>

                <div className="order-info-grid">
                  <div>
                    <span>
                      Phương thức
                    </span>

                    <strong>
                      {getPaymentMethodLabel(
                        payment.paymentMethod ||
                        payment.method
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Trạng thái
                    </span>

                    <strong>
                      {getPaymentStatusLabel(
                        payment.status
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SUMMARY */}
          <aside className="order-total-box">
            <h2>
              Tổng thanh toán
            </h2>

            <div className="order-total-row">
              <span>
                Tạm tính
              </span>

              <strong>
                {formatPrice(
                  originalAmount
                )}
              </strong>
            </div>

            <div className="order-total-row">
              <span>
                Khuyến mãi
              </span>

              <strong
                className={
                  discountAmount > 0
                    ? "order-discount"
                    : ""
                }
              >
                {discountAmount > 0
                  ? `- ${formatPrice(
                    discountAmount
                  )}`
                  : "0 đ"}
              </strong>
            </div>

            {order.promotionCode && (
              <div className="order-promotion-used">
                Mã đã sử dụng:
                <strong>
                  {
                    order.promotionCode
                  }
                </strong>
              </div>
            )}

            <div className="order-final-total">
              <span>
                Tổng cộng
              </span>

              <strong>
                {formatPrice(
                  order.totalAmount
                )}
              </strong>
            </div>

            <Link
              to="/orders"
              className="order-primary-action"
            >
              Xem đơn hàng của tôi
            </Link>

            <Link
              to="/products"
              className="order-secondary-action"
            >
              Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccessPage;