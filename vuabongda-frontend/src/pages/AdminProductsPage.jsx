import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axiosClient from "../api/axiosClient";

function AdminProductsPage() {
  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ================================
  // SEARCH / FILTER
  // ================================
  const [keyword, setKeyword] =
    useState("");

  const [
    filterCategoryId,
    setFilterCategoryId,
  ] = useState("");

  // ================================
  // CREATE FORM
  // ================================
  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [price, setPrice] =
    useState("");

  const [
    stockQuantity,
    setStockQuantity,
  ] = useState("");

  const [brand, setBrand] =
    useState("");

  const [
    categoryId,
    setCategoryId,
  ] = useState("");

  const [creating, setCreating] =
    useState(false);

  // ================================
  // EDIT
  // ================================
  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);

  const [updating, setUpdating] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    uploadingId,
    setUploadingId,
  ] = useState(null);

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (value) =>
    Number(
      value || 0
    ).toLocaleString(
      "vi-VN"
    ) + " đ";

  // ================================
  // IMAGE URL
  // ================================
  const getImageUrl = (
    imageUrl
  ) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith(
        "http://"
      ) ||
      imageUrl.startsWith(
        "https://"
      )
    ) {
      return imageUrl;
    }

    return `${import.meta.env.VITE_API_URL}${imageUrl}`;
  };

  // ================================
  // CATEGORY NAME
  // ================================
  const getCategoryName = (
    product
  ) => {
    if (product.categoryName) {
      return product.categoryName;
    }

    const category =
      categories.find(
        (item) =>
          Number(item.id) ===
          Number(
            product.categoryId
          )
      );

    return (
      category?.name ||
      "—"
    );
  };

  // ================================
  // REAL PRODUCT STATUS
  // ================================
  const getProductStatus = (
    product
  ) => {
    const stock =
      Number(
        product.stockQuantity ||
        0
      );

    if (stock <= 0) {
      return "OUT_OF_STOCK";
    }

    if (
      String(
        product.status || ""
      ).toUpperCase() ===
      "INACTIVE"
    ) {
      return "INACTIVE";
    }

    return "ACTIVE";
  };

  // ================================
  // STATUS LABEL
  // ================================
  const getStatusLabel = (
    status
  ) => {
    const labels = {
      ACTIVE:
        "ĐANG KINH DOANH",

      INACTIVE:
        "NGỪNG BÁN",

      OUT_OF_STOCK:
        "HẾT HÀNG",
    };

    return (
      labels[status] ||
      status ||
      "—"
    );
  };

  // ================================
  // STATUS CLASS
  // ================================
  const getStatusClass = (
    status
  ) => {
    if (
      status ===
      "OUT_OF_STOCK"
    ) {
      return "out-of-stock";
    }

    return String(
      status || ""
    ).toLowerCase();
  };

  // ================================
  // LOAD PRODUCTS
  // ================================
  const loadProducts =
    async () => {
      try {
        const response =
          await axiosClient.get(
            "/api/products?page=0&size=100&sortBy=id&direction=desc"
          );

        setProducts(
          response.data
            .content || []
        );
      } catch (err) {
        console.error(
          "LOAD PRODUCTS THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể tải danh sách sản phẩm."
        );
      }
    };

  // ================================
  // LOAD CATEGORIES
  // ================================
  const loadCategories =
    async () => {
      try {
        const response =
          await axiosClient.get(
            "/api/categories"
          );

        setCategories(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (err) {
        console.error(
          "LOAD CATEGORIES THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể tải danh mục."
        );
      }
    };

  // ================================
  // INITIAL LOAD
  // ================================
  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(
            true
          );

          await Promise.all([
            loadProducts(),
            loadCategories(),
          ]);
        } finally {
          setLoading(
            false
          );
        }
      };

    loadData();
  }, []);

  // ================================
  // FILTER PRODUCTS
  // ================================
  const filteredProducts =
    useMemo(() => {
      const search =
        keyword
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchKeyword =
            !search ||
            String(
              product.name ||
              ""
            )
              .toLowerCase()
              .includes(
                search
              ) ||
            String(
              product.brand ||
              ""
            )
              .toLowerCase()
              .includes(
                search
              ) ||
            String(
              product.id
            )
              .toLowerCase()
              .includes(
                search
              );

          const matchCategory =
            !filterCategoryId ||
            Number(
              product.categoryId
            ) ===
            Number(
              filterCategoryId
            );

          return (
            matchKeyword &&
            matchCategory
          );
        }
      );
    }, [
      products,
      keyword,
      filterCategoryId,
    ]);

  // ================================
  // RESET CREATE FORM
  // ================================
  const resetCreateForm =
    () => {
      setName("");
      setDescription("");
      setPrice("");
      setStockQuantity("");
      setBrand("");
      setCategoryId("");
    };

  // ================================
  // CREATE PRODUCT
  // ================================
  const handleCreateProduct =
    async (e) => {
      e.preventDefault();

      setMessage("");
      setError("");

      if (
        !name.trim() ||
        !price ||
        stockQuantity ===
        "" ||
        !categoryId
      ) {
        setError(
          "Vui lòng nhập đầy đủ thông tin bắt buộc."
        );

        return;
      }

      if (
        Number(price) <= 0
      ) {
        setError(
          "Giá sản phẩm phải lớn hơn 0."
        );

        return;
      }

      if (
        Number(
          stockQuantity
        ) < 0
      ) {
        setError(
          "Tồn kho không được âm."
        );

        return;
      }

      try {
        setCreating(
          true
        );

        await axiosClient.post(
          "/api/products",
          {
            name:
              name.trim(),

            description:
              description.trim(),

            price:
              Number(price),

            stockQuantity:
              Number(
                stockQuantity
              ),

            imageUrl:
              null,

            brand:
              brand.trim(),

            categoryId:
              Number(
                categoryId
              ),
          }
        );

        setMessage(
          "Thêm sản phẩm thành công."
        );

        resetCreateForm();

        setShowCreateForm(
          false
        );

        await loadProducts();
      } catch (err) {
        console.error(
          "CREATE PRODUCT THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể thêm sản phẩm."
        );
      } finally {
        setCreating(
          false
        );
      }
    };

  // ================================
  // OPEN EDIT
  // ================================
  const handleEdit = (
    product
  ) => {
    const stock =
      Number(
        product.stockQuantity ||
        0
      );

    let status =
      String(
        product.status ||
        "ACTIVE"
      ).toUpperCase();

    // Sản phẩm hết kho luôn
    // hiển thị OUT_OF_STOCK.
    if (stock <= 0) {
      status =
        "OUT_OF_STOCK";
    }

    // Dữ liệu cũ có thể đang
    // OUT_OF_STOCK nhưng đã có kho.
    if (
      stock > 0 &&
      status ===
      "OUT_OF_STOCK"
    ) {
      status =
        "ACTIVE";
    }

    setEditingProduct({
      id:
        product.id,

      name:
        product.name || "",

      description:
        product.description ||
        "",

      price:
        product.price || "",

      stockQuantity:
        product.stockQuantity ??
        "",

      brand:
        product.brand || "",

      categoryId:
        product.categoryId ||
        "",

      imageUrl:
        product.imageUrl ||
        null,

      status,
    });

    setMessage("");
    setError("");
  };

  // ================================
  // EDIT FIELD
  // ================================
  const handleEditChange = (
    field,
    value
  ) => {
    setEditingProduct(
      (current) => {
        if (!current) {
          return current;
        }

        // Khi sửa tồn kho,
        // trạng thái được đồng bộ
        // ngay trên giao diện.
        if (
          field ===
          "stockQuantity"
        ) {
          const newStock =
            Number(
              value || 0
            );

          let newStatus =
            current.status;

          if (
            newStock <= 0
          ) {
            newStatus =
              "OUT_OF_STOCK";
          } else if (
            newStatus ===
            "OUT_OF_STOCK"
          ) {
            newStatus =
              "ACTIVE";
          }

          return {
            ...current,

            stockQuantity:
              value,

            status:
              newStatus,
          };
        }

        return {
          ...current,

          [field]:
            value,
        };
      }
    );
  };

  // ================================
  // UPDATE PRODUCT
  // ================================
  const handleUpdateProduct =
    async (e) => {
      e.preventDefault();

      if (
        !editingProduct
      ) {
        return;
      }

      if (
        !editingProduct
          .name
          .trim() ||
        !editingProduct
          .price ||
        editingProduct
          .stockQuantity ===
        "" ||
        !editingProduct
          .categoryId
      ) {
        setError(
          "Vui lòng nhập đầy đủ thông tin bắt buộc."
        );

        return;
      }

      if (
        Number(
          editingProduct
            .price
        ) <= 0
      ) {
        setError(
          "Giá sản phẩm phải lớn hơn 0."
        );

        return;
      }

      if (
        Number(
          editingProduct
            .stockQuantity
        ) < 0
      ) {
        setError(
          "Tồn kho không được âm."
        );

        return;
      }

      const finalStock =
        Number(
          editingProduct
            .stockQuantity
        );

      let finalStatus =
        editingProduct
          .status ||
        "ACTIVE";

      // Hết hàng do tồn kho quyết định.
      if (
        finalStock <= 0
      ) {
        finalStatus =
          "OUT_OF_STOCK";
      } else if (
        finalStatus ===
        "OUT_OF_STOCK"
      ) {
        finalStatus =
          "ACTIVE";
      }

      try {
        setUpdating(
          true
        );

        setMessage("");
        setError("");

        await axiosClient.put(
          `/api/products/${editingProduct.id}`,
          {
            name:
              editingProduct
                .name
                .trim(),

            description:
              editingProduct
                .description
                ?.trim() ||
              "",

            price:
              Number(
                editingProduct
                  .price
              ),

            stockQuantity:
              finalStock,

            imageUrl:
              editingProduct
                .imageUrl,

            brand:
              editingProduct
                .brand
                ?.trim() ||
              "",

            categoryId:
              Number(
                editingProduct
                  .categoryId
              ),

            status:
              finalStatus,
          }
        );

        setMessage(
          `Cập nhật sản phẩm #${editingProduct.id} thành công.`
        );

        setEditingProduct(
          null
        );

        await loadProducts();
      } catch (err) {
        console.error(
          "UPDATE PRODUCT THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể cập nhật sản phẩm."
        );
      } finally {
        setUpdating(
          false
        );
      }
    };

  // ================================
  // DELETE PRODUCT
  // ================================
  const handleDeleteProduct =
    async (product) => {
      const confirmed =
        window.confirm(
          `Bạn có chắc muốn xóa "${product.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          product.id
        );

        setMessage("");
        setError("");

        await axiosClient.delete(
          `/api/products/${product.id}`
        );

        setMessage(
          `Đã xóa sản phẩm #${product.id}.`
        );

        await loadProducts();
      } catch (err) {
        console.error(
          "DELETE PRODUCT THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể xóa sản phẩm."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  // ================================
  // UPLOAD IMAGE
  // ================================
  const handleUploadImage =
    async (
      productId,
      file
    ) => {
      if (!file) {
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      try {
        setUploadingId(
          productId
        );

        setMessage("");
        setError("");

        await axiosClient.post(
          `/api/products/${productId}/image`,
          formData
        );

        setMessage(
          `Cập nhật ảnh sản phẩm #${productId} thành công.`
        );

        await loadProducts();
      } catch (err) {
        console.error(
          "UPLOAD IMAGE THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể upload ảnh."
        );
      } finally {
        setUploadingId(
          null
        );
      }
    };

  // ================================
  // STOCK CLASS
  // ================================
  const getStockClass = (
    stock
  ) => {
    const number =
      Number(
        stock || 0
      );

    if (
      number <= 0
    ) {
      return "out";
    }

    if (
      number <= 5
    ) {
      return "low";
    }

    return "good";
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="vb-admin-empty">
        Đang tải quản lý sản phẩm...
      </div>
    );
  }

  return (
    <div>
      {/* =========================
          HEADING
      ========================= */}
      <div className="vb-admin-product-heading">
        <div className="vb-admin-page-heading">
          <h2>
            Quản trị sản phẩm
          </h2>

          <p>
            Quản lý sản phẩm, giá bán,
            tồn kho, trạng thái và hình ảnh.
          </p>
        </div>

        <button
          type="button"
          className="vb-admin-add-product-btn"
          onClick={() => {
            setShowCreateForm(
              (current) =>
                !current
            );

            setEditingProduct(
              null
            );

            setMessage("");
            setError("");
          }}
        >
          {showCreateForm
            ? "Đóng"
            : "+ Thêm sản phẩm"}
        </button>
      </div>

      {/* =========================
          MESSAGE
      ========================= */}
      {message && (
        <div className="vb-admin-alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="vb-admin-alert error">
          {error}
        </div>
      )}

      {/* =========================
          CREATE FORM
      ========================= */}
      {showCreateForm && (
        <section className="vb-admin-product-form-panel">
          <div className="vb-admin-product-form-title">
            <div>
              <h3>
                Thêm sản phẩm mới
              </h3>

              <p>
                Nhập thông tin sản phẩm.
                Ảnh có thể tải lên sau khi
                tạo.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              handleCreateProduct
            }
          >
            <div className="vb-admin-product-form-grid">
              <div className="vb-admin-form-group">
                <label>
                  Tên sản phẩm
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target
                        .value
                    )
                  }
                  placeholder="Ví dụ: Nike Mercurial Vapor"
                  required
                />
              </div>

              <div className="vb-admin-form-group">
                <label>
                  Thương hiệu
                </label>

                <input
                  type="text"
                  value={brand}
                  onChange={(e) =>
                    setBrand(
                      e.target
                        .value
                    )
                  }
                  placeholder="Nike, Adidas..."
                />
              </div>

              <div className="vb-admin-form-group">
                <label>
                  Giá bán
                  <span>*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target
                        .value
                    )
                  }
                  placeholder="2590000"
                  required
                />
              </div>

              <div className="vb-admin-form-group">
                <label>
                  Tồn kho
                  <span>*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    stockQuantity
                  }
                  onChange={(e) =>
                    setStockQuantity(
                      e.target
                        .value
                    )
                  }
                  placeholder="20"
                  required
                />

                {Number(
                  stockQuantity
                ) === 0 &&
                  stockQuantity !==
                  "" && (
                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "6px",
                        color:
                          "#dc2626",
                      }}
                    >
                      Tồn kho bằng 0:
                      sản phẩm sẽ ở trạng
                      thái Hết hàng.
                    </small>
                  )}
              </div>

              <div className="vb-admin-form-group">
                <label>
                  Danh mục
                  <span>*</span>
                </label>

                <select
                  value={
                    categoryId
                  }
                  onChange={(e) =>
                    setCategoryId(
                      e.target
                        .value
                    )
                  }
                  required
                >
                  <option value="">
                    -- Chọn danh mục --
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="vb-admin-form-group vb-admin-form-full">
                <label>
                  Mô tả
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target
                        .value
                    )
                  }
                  placeholder="Mô tả sản phẩm..."
                  rows="4"
                />
              </div>
            </div>

            <div className="vb-admin-product-form-actions">
              <button
                type="button"
                className="vb-admin-secondary-btn"
                onClick={() => {
                  setShowCreateForm(
                    false
                  );

                  resetCreateForm();
                }}
              >
                Hủy
              </button>

              <button
                type="submit"
                className="vb-admin-primary-btn"
                disabled={
                  creating
                }
              >
                {creating
                  ? "Đang thêm..."
                  : "Thêm sản phẩm"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* =========================
          TOOLBAR
      ========================= */}
      <div className="vb-admin-product-toolbar">
        <div className="vb-admin-product-search">
          <input
            type="text"
            value={keyword}
            onChange={(e) =>
              setKeyword(
                e.target.value
              )
            }
            placeholder="Tìm theo ID, tên sản phẩm, thương hiệu..."
          />
        </div>

        <div className="vb-admin-product-filter">
          <select
            value={
              filterCategoryId
            }
            onChange={(e) =>
              setFilterCategoryId(
                e.target.value
              )
            }
          >
            <option value="">
              Tất cả danh mục
            </option>

            {categories.map(
              (category) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>

          {(keyword ||
            filterCategoryId) && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");

                  setFilterCategoryId(
                    ""
                  );
                }}
              >
                Xóa lọc
              </button>
            )}
        </div>
      </div>

      {/* =========================
          PRODUCT TABLE
      ========================= */}
      <section className="vb-admin-panel">
        <div className="vb-admin-panel-heading">
          <h3>
            DANH SÁCH SẢN PHẨM
          </h3>

          <span className="vb-admin-panel-count">
            {
              filteredProducts.length
            }{" "}
            sản phẩm
          </span>
        </div>

        <div className="vb-admin-panel-body">
          {filteredProducts.length ===
            0 ? (
            <div className="vb-admin-empty">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <div className="vb-admin-product-table-wrapper">
              <table className="vb-admin-table vb-admin-product-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ảnh</th>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (
                      product
                    ) => {
                      const status =
                        getProductStatus(
                          product
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                        >
                          {/* ID */}
                          <td>
                            <strong>
                              #
                              {
                                product.id
                              }
                            </strong>
                          </td>

                          {/* IMAGE */}
                          <td>
                            <div className="vb-admin-product-image">
                              {product.imageUrl ? (
                                <img
                                  src={getImageUrl(
                                    product.imageUrl
                                  )}
                                  alt={
                                    product.name
                                  }
                                />
                              ) : (
                                <div className="vb-admin-product-no-image">
                                  No image
                                </div>
                              )}
                            </div>
                          </td>

                          {/* PRODUCT */}
                          <td>
                            <div className="vb-admin-product-name">
                              <strong>
                                {
                                  product.name
                                }
                              </strong>

                              <span>
                                {product.brand ||
                                  "Chưa có thương hiệu"}
                              </span>
                            </div>
                          </td>

                          {/* CATEGORY */}
                          <td>
                            {getCategoryName(
                              product
                            )}
                          </td>

                          {/* PRICE */}
                          <td>
                            <strong className="vb-admin-product-price">
                              {formatPrice(
                                product.price
                              )}
                            </strong>
                          </td>

                          {/* STOCK */}
                          <td>
                            <span
                              className={`vb-admin-stock ${getStockClass(
                                product.stockQuantity
                              )}`}
                            >
                              {
                                product.stockQuantity
                              }
                            </span>
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={`vb-admin-product-status ${getStatusClass(
                                status
                              )}`}
                            >
                              {getStatusLabel(
                                status
                              )}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td>
                            <div className="vb-admin-product-actions">
                              <button
                                type="button"
                                className="vb-admin-product-edit-btn"
                                onClick={() =>
                                  handleEdit(
                                    product
                                  )
                                }
                              >
                                Sửa
                              </button>

                              <label
                                className={`vb-admin-product-image-btn ${uploadingId ===
                                    product.id
                                    ? "disabled"
                                    : ""
                                  }`}
                              >
                                {uploadingId ===
                                  product.id
                                  ? "Đang tải..."
                                  : "Ảnh"}

                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={
                                    uploadingId ===
                                    product.id
                                  }
                                  onChange={(e) => {
                                    const file =
                                      e
                                        .target
                                        .files?.[0];

                                    handleUploadImage(
                                      product.id,
                                      file
                                    );

                                    e.target.value =
                                      "";
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                className="vb-admin-product-delete-btn"
                                disabled={
                                  deletingId ===
                                  product.id
                                }
                                onClick={() =>
                                  handleDeleteProduct(
                                    product
                                  )
                                }
                              >
                                {deletingId ===
                                  product.id
                                  ? "..."
                                  : "Xóa"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* =========================
          EDIT MODAL
      ========================= */}
      {editingProduct && (
        <div
          className="vb-admin-product-modal-backdrop"
          onMouseDown={() =>
            setEditingProduct(
              null
            )
          }
        >
          <div
            className="vb-admin-product-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="vb-admin-product-modal-header">
              <div>
                <h3>
                  Sửa sản phẩm #
                  {
                    editingProduct.id
                  }
                </h3>

                <p>
                  Cập nhật thông tin,
                  tồn kho và trạng thái sản phẩm.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingProduct(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleUpdateProduct
              }
            >
              <div className="vb-admin-product-form-grid">
                {/* NAME */}
                <div className="vb-admin-form-group">
                  <label>
                    Tên sản phẩm
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={
                      editingProduct
                        .name
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "name",
                        e.target
                          .value
                      )
                    }
                    required
                  />
                </div>

                {/* BRAND */}
                <div className="vb-admin-form-group">
                  <label>
                    Thương hiệu
                  </label>

                  <input
                    type="text"
                    value={
                      editingProduct
                        .brand
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "brand",
                        e.target
                          .value
                      )
                    }
                  />
                </div>

                {/* PRICE */}
                <div className="vb-admin-form-group">
                  <label>
                    Giá bán
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      editingProduct
                        .price
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "price",
                        e.target
                          .value
                      )
                    }
                    required
                  />
                </div>

                {/* STOCK */}
                <div className="vb-admin-form-group">
                  <label>
                    Tồn kho
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      editingProduct
                        .stockQuantity
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "stockQuantity",
                        e.target
                          .value
                      )
                    }
                    required
                  />

                  {Number(
                    editingProduct
                      .stockQuantity
                  ) <= 0 && (
                      <small
                        style={{
                          display:
                            "block",
                          marginTop:
                            "6px",
                          color:
                            "#dc2626",
                          fontSize:
                            "11px",
                        }}
                      >
                        Tồn kho bằng 0 nên
                        trạng thái được tự động
                        chuyển thành Hết hàng.
                      </small>
                    )}
                </div>

                {/* CATEGORY */}
                <div className="vb-admin-form-group">
                  <label>
                    Danh mục
                    <span>*</span>
                  </label>

                  <select
                    value={
                      editingProduct
                        .categoryId
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "categoryId",
                        e.target
                          .value
                      )
                    }
                    required
                  >
                    <option value="">
                      -- Chọn danh mục --
                    </option>

                    {categories.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* STATUS */}
                <div className="vb-admin-form-group">
                  <label>
                    Trạng thái
                  </label>

                  <select
                    value={
                      editingProduct
                        .status
                    }
                    disabled={
                      Number(
                        editingProduct
                          .stockQuantity
                      ) <= 0
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "status",
                        e.target
                          .value
                      )
                    }
                  >
                    <option value="ACTIVE">
                      Đang kinh doanh
                    </option>

                    <option value="INACTIVE">
                      Ngừng kinh doanh
                    </option>

                    {Number(
                      editingProduct
                        .stockQuantity
                    ) <= 0 && (
                        <option value="OUT_OF_STOCK">
                          Hết hàng
                        </option>
                      )}
                  </select>

                  {Number(
                    editingProduct
                      .stockQuantity
                  ) > 0 && (
                      <small
                        style={{
                          display:
                            "block",
                          marginTop:
                            "6px",
                          color:
                            "#64748b",
                          fontSize:
                            "11px",
                        }}
                      >
                        Admin có thể bật hoặc
                        ngừng kinh doanh sản phẩm.
                      </small>
                    )}
                </div>

                {/* DESCRIPTION */}
                <div className="vb-admin-form-group vb-admin-form-full">
                  <label>
                    Mô tả
                  </label>

                  <textarea
                    rows="5"
                    value={
                      editingProduct
                        .description
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "description",
                        e.target
                          .value
                      )
                    }
                  />
                </div>
              </div>

              <div className="vb-admin-product-form-actions">
                <button
                  type="button"
                  className="vb-admin-secondary-btn"
                  onClick={() =>
                    setEditingProduct(
                      null
                    )
                  }
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="vb-admin-primary-btn"
                  disabled={
                    updating
                  }
                >
                  {updating
                    ? "Đang lưu..."
                    : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;