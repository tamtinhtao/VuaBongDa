import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axiosClient from "../api/axiosClient";

const CATEGORY_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: "GIAY", label: "Giày" },
  { key: "QUAN_AO", label: "Quần áo" },
  { key: "BONG", label: "Bóng" },
  { key: "PHU_KIEN", label: "Phụ kiện" },
];

const PAGE_SIZE = 9;

// ================================
// NORMALIZE TEXT
// ================================
function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ================================
// CATEGORY KEY
// ================================
function getCategoryKey(categoryName = "") {
  const text = normalizeText(categoryName);

  if (text.includes("phu kien")) {
    return "PHU_KIEN";
  }

  if (text.includes("giay")) {
    return "GIAY";
  }

  if (
    text.includes("ao") ||
    text.includes("quan")
  ) {
    return "QUAN_AO";
  }

  if (text.includes("bong")) {
    return "BONG";
  }

  return "OTHER";
}

// ================================
// CATEGORY LABEL
// ================================
function getCategoryLabel(categoryName = "") {
  const key =
    getCategoryKey(categoryName);

  const category =
    CATEGORY_OPTIONS.find(
      (item) => item.key === key
    );

  return category
    ? category.label
    : "Khác";
}

function ProductsPage() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [page, setPage] =
    useState(0);

  const [
    brandFilter,
    setBrandFilter,
  ] = useState("ALL");

  const [
    priceFilter,
    setPriceFilter,
  ] = useState("ALL");

  const keyword =
    searchParams.get("keyword") || "";

  const selectedCategory =
    searchParams.get("category") ||
    "ALL";

  const sort =
    searchParams.get("sort") ||
    "newest";

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (price) =>
    Number(price || 0).toLocaleString(
      "vi-VN"
    ) + " đ";

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
  // REQUIRE CUSTOMER
  // ================================
  const requireCustomer = () => {
    const token =
      localStorage.getItem(
        "vb_token"
      );

    const role =
      localStorage.getItem(
        "vb_role"
      );

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

    return true;
  };

  // ================================
  // PRODUCT CO CAN SIZE KHONG
  // ================================
  const productNeedsSize = (
    product
  ) => {
    const category =
      getCategoryKey(
        product.categoryName
      );

    return (
      category === "GIAY" ||
      category === "QUAN_AO"
    );
  };

  // ================================
  // THEM VAO GIO TU CARD
  // ================================
  const handleCardAddToCart =
    async (product) => {
      if (!requireCustomer()) {
        return;
      }

      /*
       * GIAY / QUAN AO
       * -> phai vao chi tiet
       * -> chon size truoc.
       */
      if (
        productNeedsSize(product)
      ) {
        navigate(
          `/products/${product.id}`
        );

        return;
      }

      /*
       * BONG / PHU KIEN
       * -> khong can size
       * -> them truc tiep.
       */
      try {
        await axiosClient.post(
          "/api/cart/items",
          {
            productId:
              product.id,
            quantity: 1,
            size: null,
          }
        );

        // Cap nhat badge Navbar
        window.dispatchEvent(
          new Event(
            "cart-updated"
          )
        );

        alert(
          `Đã thêm ${product.name} vào giỏ hàng.`
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
      }
    };

  // ================================
  // MUA NGAY TU CARD
  // ================================
  const handleCardBuyNow = (
    product
  ) => {
    if (!requireCustomer()) {
      return;
    }

    /*
     * GIAY / QUAN AO
     * -> can chon size
     * -> vao trang chi tiet.
     */
    if (
      productNeedsSize(product)
    ) {
      navigate(
        `/products/${product.id}`
      );

      return;
    }

    /*
     * BONG / PHU KIEN
     * -> khong can size
     * -> di Checkout truc tiep
     * -> KHONG them Cart.
     */
    const buyNowData = {
      productId: product.id,
      quantity: 1,
      size: null,
    };

    sessionStorage.setItem(
      "vb_buy_now",
      JSON.stringify(
        buyNowData
      )
    );

    /*
     * Xoa selection Cart cu de
     * hai luong khong bi nham.
     */
    sessionStorage.removeItem(
      "vb_checkout_cart_items"
    );

    navigate(
      "/checkout?mode=buy-now"
    );
  };

  // ================================
  // LOAD PRODUCTS
  // ================================
  useEffect(() => {
    loadProducts();
  }, [keyword, sort]);

  // ================================
  // RESET PAGE KHI FILTER DOI
  // ================================
  useEffect(() => {
    setPage(0);
  }, [
    keyword,
    selectedCategory,
    brandFilter,
    priceFilter,
    sort,
  ]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      let sortBy = "id";
      let direction = "desc";

      if (
        sort === "price-asc"
      ) {
        sortBy = "price";
        direction = "asc";
      }

      if (
        sort === "price-desc"
      ) {
        sortBy = "price";
        direction = "desc";
      }

      if (sort === "name") {
        sortBy = "name";
        direction = "asc";
      }

      const response =
        await axiosClient.get(
          "/api/products",
          {
            params: {
              keyword,
              page: 0,
              size: 100,
              sortBy,
              direction,
            },
          }
        );

      setProducts(
        response.data.content ||
        []
      );
    } catch (error) {
      console.error(
        "Khong tai duoc danh sach san pham:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // BRANDS
  // ================================
  const brands = useMemo(() => {
    return [
      ...new Set(
        products
          .map(
            (product) =>
              product.brand
          )
          .filter(Boolean)
      ),
    ];
  }, [products]);

  // ================================
  // FILTER PRODUCTS
  // ================================
  const filteredProducts =
    useMemo(() => {
      return products.filter(
        (product) => {
          // CATEGORY
          const matchCategory =
            selectedCategory ===
            "ALL" ||
            getCategoryKey(
              product.categoryName
            ) ===
            selectedCategory;

          // BRAND
          const matchBrand =
            brandFilter ===
            "ALL" ||
            product.brand ===
            brandFilter;

          // PRICE
          const price =
            Number(
              product.price || 0
            );

          let matchPrice = true;

          if (
            priceFilter ===
            "UNDER_1M"
          ) {
            matchPrice =
              price < 1000000;
          }

          if (
            priceFilter ===
            "1M_2M"
          ) {
            matchPrice =
              price >=
              1000000 &&
              price <=
              2000000;
          }

          if (
            priceFilter ===
            "OVER_2M"
          ) {
            matchPrice =
              price > 2000000;
          }

          return (
            matchCategory &&
            matchBrand &&
            matchPrice
          );
        }
      );
    }, [
      products,
      selectedCategory,
      brandFilter,
      priceFilter,
    ]);

  // ================================
  // PAGINATION
  // ================================
  const totalPages =
    Math.ceil(
      filteredProducts.length /
      PAGE_SIZE
    );

  const displayedProducts =
    filteredProducts.slice(
      page * PAGE_SIZE,
      page * PAGE_SIZE +
      PAGE_SIZE
    );

  // ================================
  // CATEGORY
  // ================================
  const changeCategory = (
    key
  ) => {
    const params =
      new URLSearchParams(
        searchParams
      );

    if (key === "ALL") {
      params.delete(
        "category"
      );
    } else {
      params.set(
        "category",
        key
      );
    }

    setSearchParams(params);
  };

  // ================================
  // SORT
  // ================================
  const changeSort = (
    value
  ) => {
    const params =
      new URLSearchParams(
        searchParams
      );

    params.set(
      "sort",
      value
    );

    setSearchParams(params);
  };

  // ================================
  // RESET FILTER
  // ================================
  const resetFilters = () => {
    setBrandFilter("ALL");
    setPriceFilter("ALL");
  };

  return (
    <main className="products-page">
      <div className="products-container">

        {/* PAGE HEADER */}
        <div className="products-heading">
          <div>
            <p className="products-label">
              VUABONGDA STORE
            </p>

            <h1>
              Sản phẩm
            </h1>

            <p>
              {keyword
                ? `Kết quả tìm kiếm cho "${keyword}"`
                : "Khám phá sản phẩm tại VuaBongDa"}
            </p>
          </div>

          <div className="product-sort">
            <label>
              Sắp xếp
            </label>

            <select
              value={sort}
              onChange={(e) =>
                changeSort(
                  e.target.value
                )
              }
            >
              <option value="newest">
                Mới nhất
              </option>

              <option value="price-asc">
                Giá thấp đến cao
              </option>

              <option value="price-desc">
                Giá cao đến thấp
              </option>

              <option value="name">
                Tên A - Z
              </option>
            </select>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="category-tabs">
          {CATEGORY_OPTIONS.map(
            (item) => (
              <button
                type="button"
                key={item.key}
                className={
                  selectedCategory ===
                    item.key
                    ? "category-tab active"
                    : "category-tab"
                }
                onClick={() =>
                  changeCategory(
                    item.key
                  )
                }
              >
                {item.label}
              </button>
            )
          )}
        </div>

        <div className="products-layout">

          {/* FILTER */}
          <aside className="product-filter-panel">
            <div className="filter-header">
              <h3>
                Bộ lọc
              </h3>

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >
                Đặt lại
              </button>
            </div>

            {/* PRICE */}
            <div className="filter-group">
              <h4>
                Khoảng giá
              </h4>

              <label>
                <input
                  type="radio"
                  name="price"
                  checked={
                    priceFilter ===
                    "ALL"
                  }
                  onChange={() =>
                    setPriceFilter(
                      "ALL"
                    )
                  }
                />

                Tất cả mức giá
              </label>

              <label>
                <input
                  type="radio"
                  name="price"
                  checked={
                    priceFilter ===
                    "UNDER_1M"
                  }
                  onChange={() =>
                    setPriceFilter(
                      "UNDER_1M"
                    )
                  }
                />

                Dưới 1.000.000 đ
              </label>

              <label>
                <input
                  type="radio"
                  name="price"
                  checked={
                    priceFilter ===
                    "1M_2M"
                  }
                  onChange={() =>
                    setPriceFilter(
                      "1M_2M"
                    )
                  }
                />

                1.000.000 - 2.000.000 đ
              </label>

              <label>
                <input
                  type="radio"
                  name="price"
                  checked={
                    priceFilter ===
                    "OVER_2M"
                  }
                  onChange={() =>
                    setPriceFilter(
                      "OVER_2M"
                    )
                  }
                />

                Trên 2.000.000 đ
              </label>
            </div>

            {/* BRAND */}
            <div className="filter-group">
              <h4>
                Thương hiệu
              </h4>

              <label>
                <input
                  type="radio"
                  name="brand"
                  checked={
                    brandFilter ===
                    "ALL"
                  }
                  onChange={() =>
                    setBrandFilter(
                      "ALL"
                    )
                  }
                />

                Tất cả thương hiệu
              </label>

              {brands.map(
                (brand) => (
                  <label
                    key={brand}
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={
                        brandFilter ===
                        brand
                      }
                      onChange={() =>
                        setBrandFilter(
                          brand
                        )
                      }
                    />

                    {brand}
                  </label>
                )
              )}
            </div>
          </aside>

          {/* PRODUCTS */}
          <section className="products-content">

            <div className="products-result-bar">
              <span>
                {
                  filteredProducts.length
                }{" "}
                sản phẩm
              </span>

              {keyword && (
                <Link to="/products">
                  Xóa tìm kiếm
                </Link>
              )}
            </div>

            {loading ? (
              <div className="products-message">
                Đang tải sản phẩm...
              </div>
            ) : displayedProducts.length ===
              0 ? (
              <div className="products-message">
                Không tìm thấy sản phẩm phù hợp.
              </div>
            ) : (
              <div className="product-shop-grid">
                {displayedProducts.map(
                  (product) => (
                    <article
                      className="shop-product-card"
                      key={
                        product.id
                      }
                    >
                      {/* CLICK CARD -> DETAIL */}
                      <Link
                        to={`/products/${product.id}`}
                        className="product-card-link"
                      >
                        <div className="shop-product-image">
                          {getImageUrl(
                            product.imageUrl
                          ) ? (
                            <img
                              src={getImageUrl(
                                product.imageUrl
                              )}
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <span>
                              Chưa có ảnh
                            </span>
                          )}

                          {product.stockQuantity <=
                            0 && (
                              <div className="out-of-stock">
                                Hết hàng
                              </div>
                            )}
                        </div>

                        <div className="shop-product-info">
                          <div className="product-category">
                            {getCategoryLabel(
                              product.categoryName
                            )}
                          </div>

                          <h3>
                            {
                              product.name
                            }
                          </h3>

                          <p className="product-brand">
                            {product.brand ||
                              "Chưa cập nhật"}
                          </p>

                          <div className="product-card-bottom">
                            <strong>
                              {formatPrice(
                                product.price
                              )}
                            </strong>

                            <span>
                              Còn{" "}
                              {
                                product.stockQuantity
                              }
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* CUSTOMER ACTIONS */}
                      {localStorage.getItem(
                        "vb_role"
                      ) !== "ADMIN" && (
                          <div className="product-card-actions">

                            <button
                              type="button"
                              className="card-add-cart"
                              disabled={
                                product.stockQuantity <=
                                0
                              }
                              onClick={() =>
                                handleCardAddToCart(
                                  product
                                )
                              }
                            >
                              Thêm vào giỏ
                            </button>

                            <button
                              type="button"
                              className="card-buy-now"
                              disabled={
                                product.stockQuantity <=
                                0
                              }
                              onClick={() =>
                                handleCardBuyNow(
                                  product
                                )
                              }
                            >
                              Mua ngay
                            </button>
                          </div>
                        )}
                    </article>
                  )
                )}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">

                <button
                  disabled={
                    page === 0
                  }
                  onClick={() =>
                    setPage(
                      page - 1
                    )
                  }
                >
                  ←
                </button>

                {Array.from({
                  length:
                    totalPages,
                }).map(
                  (_, index) => (
                    <button
                      key={index}
                      className={
                        page ===
                          index
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPage(
                          index
                        )
                      }
                    >
                      {index +
                        1}
                    </button>
                  )
                )}

                <button
                  disabled={
                    page >=
                    totalPages -
                    1
                  }
                  onClick={() =>
                    setPage(
                      page + 1
                    )
                  }
                >
                  →
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProductsPage;