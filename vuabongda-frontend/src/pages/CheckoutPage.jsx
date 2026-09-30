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

  // ================================
  // PROMOTION
  // ================================
  const [
    promotionCode,
    setPromotionCode,
  ] = useState("");

  const [
    appliedPromotion,
    setAppliedPromotion,
  ] = useState(null);

  const [
    applyingPromotion,
    setApplyingPromotion,
  ] = useState(false);

  const [
    promotionMessage,
    setPromotionMessage,
  ] = useState("");

  const [
    promotionError,
    setPromotionError,
  ] = useState("");

  // ================================
  // GENERAL
  // ================================
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
        // BUY NOW
        // ================================
        if (
          checkoutMode === "buy-now"
        ) {
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

          const quantity =
            Number(data.quantity);

          const item = {
            productId:
              product.id,

            productName:
              product.name,

            imageUrl:
              product.imageUrl,

            size:
              data.size || null,

            quantity,

            price:
              Number(product.price),

            subtotal:
              Number(product.price) *
              quantity,
          };

          setBuyNowData({
            productId:
              product.id,

            quantity,

            size:
              data.size || null,
          });

          setCheckoutItems([
            item,
          ]);

          return;
        }

        // ================================
        // CART
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
          !Array.isArray(
            selectedIds
          ) ||
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
          cartItems.filter(
            (item) =>
              selectedIds.includes(
                item.id
              )
          );

        if (
          selectedItems.length !==
          selectedIds.length
        ) {
          setMessage(
            "Một số sản phẩm đã chọn không còn trong giỏ hàng. Vui lòng quay lại giỏ hàng."
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
  // ORIGINAL AMOUNT
  // ================================
  const originalAmount =
    useMemo(
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
  // DISCOUNT
  // ================================
  const discountAmount =
    appliedPromotion
      ? Number(
        appliedPromotion
          .discountAmount || 0
      )
      : 0;

  // ================================
  // FINAL AMOUNT
  // ================================
  const finalAmount =
    appliedPromotion
      ? Number(
        appliedPromotion
          .finalAmount ||
        originalAmount
      )
      : originalAmount;

  // ================================
  // APPLY PROMOTION
  // ================================
  const handleApplyPromotion =
    async () => {
      const code =
        promotionCode
          .trim()
          .toUpperCase();

      if (!code) {
        setPromotionError(
          "Vui lòng nhập mã khuyến mãi."
        );

        setPromotionMessage("");
        setAppliedPromotion(null);

        return;
      }

      if (originalAmount <= 0) {
        setPromotionError(
          "Đơn hàng không hợp lệ."
        );

        return;
      }

      try {
        setApplyingPromotion(
          true
        );

        setPromotionError("");
        setPromotionMessage("");

        const response =
          await axiosClient.post(
            "/api/promotions/apply",
            {
              code,
              originalAmount,
            }
          );

        setAppliedPromotion(
          response.data
        );

        setPromotionCode(
          response.data.code
        );

        setPromotionMessage(
          `Áp dụng mã ${response.data.code} thành công.`
        );
      } catch (error) {
        console.error(
          "APPLY PROMOTION THAT BAI:",
          error
        );

        setAppliedPromotion(null);

        setPromotionMessage("");

        setPromotionError(
          error.response?.data
            ?.message ||
          error.response?.data
            ?.error ||
          "Mã khuyến mãi không hợp lệ hoặc không thể áp dụng."
        );
      } finally {
        setApplyingPromotion(
          false
        );
      }
    };

  // ================================
  // REMOVE PROMOTION
  // ================================
  const handleRemovePromotion =
    () => {
      setAppliedPromotion(null);

      setPromotionCode("");

      setPromotionMessage("");

      setPromotionError("");
    };

  // ================================
  // PROMOTION INPUT
  // ================================
  const handlePromotionCodeChange =
    (e) => {
      const value =
        e.target.value.toUpperCase();

      setPromotionCode(value);

      /*
       * Neu sua code sau khi da apply,
       * huy ket qua cu.
       */
      if (
        appliedPromotion &&
        value.trim() !==
        appliedPromotion.code
      ) {
        setAppliedPromotion(
          null
        );

        setPromotionMessage(
          ""
        );
      }

      setPromotionError("");
    };

  // ================================
  // SUBMIT ORDER
  // ================================
  const handleCheckout =
    async (e) => {
      e.preventDefault();

      if (
        checkoutItems.length ===
        0
      ) {
        setMessage(
          "Không có sản phẩm để thanh toán."
        );

        return;
      }

      try {
        setSubmitting(true);

        setMessage("");

        const requestData = {
          recipientName,
          phone,
          shippingAddress,
          paymentMethod,

          promotionCode:
            appliedPromotion
              ? appliedPromotion.code
              : null,
        };

        // ================================
        // BUY NOW
        // ================================
        if (
          checkoutMode ===
          "buy-now"
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
              ? JSON.parse(
                rawIds
              )
              : [];

          if (
            selectedIds.length ===
            0
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

        /*
         * Backend se tu:
         *
         * - tinh originalAmount
         * - validate promotion
         * - tinh discountAmount
         * - tinh totalAmount
         *
         * Frontend KHONG gui cac so tien nay.
         */
        const response =
          await axiosClient.post(
            "/api/orders",
            requestData
          );

        const orderId =
          response.data.id;

        // ================================
        // CLEAR TEMP
        // ================================
        if (
          checkoutMode ===
          "buy-now"
        ) {
          sessionStorage.removeItem(
            "vb_buy_now"
          );
        } else {
          sessionStorage.removeItem(
            "vb_checkout_cart_items"
          );

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
          error.response?.data
            ?.error ||
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
      <div className="checkout-message">
        Đang tải trang thanh toán...
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        {/* HEADER */}
        <div className="checkout-header">
          <div>
            <p className="checkout-eyebrow">
              VUABONGDA STORE
            </p>

            <h1>
              Thanh toán
            </h1>

            <p>
              Kiểm tra sản phẩm và
              thông tin nhận hàng.
            </p>
          </div>

          <button
            type="button"
            className="checkout-back"
            onClick={() => {
              if (
                checkoutMode ===
                "buy-now"
              ) {
                navigate(-1);
              } else {
                navigate(
                  "/cart"
                );
              }
            }}
          >
            ← Quay lại
          </button>
        </div>

        {message && (
          <div className="checkout-error">
            {message}
          </div>
        )}

        {checkoutItems.length >
          0 && (
            <div className="checkout-layout">

              {/* LEFT */}
              <section className="checkout-main">

                {/* PRODUCTS */}
                <div className="checkout-box">
                  <h2>
                    Sản phẩm
                  </h2>

                  {checkoutItems.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="checkout-product"
                        key={
                          item.id ||
                          `${item.productId}-${item.size}-${index}`
                        }
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
                        </div>

                        <div className="checkout-product-price">
                          <span>
                            {formatPrice(
                              item.price
                            )}
                          </span>

                          <strong>
                            {formatPrice(
                              item.subtotal
                            )}
                          </strong>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* SHIPPING FORM */}
                <form
                  id="checkout-form"
                  onSubmit={
                    handleCheckout
                  }
                  className="checkout-box checkout-form"
                >
                  <h2>
                    Thông tin nhận hàng
                  </h2>

                  <label>
                    Tên người nhận
                  </label>

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
                    placeholder="Nhập tên người nhận"
                    required
                  />

                  <label>
                    Số điện thoại
                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Nhập số điện thoại"
                    required
                  />

                  <label>
                    Địa chỉ giao hàng
                  </label>

                  <textarea
                    value={
                      shippingAddress
                    }
                    onChange={(e) =>
                      setShippingAddress(
                        e.target.value
                      )
                    }
                    placeholder="Nhập địa chỉ nhận hàng"
                    rows="4"
                    required
                  />

                  <label>
                    Phương thức thanh toán
                  </label>

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
                      Thanh toán khi nhận
                      hàng (COD)
                    </option>

                    <option value="BANK_TRANSFER">
                      Chuyển khoản ngân hàng
                    </option>
                  </select>
                </form>
              </section>

              {/* RIGHT */}
              <aside className="checkout-summary">

                <h2>
                  Tóm tắt đơn hàng
                </h2>

                {/* PROMOTION */}
                <div className="promotion-area">
                  <label>
                    Mã khuyến mãi
                  </label>

                  <div className="promotion-input-row">
                    <input
                      type="text"
                      value={
                        promotionCode
                      }
                      onChange={
                        handlePromotionCodeChange
                      }
                      placeholder="VD: WELCOME10"
                      disabled={
                        applyingPromotion
                      }
                    />

                    {!appliedPromotion ? (
                      <button
                        type="button"
                        onClick={
                          handleApplyPromotion
                        }
                        disabled={
                          applyingPromotion
                        }
                      >
                        {applyingPromotion
                          ? "Đang kiểm tra..."
                          : "Áp dụng"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="promotion-remove"
                        onClick={
                          handleRemovePromotion
                        }
                      >
                        Bỏ mã
                      </button>
                    )}
                  </div>

                  {promotionMessage && (
                    <p className="promotion-success">
                      {
                        promotionMessage
                      }
                    </p>
                  )}

                  {promotionError && (
                    <p className="promotion-error">
                      {
                        promotionError
                      }
                    </p>
                  )}

                  {appliedPromotion && (
                    <div className="promotion-info">
                      <strong>
                        {
                          appliedPromotion.name
                        }
                      </strong>

                      <span>
                        {appliedPromotion.discountType ===
                          "PERCENT"
                          ? `Giảm ${Number(
                            appliedPromotion.discountValue
                          )}%`
                          : `Giảm ${formatPrice(
                            appliedPromotion.discountValue
                          )}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* TOTALS */}
                <div className="checkout-summary-row">
                  <span>
                    Tạm tính
                  </span>

                  <strong>
                    {formatPrice(
                      originalAmount
                    )}
                  </strong>
                </div>

                <div className="checkout-summary-row">
                  <span>
                    Khuyến mãi
                  </span>

                  <strong
                    className={
                      discountAmount >
                        0
                        ? "discount-value"
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

                {appliedPromotion && (
                  <div className="checkout-promotion-code">
                    Mã đã áp dụng:{" "}
                    <strong>
                      {
                        appliedPromotion.code
                      }
                    </strong>
                  </div>
                )}

                <div className="checkout-summary-total">
                  <span>
                    Tổng thanh toán
                  </span>

                  <strong>
                    {formatPrice(
                      finalAmount
                    )}
                  </strong>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  className="checkout-submit"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? "Đang đặt hàng..."
                    : "Đặt hàng"}
                </button>

                <p className="checkout-note">
                  Tổng tiền cuối cùng sẽ
                  được backend kiểm tra lại
                  trước khi tạo đơn hàng.
                </p>
              </aside>
            </div>
          )}
      </div>
    </main>
  );
}

export default CheckoutPage;