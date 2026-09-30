import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosClient from "../api/axiosClient";

function OrdersPage() {
  const navigate =
    useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    cancellingOrderId,
    setCancellingOrderId,
  ] = useState(null);

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "vi-VN"
    ) + " đ";

  // ================================
  // FORMAT DATE
  // ================================
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

  // ================================
  // STATUS LABEL
  // ================================
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

  // ================================
  // STATUS CLASS
  // ================================
  const getStatusClass = (
    status
  ) => {
    return `order-list-status status-${String(
      status || ""
    ).toLowerCase()}`;
  };

  // ================================
  // LOAD ORDERS
  // ================================
  const loadOrders =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosClient.get(
            "/api/orders"
          );

        setOrders(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (err) {
        console.error(
          "LOAD ORDERS THAT BAI:",
          err
        );

        setOrders([]);

        setError(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          "Không thể tải danh sách đơn hàng."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadOrders();
  }, []);

  // ================================
  // CUSTOMER CANCEL ORDER
  // ================================
  const handleCancelOrder =
    async (order) => {
      if (
        order.status !==
        "PENDING"
      ) {
        setError(
          "Chỉ có thể hủy đơn hàng đang chờ xác nhận."
        );

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
        setCancellingOrderId(
          order.id
        );

        setMessage("");
        setError("");

        const response =
          await axiosClient.put(
            `/api/orders/${order.id}/cancel`
          );

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (item) =>
                item.id ===
                  order.id
                  ? response.data
                  : item
            )
        );

        setMessage(
          `Đã hủy đơn hàng #${order.id} thành công.`
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
        setCancellingOrderId(
          null
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

  return (
    <main className="orders-page">
      <div className="orders-container">

        {/* HEADER */}
        <div className="orders-header">
          <div>
            <p className="order-eyebrow">
              VUABONGDA STORE
            </p>

            <h1>
              Đơn hàng của tôi
            </h1>

            <p>
              Theo dõi và xem lại các
              đơn hàng đã đặt.
            </p>
          </div>

          <Link
            to="/products"
            className="orders-shopping-link"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* SUCCESS */}
        {message && (
          <div className="order-success-message">
            {message}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error &&
          orders.length ===
          0 ? (
          <section className="orders-empty">
            <h2>
              Bạn chưa có đơn hàng
            </h2>

            <p>
              Hãy chọn sản phẩm bạn yêu
              thích và bắt đầu mua sắm.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/products"
                )
              }
            >
              Xem sản phẩm
            </button>
          </section>
        ) : (
          <section className="orders-list">
            {orders.map(
              (order) => {
                const items =
                  order.items ||
                  [];

                const totalQuantity =
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
                  <article
                    key={
                      order.id
                    }
                    className="order-list-card"
                  >
                    {/* TOP */}
                    <div className="order-list-top">
                      <div>
                        <strong>
                          Đơn hàng #
                          {order.id}
                        </strong>

                        <span>
                          {formatDate(
                            order.createdAt
                          )}
                        </span>
                      </div>

                      <span
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        {getStatusLabel(
                          order.status
                        )}
                      </span>
                    </div>

                    {/* BODY */}
                    <div className="order-list-body">

                      {/* PRODUCTS */}
                      <div className="order-list-products">
                        {items
                          .slice(
                            0,
                            2
                          )
                          .map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                              >
                                <strong>
                                  {
                                    item.productName
                                  }
                                </strong>

                                <span>
                                  {item.size
                                    ? `Size ${item.size} · `
                                    : ""}

                                  SL{" "}
                                  {
                                    item.quantity
                                  }
                                </span>
                              </div>
                            )
                          )}

                        {items.length >
                          2 && (
                            <p>
                              Và{" "}
                              {items.length -
                                2}{" "}
                              sản phẩm khác
                            </p>
                          )}
                      </div>

                      {/* SUMMARY */}
                      <div className="order-list-summary">
                        <span>
                          {
                            totalQuantity
                          }{" "}
                          sản phẩm
                        </span>

                        {discountAmount >
                          0 && (
                            <>
                              <small>
                                Tạm tính{" "}
                                {formatPrice(
                                  originalAmount
                                )}
                              </small>

                              <small className="order-discount">
                                Giảm{" "}
                                {formatPrice(
                                  discountAmount
                                )}
                              </small>

                              {order.promotionCode && (
                                <small>
                                  Mã:{" "}
                                  <strong>
                                    {
                                      order.promotionCode
                                    }
                                  </strong>
                                </small>
                              )}
                            </>
                          )}

                        <strong className="order-list-total">
                          {formatPrice(
                            order.totalAmount
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="order-list-footer">

                      {canCancel && (
                        <button
                          type="button"
                          className="order-cancel-button"
                          disabled={
                            cancellingOrderId ===
                            order.id
                          }
                          onClick={() =>
                            handleCancelOrder(
                              order
                            )
                          }
                        >
                          {cancellingOrderId ===
                            order.id
                            ? "Đang hủy..."
                            : "Hủy đơn hàng"}
                        </button>
                      )}

                      <Link
                        to={`/orders/${order.id}`}
                        className="order-detail-link"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default OrdersPage;