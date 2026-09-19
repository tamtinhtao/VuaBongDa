import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axiosClient from "../api/axiosClient";

function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkoutMode =
    searchParams.get("mode") || "cart";

  const [checkoutItems, setCheckoutItems] =
    useState([]);

  const [buyNowData, setBuyNowData] =
    useState(null);

  const [recipientName, setRecipientName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [
    shippingAddress,
    setShippingAddress,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("COD");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

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
  // LOAD CHECKOUT
  // ================================
  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setLoading(true);
        setMessage("");

        // ================================
        // BUY NOW MODE
        // ================================
        if (checkoutMode === "buy-now") {
          const rawData =
            sessionStorage.getItem(
              "vb_buy_now"
            );

          if (!rawData) {
            setMessage(
              "Không tìm thấy sản phẩm mua ngay."
            );
            return;
          }

          const data =
            JSON.parse(rawData);

          if (
            !data.productId ||
            !data.quantity
          ) {
            setMessage(
              "Thông tin mua ngay không hợp lệ."
            );
            return;
          }

          const response =
            await axiosClient.get(
              `/api/products/${data.productId}`
            );

          const product =
            response.data;

          const item = {
            productId: product.id,
            productName:
              product.name,
            imageUrl:
              product.imageUrl,
            size: data.size || null,
            quantity:
              Number(data.quantity),
            price:
              Number(product.price),
            subtotal:
              Number(product.price) *
              Number(data.quantity),
          };

          setBuyNowData({
            productId: product.id,
            quantity:
              Number(data.quantity),
            size: data.size || null,
          });

          setCheckoutItems([
            item,
          ]);

          return;
        }

        // ================================
        // CART MODE
        // ================================
        const rawIds =
          sessionStorage.getItem(
            "vb_checkout_cart_items"
          );

        if (!rawIds) {
          setMessage(
            "Vui lòng quay lại giỏ hàng và chọn sản phẩm cần thanh toán."
          );
          return;
        }

        const selectedIds =
          JSON.parse(rawIds);

        if (
          !Array.isArray(selectedIds) ||
          selectedIds.length === 0
        ) {
          setMessage(
            "Bạn chưa chọn sản phẩm để thanh toán."
          );
          return;
        }

        const response =
          await axiosClient.get(
            "/api/cart"
          );

        const cartItems =
          response.data.items || [];

        const selectedItems =
          cartItems.filter((item) =>
            selectedIds.includes(
              item.id
            )
          );

        if (
          selectedItems.length === 0
        ) {
          setMessage(
            "Không tìm thấy sản phẩm đã chọn trong giỏ hàng."
          );
          return;
        }

        setCheckoutItems(
          selectedItems
        );
      } catch (error) {
        console.error(
          "LOAD CHECKOUT THAT BAI:",
          error
        );

        setMessage(
          error.response?.data
            ?.message ||
          "Không thể tải thông tin thanh toán."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [checkoutMode]);

  // ================================
  // TOTAL
  // ================================
  const totalAmount = useMemo(
    () =>
      checkoutItems.reduce(
        (total, item) =>
          total +
          Number(
            item.subtotal || 0
          ),
        0
      ),
    [checkoutItems]
  );

  // ================================
  // CHECKOUT
  // ================================
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (
      checkoutItems.length === 0
    ) {
      setMessage(
        "Không có sản phẩm để thanh toán."
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      // ================================
      // REQUEST CHUNG
      // ================================
      const requestData = {
        recipientName,
        phone,
        shippingAddress,
        paymentMethod,
      };

      // ================================
      // BUY NOW
      // ================================
      if (
        checkoutMode === "buy-now"
      ) {
        if (!buyNowData) {
          setMessage(
            "Thông tin mua ngay không hợp lệ."
          );
          return;
        }

        requestData.mode =
          "BUY_NOW";

        requestData.productId =
          buyNowData.productId;

        requestData.quantity =
          buyNowData.quantity;

        requestData.size =
          buyNowData.size;
      } else {
        // ================================
        // CART
        // ================================
        const rawIds =
          sessionStorage.getItem(
            "vb_checkout_cart_items"
          );

        const selectedIds =
          rawIds
            ? JSON.parse(rawIds)
            : [];

        if (
          selectedIds.length === 0
        ) {
          setMessage(
            "Bạn chưa chọn sản phẩm để thanh toán."
          );
          return;
        }

        requestData.mode =
          "CART";

        requestData.cartItemIds =
          selectedIds;
      }

      const response =
        await axiosClient.post(
          "/api/orders",
          requestData
        );

      const orderId =
        response.data.id;

      // ================================
      // CLEAR TEMP DATA
      // ================================
      if (
        checkoutMode === "buy-now"
      ) {
        sessionStorage.removeItem(
          "vb_buy_now"
        );
      } else {
        sessionStorage.removeItem(
          "vb_checkout_cart_items"
        );

        // Sau khi dat hang tu cart
        // Navbar se cap nhat badge
        window.dispatchEvent(
          new Event(
            "cart-updated"
          )
        );
      }

      navigate(
        `/order-success/${orderId}`
      );
    } catch (error) {
      console.error(
        "DAT HANG THAT BAI:",
        error
      );

      setMessage(
        error.response?.data
          ?.message ||
        "Đặt hàng thất bại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <p>
        Đang tải trang thanh toán...
      </p>
    );
  }

  return (
    <div>
      <h1>Thanh toán</h1>

      <button
        type="button"
        onClick={() => {
          if (
            checkoutMode ===
            "buy-now"
          ) {
            navigate(-1);
          } else {
            navigate("/cart");
          }
        }}
      >
        Quay lại
      </button>

      <hr />

      {message && (
        <p
          style={{
            color: "red",
          }}
        >
          {message}
        </p>
      )}

      {checkoutItems.length >
        0 && (
          <>
            <h2>
              Đơn hàng
            </h2>

            {checkoutItems.map(
              (item, index) => (
                <div
                  key={
                    item.id ||
                    `${item.productId}-${item.size}-${index}`
                  }
                >
                  <p>
                    <strong>
                      {
                        item.productName
                      }
                    </strong>

                    {" x "}

                    {
                      item.quantity
                    }
                  </p>

                  {item.size && (
                    <p>
                      Size:{" "}
                      <strong>
                        {
                          item.size
                        }
                      </strong>
                    </p>
                  )}

                  <p>
                    Giá:{" "}
                    {formatPrice(
                      item.price
                    )}
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

            <h3>
              Tổng thanh toán:{" "}
              {formatPrice(
                totalAmount
              )}
            </h3>

            <hr />

            <form
              onSubmit={
                handleCheckout
              }
            >
              {/* RECIPIENT */}
              <div>
                <label>
                  Tên người nhận
                </label>

                <br />

                <input
                  type="text"
                  value={
                    recipientName
                  }
                  onChange={(e) =>
                    setRecipientName(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <br />

              {/* PHONE */}
              <div>
                <label>
                  Số điện thoại
                </label>

                <br />

                <input
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <br />

              {/* ADDRESS */}
              <div>
                <label>
                  Địa chỉ giao hàng
                </label>

                <br />

                <textarea
                  value={
                    shippingAddress
                  }
                  onChange={(e) =>
                    setShippingAddress(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <br />

              {/* PAYMENT */}
              <div>
                <label>
                  Phương thức thanh toán
                </label>

                <br />

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                >
                  <option value="COD">
                    Thanh toán khi
                    nhận hàng (COD)
                  </option>

                  <option value="BANK_TRANSFER">
                    Chuyển khoản
                    ngân hàng
                  </option>
                </select>
              </div>

              <br />

              <button
                type="submit"
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Đang đặt hàng..."
                  : "Đặt hàng"}
              </button>
            </form>
          </>
        )}
    </div>
  );
}

export default CheckoutPage;