import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const SHOE_SIZES = ["38", "39", "40", "41", "42", "43"];
const CLOTHING_SIZES = ["S", "M", "L", "XL"];

function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // ================================
  // LOAD CART
  // ================================
  const loadCart = async () => {
    try {
      const response = await axiosClient.get("/api/cart");

      setCart(response.data);
      setError("");

      // Xoa nhung ID khong con ton tai trong cart
      setSelectedIds((current) =>
        current.filter((id) =>
          response.data.items?.some(
            (item) => item.id === id
          )
        )
      );
    } catch (err) {
      console.error("LOAD CART THAT BAI:", err);

      setError(
        err.response?.data?.message ||
        "Không thể tải giỏ hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const items = cart?.items || [];

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("vi-VN") + " đ";

  // ================================
  // IMAGE
  // ================================
  const getImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http")) {
      return url;
    }

    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  // ================================
  // CART UPDATED EVENT
  // Navbar se nghe event nay
  // ================================
  const notifyCartUpdated = () => {
    window.dispatchEvent(
      new Event("cart-updated")
    );
  };

  // ================================
  // CHECKBOX
  // ================================
  const handleSelectItem = (itemId) => {
    setSelectedIds((current) => {
      if (current.includes(itemId)) {
        return current.filter(
          (id) => id !== itemId
        );
      }

      return [...current, itemId];
    });
  };

  const allSelected =
    items.length > 0 &&
    selectedIds.length === items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        items.map((item) => item.id)
      );
    }
  };

  // ================================
  // SELECTED ITEMS
  // ================================
  const selectedItems = useMemo(
    () =>
      items.filter((item) =>
        selectedIds.includes(item.id)
      ),
    [items, selectedIds]
  );

  const selectedQuantity = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [selectedItems]
  );

  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) =>
          total + Number(item.subtotal || 0),
        0
      ),
    [selectedItems]
  );

  // ================================
  // UPDATE CART ITEM
  // ================================
  const updateItem = async (
    item,
    quantity,
    size = item.size
  ) => {
    if (quantity < 1) return;

    try {
      setUpdatingId(item.id);
      setError("");

      const response =
        await axiosClient.put(
          `/api/cart/items/${item.id}`,
          {
            quantity,
            size: size || null,
          }
        );

      setCart(response.data);

      /*
       * Neu doi size lam backend merge 2 dong,
       * item ID cu co the bien mat.
       * Nen loc lai selection.
       */
      setSelectedIds((current) =>
        current.filter((id) =>
          response.data.items?.some(
            (cartItem) =>
              cartItem.id === id
          )
        )
      );

      notifyCartUpdated();
    } catch (err) {
      console.error(
        "UPDATE CART THAT BAI:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Không thể cập nhật sản phẩm."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ================================
  // QUANTITY
  // ================================
  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;

    updateItem(
      item,
      item.quantity - 1
    );
  };

  const handleIncrease = (item) => {
    updateItem(
      item,
      item.quantity + 1
    );
  };

  // ================================
  // SIZE
  // ================================
  const getAvailableSizes = (item) => {
    if (!item.size) {
      return [];
    }

    const currentSize = String(
      item.size
    )
      .trim()
      .toUpperCase();

    if (
      ["38", "39", "40", "41", "42", "43"].includes(
        currentSize
      )
    ) {
      return [
        "38",
        "39",
        "40",
        "41",
        "42",
        "43",
      ];
    }

    if (
      ["S", "M", "L", "XL"].includes(
        currentSize
      )
    ) {
      return [
        "S",
        "M",
        "L",
        "XL",
      ];
    }

    return [];
  };
  const handleSizeChange = (
    item,
    newSize
  ) => {
    if (newSize === item.size) {
      return;
    }

    updateItem(
      item,
      item.quantity,
      newSize
    );
  };

  // ================================
  // REMOVE
  // ================================
  const handleRemove = async (itemId) => {
    const confirmed =
      window.confirm(
        "Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?"
      );

    if (!confirmed) return;

    try {
      setUpdatingId(itemId);

      const response =
        await axiosClient.delete(
          `/api/cart/items/${itemId}`
        );

      setCart(response.data);

      setSelectedIds((current) =>
        current.filter(
          (id) => id !== itemId
        )
      );

      setError("");

      notifyCartUpdated();
    } catch (err) {
      console.error(
        "DELETE CART THAT BAI:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Không thể xóa sản phẩm."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ================================
  // CHECKOUT SELECTED ITEMS
  // ================================
  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      setError(
        "Vui lòng chọn ít nhất một sản phẩm để thanh toán."
      );

      return;
    }

    /*
     * Luu selection tam thoi.
     * CheckoutPage se doc danh sach nay.
     */
    sessionStorage.setItem(
      "vb_checkout_cart_items",
      JSON.stringify(selectedIds)
    );

    navigate(
      "/checkout?mode=cart"
    );
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="cart-message">
        Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">

        {/* HEADER */}
        <div className="cart-page-header">
          <div>
            <p className="cart-eyebrow">
              VuaBongDa Store
            </p>

            <h1>Giỏ hàng của bạn</h1>

            <p>
              {items.length > 0
                ? `${items.reduce(
                  (total, item) =>
                    total +
                    item.quantity,
                  0
                )} sản phẩm trong giỏ hàng`
                : "Giỏ hàng hiện chưa có sản phẩm"}
            </p>
          </div>

          <Link
            to="/products"
            className="continue-shopping"
          >
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {items.length === 0 ? (
          <section className="cart-empty">
            <h2>
              Giỏ hàng đang trống
            </h2>

            <p>
              Chưa có sản phẩm nào trong
              giỏ hàng của bạn.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
            >
              Xem sản phẩm
            </button>
          </section>
        ) : (
          <>
            {/* SELECT ALL */}
            <div className="cart-select-all">
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={
                    handleSelectAll
                  }
                />

                <span>
                  Chọn tất cả
                </span>
              </label>

              <span>
                {items.length} dòng sản phẩm
              </span>
            </div>

            <div className="cart-layout">

              {/* CART ITEMS */}
              <section className="cart-items">
                {items.map((item) => {
                  const sizes =
                    getAvailableSizes(item);

                  const isSelected =
                    selectedIds.includes(
                      item.id
                    );

                  return (
                    <article
                      key={item.id}
                      className={
                        isSelected
                          ? "cart-item selected"
                          : "cart-item"
                      }
                    >
                      {/* CHECKBOX */}
                      <div className="cart-item-check">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleSelectItem(
                              item.id
                            )
                          }
                        />
                      </div>

                      {/* IMAGE */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="cart-item-image"
                      >
                        {getImageUrl(
                          item.imageUrl
                        ) ? (
                          <img
                            src={getImageUrl(
                              item.imageUrl
                            )}
                            alt={
                              item.productName
                            }
                          />
                        ) : (
                          <span>
                            Chưa có ảnh
                          </span>
                        )}
                      </Link>

                      {/* INFO */}
                      <div className="cart-item-info">
                        <Link
                          to={`/products/${item.productId}`}
                        >
                          <h3>
                            {
                              item.productName
                            }
                          </h3>
                        </Link>

                        <p className="cart-item-price">
                          {formatPrice(
                            item.price
                          )}
                        </p>

                        {/* SIZE */}
                        {item.size && (
                          <div
                            className="cart-item-option"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <label>
                              Size
                            </label>

                            <select
                              value={String(
                                item.size
                              )
                                .trim()
                                .toUpperCase()}
                              disabled={
                                updatingId === item.id
                              }
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              onChange={(e) => {
                                e.stopPropagation();

                                handleSizeChange(
                                  item,
                                  e.target.value
                                );
                              }}
                            >
                              {sizes.map((size) => (
                                <option
                                  key={size}
                                  value={size}
                                >
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="cart-item-controls">

                          {/* QUANTITY */}
                          <div className="cart-quantity">
                            <button
                              type="button"
                              disabled={
                                item.quantity <=
                                1 ||
                                updatingId ===
                                item.id
                              }
                              onClick={() =>
                                handleDecrease(
                                  item
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                item.id
                              }
                              onClick={() =>
                                handleIncrease(
                                  item
                                )
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-remove"
                            disabled={
                              updatingId ===
                              item.id
                            }
                            onClick={() =>
                              handleRemove(
                                item.id
                              )
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      {/* SUBTOTAL */}
                      <div className="cart-item-subtotal">
                        <span>
                          Thành tiền
                        </span>

                        <strong>
                          {formatPrice(
                            item.subtotal
                          )}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </section>

              {/* SUMMARY */}
              <aside className="cart-summary">
                <h2>
                  Tóm tắt thanh toán
                </h2>

                <div className="cart-summary-row">
                  <span>
                    Đã chọn
                  </span>

                  <strong>
                    {selectedQuantity} sản phẩm
                  </strong>
                </div>

                <div className="cart-summary-row">
                  <span>
                    Tạm tính
                  </span>

                  <strong>
                    {formatPrice(
                      selectedTotal
                    )}
                  </strong>
                </div>

                <div className="cart-summary-shipping">
                  Chỉ những sản phẩm được
                  chọn mới được đưa sang
                  bước thanh toán.
                </div>

                <div className="cart-summary-total">
                  <span>
                    Tổng thanh toán
                  </span>

                  <strong>
                    {formatPrice(
                      selectedTotal
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="cart-checkout-button"
                  disabled={
                    selectedIds.length === 0
                  }
                  onClick={
                    handleCheckout
                  }
                >
                  {selectedIds.length === 0
                    ? "Chọn sản phẩm để thanh toán"
                    : `Thanh toán (${selectedQuantity})`}
                </button>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default CartPage;