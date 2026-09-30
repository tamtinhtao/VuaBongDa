import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosClient from "../api/axiosClient";

function OrderDetailPage() {
  const params =
    useParams();

  const orderId =
    params.orderId ||
    params.id;

  const navigate =
    useNavigate();

  const [order, setOrder] =
    useState(null);

  const [payment, setPayment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const formatPrice = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "vi-VN"
    ) + " đ";

  const formatDate = (
    value
  ) => {
    if (!value) return "";

    return new Date(
      value
    ).toLocaleString(
      "vi-VN"
    );
  };

  const getStatusLabel = (
    status
  ) => {
    const labels = {
      PENDING:
        "Chờ xác nhận",

      CONFIRMED:
        "Đã xác nhận",

      SHIPPING:
        "Đang giao hàng",

      COMPLETED:
        "Hoàn thành",

      CANCELLED:
        "Đã hủy",
    };

    return (
      labels[status] ||
      status
    );
  };

  const getPaymentMethodLabel = (
    method
  ) => {
    if (method === "COD") {
      return "Thanh toán khi nhận hàng (COD)";
    }

    if (
      method ===
      "BANK_TRANSFER"
    ) {
      return "Chuyển khoản ngân hàng";
    }

    return (
      method ||
      "Chưa cập nhật"
    );
  };

  const getPaymentStatusLabel = (
    status
  ) => {
    const labels = {
      PENDING:
        "Chờ thanh toán",

      PAID:
        "Đã thanh toán",

      FAILED:
        "Thanh toán thất bại",

      CANCELLED:
        "Đã hủy",
    };

    return (
      labels[status] ||
      status ||
      "Chưa cập nhật"
    );
  };

  // ================================
  // LOAD ORDER
  // ================================
  const loadOrder =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosClient.get(
            `/api/orders/${orderId}`
          );

        setOrder(
          response.data
        );

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
          "LOAD ORDER DETAIL THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể tải chi tiết đơn hàng."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // ================================
  // CANCEL ORDER
  // ================================
  const handleCancelOrder =
    async () => {
      if (
        !order ||
        order.status !==
        "PENDING"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Bạn có chắc muốn hủy đơn hàng #${order.id}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancelling(true);
        setMessage("");
        setError("");

        const response =
          await axiosClient.put(
            `/api/orders/${order.id}/cancel`
          );

        setOrder(
          response.data
        );

        setMessage(
          "Đơn hàng đã được hủy thành công."
        );
      } catch (err) {
        console.error(
          "CANCEL ORDER THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          "Không thể hủy đơn hàng."
        );
      } finally {
        setCancelling(
          false
        );
      }
    };

  if (loading) {
    return (
      <div className="order-page-message">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="order-page-message">
        {error}
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
      order.discountAmount ||
      0
    );

  const canCancel =
    order.status ===
    "PENDING";

  return (
    <main className="order-view-page">
      <div className="order-view-container">

        <div className="order-detail-header">
          <div>
            <p className="order-eyebrow">
              VUABONGDA STORE
            </p>

            <h1>
              Chi tiết đơn hàng
            </h1>

            <p>
              Đơn hàng #{order.id}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/orders"
              )
            }
            className="order-back-button"
          >
            ← Quay lại đơn hàng
          </button>
        </div>

        {message && (
          <div className="order-success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        <div className="order-view-layout">
          <section className="order-view-main">

            {/* ORDER */}
            <div className="order-info-box">
              <div className="order-box-heading">
                <h2>
                  Thông tin đơn hàng
                </h2>

                <span
                  className={`order-list-status status-${String(
                    order.status ||
                    ""
                  ).toLowerCase()}`}
                >
                  {getStatusLabel(
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

              {(order.items ||
                []).map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="order-product-row"
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
                            {
                              item.size
                            }
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

            {/* RECIPIENT */}
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
                    {
                      order.phone
                    }
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
            <div className="order-info-box">
              <h2>
                Thanh toán
              </h2>

              {payment ? (
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
                      {order.status ===
                        "CANCELLED"
                        ? "Đã hủy"
                        : getPaymentStatusLabel(
                          payment.status
                        )}
                    </strong>
                  </div>

                  {payment.amount !=
                    null && (
                      <div>
                        <span>
                          Số tiền
                        </span>

                        <strong>
                          {formatPrice(
                            payment.amount
                          )}
                        </strong>
                      </div>
                    )}
                </div>
              ) : (
                <p className="order-muted">
                  Chưa có thông tin thanh toán.
                </p>
              )}
            </div>
          </section>

          {/* SUMMARY */}
          <aside className="order-total-box">
            <h2>
              Tổng đơn hàng
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
                  discountAmount >
                    0
                    ? "order-discount"
                    : ""
                }
              >
                {discountAmount >
                  0
                  ? `- ${formatPrice(
                    discountAmount
                  )}`
                  : "0 đ"}
              </strong>
            </div>

            {order.promotionCode && (
              <div className="order-promotion-used">
                Mã đã áp dụng:
                <strong>
                  {
                    order.promotionCode
                  }
                </strong>
              </div>
            )}

            <div className="order-final-total">
              <span>
                Tổng thanh toán
              </span>

              <strong>
                {formatPrice(
                  order.totalAmount
                )}
              </strong>
            </div>

            {canCancel && (
              <button
                type="button"
                className="order-cancel-detail-button"
                disabled={
                  cancelling
                }
                onClick={
                  handleCancelOrder
                }
              >
                {cancelling
                  ? "Đang hủy..."
                  : "Hủy đơn hàng"}
              </button>
            )}

            {order.status ===
              "CANCELLED" && (
                <div className="order-cancelled-note">
                  Đơn hàng này đã được
                  hủy.
                </div>
              )}

            <Link
              to="/products"
              className="order-primary-action"
            >
              Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetailPage;