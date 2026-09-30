import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import axiosClient from "../api/axiosClient";

const SHOE_SIZES = [
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
];

const CLOTHING_SIZES = [
  "S",
  "M",
  "L",
  "XL",
];

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState(null);

  const [quantity, setQuantity] =
    useState(1);

  const [
    selectedSize,
    setSelectedSize,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const token =
    localStorage.getItem("vb_token");

  const role =
    localStorage.getItem("vb_role");

  // ================================
  // LOAD PRODUCT
  // ================================
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        const response =
          await axiosClient.get(
            `/api/products/${id}`
          );

        setProduct(response.data);

        setQuantity(1);
        setSelectedSize("");
      } catch (error) {
        console.error(
          "LOAD PRODUCT THAT BAI:",
          error
        );

        alert(
          "Không tìm thấy sản phẩm."
        );

        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // ================================
  // IMAGE
  // ================================
  const getImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http")) {
      return url;
    }

    return `${import.meta.env.VITE_API_URL
      }${url}`;
  };

  // ================================
  // PRICE
  // ================================
  const formatPrice = (price) =>
    Number(price || 0).toLocaleString(
      "vi-VN"
    ) + " đ";

  // ================================
  // CATEGORY
  // ================================
  const categoryText =
    normalizeText(
      product?.categoryName || ""
    );

  const isShoes =
    categoryText.includes("giay");

  const isClothing =
    categoryText.includes("ao") ||
    categoryText.includes("quan");

  const needSize =
    isShoes || isClothing;

  const sizes = isShoes
    ? SHOE_SIZES
    : isClothing
      ? CLOTHING_SIZES
      : [];

  // ================================
  // QUANTITY
  // ================================
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(
        (current) => current - 1
      );
    }
  };

  const handleIncrease = () => {
    const stock =
      product?.stockQuantity ?? 0;

    if (quantity < stock) {
      setQuantity(
        (current) => current + 1
      );
    }
  };

  // ================================
  // VALIDATE
  // ================================
  const validatePurchase = () => {
    if (!token) {
      navigate("/login");
      return false;
    }

    if (role !== "CUSTOMER") {
      alert(
        "Chỉ tài khoản khách hàng mới có thể mua sản phẩm."
      );

      return false;
    }
    if (
      String(
        product?.status ||
        "ACTIVE"
      ).toUpperCase() !==
      "ACTIVE"
    ) {
      alert(
        "Sản phẩm hiện không còn được kinh doanh."
      );

      return false;
    }

    if (needSize && !selectedSize) {
      alert(
        "Vui lòng chọn size."
      );

      return false;
    }

    if (
      !product ||
      product.stockQuantity <= 0
    ) {
      alert(
        "Sản phẩm hiện đã hết hàng."
      );

      return false;
    }

    return true;
  };

  // ================================
  // THEM VAO GIO
  // ================================
  const handleAddToCart =
    async () => {
      if (!validatePurchase()) {
        return;
      }

      try {
        setProcessing(true);

        await axiosClient.post(
          "/api/cart/items",
          {
            productId: product.id,
            quantity,
            size: needSize
              ? selectedSize
              : null,
          }
        );

        // Navbar sau nay se nghe event nay
        window.dispatchEvent(
          new Event("cart-updated")
        );

        alert(
          needSize
            ? `Đã thêm ${product.name} - Size ${selectedSize} vào giỏ hàng.`
            : `Đã thêm ${product.name} vào giỏ hàng.`
        );
      } catch (error) {
        console.error(
          "ADD TO CART THAT BAI:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng."
        );
      } finally {
        setProcessing(false);
      }
    };

  // ================================
  // MUA NGAY
  // KHONG THEM VAO CART
  // ================================
  const handleBuyNow = () => {
    if (!validatePurchase()) {
      return;
    }

    const buyNowData = {
      productId: product.id,
      quantity,
      size: needSize
        ? selectedSize
        : null,
    };

    sessionStorage.setItem(
      "vb_buy_now",
      JSON.stringify(
        buyNowData
      )
    );

    // Xoa selection cart cu
    // de tranh nham luong checkout
    sessionStorage.removeItem(
      "vb_checkout_cart_items"
    );

    navigate(
      "/checkout?mode=buy-now"
    );
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="product-detail-message">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stock =
    product.stockQuantity ?? 0;
  const isActive =
    String(
      product.status ||
      "ACTIVE"
    ).toUpperCase() ===
    "ACTIVE";

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">

        {/* BREADCRUMB */}
        <div className="product-breadcrumb">
          <Link to="/">
            Trang chủ
          </Link>

          <span>/</span>

          <Link to="/products">
            Sản phẩm
          </Link>

          <span>/</span>

          <span>
            {product.name}
          </span>
        </div>

        <section className="product-detail-main">

          {/* IMAGE */}
          <div className="product-detail-image">
            {getImageUrl(
              product.imageUrl
            ) ? (
              <img
                src={getImageUrl(
                  product.imageUrl
                )}
                alt={product.name}
              />
            ) : (
              <div className="product-no-image">
                Chưa có ảnh sản phẩm
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="product-detail-info">

            <p className="detail-category">
              {product.categoryName ||
                "Sản phẩm"}
            </p>

            <h1>
              {product.name}
            </h1>

            <div className="detail-brand">
              Thương hiệu:
              <strong>
                {product.brand ||
                  "Chưa cập nhật"}
              </strong>
            </div>

            <div className="detail-price">
              {formatPrice(
                product.price
              )}
            </div>
            {!isActive && (
              <div className="product-unavailable-note">
                Sản phẩm hiện không còn được kinh doanh
              </div>
            )}

            {/* STOCK */}
            <div className="detail-stock">
              {stock > 0 ? (
                <>
                  <span className="stock-available">
                    Còn hàng
                  </span>

                  <span>
                    {stock} sản phẩm
                    trong kho
                  </span>
                </>
              ) : (
                <span className="stock-empty">
                  Hết hàng
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="detail-description">
              {product.description ||
                "Sản phẩm hiện chưa có mô tả."}
            </p>

            {/* SIZE */}
            {needSize && (
              <div className="detail-size">
                <div className="detail-option-title">
                  <strong>
                    Chọn size
                  </strong>

                  {selectedSize && (
                    <span>
                      Đã chọn:{" "}
                      {selectedSize}
                    </span>
                  )}
                </div>

                <div className="size-options">
                  {sizes.map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        className={
                          selectedSize ===
                            size
                            ? "size-button active"
                            : "size-button"
                        }
                        onClick={() =>
                          setSelectedSize(
                            size
                          )
                        }
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* CUSTOMER */}
            {role !== "ADMIN" && (
              <>
                {/* QUANTITY */}
                <div className="detail-quantity">
                  <span>
                    Số lượng
                  </span>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={
                        handleDecrease
                      }
                      disabled={
                        quantity <= 1
                      }
                    >
                      −
                    </button>

                    <span>
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        handleIncrease
                      }
                      disabled={
                        quantity >= stock
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="detail-actions">
                  <button
                    type="button"
                    className="detail-add-cart"
                    onClick={
                      handleAddToCart
                    }
                    disabled={
                      !isActive ||
                      stock <= 0 ||
                      processing
                    }
                  >
                    {processing
                      ? "Đang xử lý..."
                      : "Thêm vào giỏ hàng"}
                  </button>

                  <button
                    type="button"
                    className="detail-buy-now"
                    onClick={
                      handleBuyNow
                    }
                    disabled={
                      !isActive ||
                      stock <= 0 ||
                      processing
                    }
                  >
                    Mua ngay
                  </button>
                </div>
              </>
            )}

            {/* ADMIN */}
            {role === "ADMIN" && (
              <div className="admin-view-note">
                Bạn đang xem sản phẩm
                bằng tài khoản quản trị.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetailPage;