import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function AdminProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form them moi
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Product dang sua
  const [editingProduct, setEditingProduct] =
    useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ================================
  // LOAD PRODUCTS
  // ================================
  const loadProducts = async () => {
    try {
      const response = await axiosClient.get(
        "/api/products?page=0&size=100&sortBy=id&direction=desc"
      );

      setProducts(response.data.content || []);
    } catch (error) {
      console.error(
        "LOAD PRODUCTS THAT BAI:",
        error
      );

      setMessage(
        "Khong the tai danh sach san pham"
      );
    }
  };

  // ================================
  // LOAD CATEGORIES
  // ================================
  const loadCategories = async () => {
    try {
      const response = await axiosClient.get(
        "/api/categories"
      );

      setCategories(response.data);
    } catch (error) {
      console.error(
        "LOAD CATEGORIES THAT BAI:",
        error
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProducts(),
        loadCategories(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ================================
  // THEM PRODUCT
  // ================================
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.post(
        "/api/products",
        {
          name,
          description,
          price: Number(price),
          stockQuantity: Number(stockQuantity),
          imageUrl: null,
          brand,
          categoryId: Number(categoryId),
        }
      );

      setMessage(
        "Them san pham thanh cong"
      );

      setName("");
      setDescription("");
      setPrice("");
      setStockQuantity("");
      setBrand("");
      setCategoryId("");

      await loadProducts();

    } catch (error) {
      console.error(
        "CREATE PRODUCT THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the them san pham"
      );
    }
  };

  // ================================
  // BAT DAU SUA PRODUCT
  // ================================
  const handleEdit = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stockQuantity: product.stockQuantity ?? "",
      brand: product.brand || "",
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || null,
    });

    setMessage("");
  };

  // ================================
  // THAY DOI FORM SUA
  // ================================
  const handleEditChange = (
    field,
    value
  ) => {
    setEditingProduct((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ================================
  // LUU PRODUCT
  // ================================
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.put(
        `/api/products/${editingProduct.id}`,
        {
          name: editingProduct.name,
          description:
            editingProduct.description,
          price: Number(
            editingProduct.price
          ),
          stockQuantity: Number(
            editingProduct.stockQuantity
          ),
          imageUrl:
            editingProduct.imageUrl,
          brand: editingProduct.brand,
          categoryId: Number(
            editingProduct.categoryId
          ),
        }
      );

      setMessage(
        `Cap nhat san pham #${editingProduct.id} thanh cong`
      );

      setEditingProduct(null);

      await loadProducts();

    } catch (error) {
      console.error(
        "UPDATE PRODUCT THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the cap nhat san pham"
      );
    }
  };

  // ================================
  // XOA PRODUCT
  // ================================
  const handleDeleteProduct = async (
    product
  ) => {
    const confirmed = window.confirm(
      `Ban co chac muon xoa "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.delete(
        `/api/products/${product.id}`
      );

      setMessage(
        `Da xoa san pham #${product.id}`
      );

      await loadProducts();

    } catch (error) {
      console.error(
        "DELETE PRODUCT THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the xoa san pham"
      );
    }
  };
  const handleUploadImage = async (
  productId,
  file
) => {
  if (!file) {
    return;
  }

  const formData = new FormData();

  formData.append("file", file);

  try {
    await axiosClient.post(
      `/api/products/${productId}/image`,
      formData
    );

    setMessage(
      `Upload anh san pham #${productId} thanh cong`
    );

    await loadProducts();

  } catch (error) {
    console.error(
      "UPLOAD IMAGE THAT BAI:",
      error
    );

    setMessage(
      error.response?.data?.message ||
      "Khong the upload anh"
    );
  }
};

  if (loading) {
    return (
      <p>Dang tai quan ly san pham...</p>
    );
  }

  return (
    <div>
      <h1>Quan ly san pham</h1>

      <button
        onClick={() =>
          navigate("/admin")
        }
      >
        Quay lai Admin
      </button>

      {message && (
        <p>{message}</p>
      )}

      <hr />

      {/* ========================= */}
      {/* FORM THEM PRODUCT */}
      {/* ========================= */}

      <h2>Them san pham</h2>

      <form onSubmit={handleCreateProduct}>
        <div>
          <label>Ten san pham</label>
          <br />

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Mo ta</label>
          <br />

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />
        </div>

        <br />

        <div>
          <label>Gia</label>
          <br />

          <input
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Ton kho</label>
          <br />

          <input
            type="number"
            value={stockQuantity}
            onChange={(e) =>
              setStockQuantity(
                e.target.value
              )
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Thuong hieu</label>
          <br />

          <input
            type="text"
            value={brand}
            onChange={(e) =>
              setBrand(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Danh muc</label>
          <br />

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
            required
          >
            <option value="">
              -- Chon danh muc --
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>

        <br />

        <button type="submit">
          Them san pham
        </button>
      </form>

      <hr />

      {/* ========================= */}
      {/* FORM SUA PRODUCT */}
      {/* ========================= */}

      {editingProduct && (
        <>
          <h2>
            Sua san pham #
            {editingProduct.id}
          </h2>

          <form
            onSubmit={
              handleUpdateProduct
            }
          >
            <div>
              <label>
                Ten san pham
              </label>
              <br />

              <input
                type="text"
                value={
                  editingProduct.name
                }
                onChange={(e) =>
                  handleEditChange(
                    "name",
                    e.target.value
                  )
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Mo ta</label>
              <br />

              <textarea
                value={
                  editingProduct.description
                }
                onChange={(e) =>
                  handleEditChange(
                    "description",
                    e.target.value
                  )
                }
              />
            </div>

            <br />

            <div>
              <label>Gia</label>
              <br />

              <input
                type="number"
                value={
                  editingProduct.price
                }
                onChange={(e) =>
                  handleEditChange(
                    "price",
                    e.target.value
                  )
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Ton kho</label>
              <br />

              <input
                type="number"
                value={
                  editingProduct.stockQuantity
                }
                onChange={(e) =>
                  handleEditChange(
                    "stockQuantity",
                    e.target.value
                  )
                }
                required
              />
            </div>

                       <br />

            <div>
              <label>Thuong hieu</label>
              <br />

              <input
                type="text"
                value={editingProduct.brand}
                onChange={(e) =>
                  handleEditChange(
                    "brand",
                    e.target.value
                  )
                }
              />
            </div>

            <br />

            <div>
              <label>Danh muc</label>
              <br />

              <select
                value={editingProduct.categoryId}
                onChange={(e) =>
                  handleEditChange(
                    "categoryId",
                    e.target.value
                  )
                }
                required
              >
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <br />

            <button type="submit">
              Luu thay doi
            </button>

            {" "}

            <button
              type="button"
              onClick={() =>
                setEditingProduct(null)
              }
            >
              Huy
            </button>
          </form>

          <hr />
        </>
      )}

      {/* ========================= */}
      {/* DANH SACH PRODUCT */}
      {/* ========================= */}

      <h2>Danh sach san pham</h2>

      {products.length === 0 ? (
        <p>Chua co san pham.</p>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>
              #{product.id}
              {" - "}
              {product.name}
            </h3>

            <p>
              Danh muc: {product.categoryName}
            </p>

            <p>
              Thuong hieu: {product.brand}
            </p>

            <p>
              Gia:{" "}
              {Number(
                product.price
              ).toLocaleString("vi-VN")}{" "}
              VND
            </p>

            <p>
              Ton kho: {product.stockQuantity}
            </p>

            <p>
              Trang thai: {product.status}
            </p>
              {product.imageUrl && (
                <div>
                    <img
                    src={
                        `${import.meta.env.VITE_API_URL}${product.imageUrl}`
                    }
                    alt={product.name}
                    style={{
                        width: "180px",
                        height: "180px",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                    }}
                    />

                    <br />
                    <br />
                </div>
                )}

                <label>
                Anh san pham:
                </label>

                <br />

                <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                    handleUploadImage(
                    product.id,
                    e.target.files?.[0]
                    )
                }
                />

                <br />
                <br />
            <button
              onClick={() =>
                handleEdit(product)
              }
            >
              Sua
            </button>

            {" "}

            <button
              onClick={() =>
                handleDeleteProduct(product)
              }
            >
              Xoa
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminProductsPage;