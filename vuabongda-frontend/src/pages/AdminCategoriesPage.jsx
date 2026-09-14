import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function AdminCategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ================================
  // LOAD CATEGORY
  // ================================
  const loadCategories = async () => {
    try {
      const response = await axiosClient.get(
        "/api/categories"
      );

      setCategories(response.data);

      console.log(
        "LOAD CATEGORY THANH CONG:",
        response.data
      );

    } catch (error) {
      console.error(
        "LOAD CATEGORY THAT BAI:",
        error
      );

      setMessage(
        "Khong the tai danh muc"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ================================
  // THEM CATEGORY
  // ================================
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.post(
        "/api/categories",
        {
          name,
          description,
        }
      );

      setMessage(
        "Them danh muc thanh cong"
      );

      setName("");
      setDescription("");

      await loadCategories();

    } catch (error) {
      console.error(
        "CREATE CATEGORY THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the them danh muc"
      );
    }
  };

  // ================================
  // CHON CATEGORY DE SUA
  // ================================
  const handleEdit = (category) => {
    setEditingCategory({
      id: category.id,
      name: category.name || "",
      description:
        category.description || "",
    });

    setMessage("");
  };

  // ================================
  // LUU CATEGORY
  // ================================
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.put(
        `/api/categories/${editingCategory.id}`,
        {
          name: editingCategory.name,
          description:
            editingCategory.description,
        }
      );

      setMessage(
        `Cap nhat danh muc #${editingCategory.id} thanh cong`
      );

      setEditingCategory(null);

      await loadCategories();

    } catch (error) {
      console.error(
        "UPDATE CATEGORY THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the cap nhat danh muc"
      );
    }
  };

  // ================================
  // XOA CATEGORY
  // ================================
  const handleDelete = async (
    category
  ) => {
    const confirmed = window.confirm(
      `Ban co chac muon xoa danh muc "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.delete(
        `/api/categories/${category.id}`
      );

      setMessage(
        `Da xoa danh muc #${category.id}`
      );

      await loadCategories();

    } catch (error) {
      console.error(
        "DELETE CATEGORY THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the xoa danh muc"
      );
    }
  };

  if (loading) {
    return (
      <p>Dang tai danh muc...</p>
    );
  }

  return (
    <div>
      <h1>Quan ly danh muc</h1>

      <button
        onClick={() =>
          navigate("/admin")
        }
      >
        Quay lai Admin
      </button>

      <br />
      <br />

      {message && (
        <p>{message}</p>
      )}

      <hr />

      {/* ======================== */}
      {/* THEM CATEGORY */}
      {/* ======================== */}

      <h2>Them danh muc</h2>

      <form onSubmit={handleCreate}>
        <div>
          <label>
            Ten danh muc
          </label>

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
          <label>
            Mo ta
          </label>

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

        <button type="submit">
          Them danh muc
        </button>
      </form>

      <hr />

      {/* ======================== */}
      {/* SUA CATEGORY */}
      {/* ======================== */}

      {editingCategory && (
        <>
          <h2>
            Sua danh muc #
            {editingCategory.id}
          </h2>

          <form
            onSubmit={handleUpdate}
          >
            <div>
              <label>
                Ten danh muc
              </label>

              <br />

              <input
                type="text"
                value={
                  editingCategory.name
                }
                onChange={(e) =>
                  setEditingCategory(
                    {
                      ...editingCategory,
                      name:
                        e.target.value,
                    }
                  )
                }
                required
              />
            </div>

            <br />

            <div>
              <label>
                Mo ta
              </label>

              <br />

              <textarea
                value={
                  editingCategory.description
                }
                onChange={(e) =>
                  setEditingCategory(
                    {
                      ...editingCategory,
                      description:
                        e.target.value,
                    }
                  )
                }
              />
            </div>

            <br />

            <button type="submit">
              Luu thay doi
            </button>

            {" "}

            <button
              type="button"
              onClick={() =>
                setEditingCategory(null)
              }
            >
              Huy
            </button>
          </form>

          <hr />
        </>
      )}

      {/* ======================== */}
      {/* DANH SACH CATEGORY */}
      {/* ======================== */}

      <h2>Danh sach danh muc</h2>

      {categories.length === 0 ? (
        <p>Chua co danh muc.</p>
      ) : (
        categories.map(
          (category) => (
            <div
              key={category.id}
              style={{
                border:
                  "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>
                #{category.id}
                {" - "}
                {category.name}
              </h3>

              <p>
                Mo ta:{" "}
                {category.description}
              </p>

              <p>
                Trang thai:{" "}
                {category.status}
              </p>

              <button
                onClick={() =>
                  handleEdit(category)
                }
              >
                Sua
              </button>

              {" "}

              <button
                onClick={() =>
                  handleDelete(
                    category
                  )
                }
              >
                Xoa
              </button>
            </div>
          )
        )
      )}
    </div>
  );
}

export default AdminCategoriesPage;