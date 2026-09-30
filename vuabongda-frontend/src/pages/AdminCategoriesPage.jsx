import {
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosClient from "../api/axiosClient";

function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [keyword, setKeyword] =
    useState("");

  // ================================
  // CREATE
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

  const [creating, setCreating] =
    useState(false);

  // ================================
  // EDIT
  // ================================
  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);

  const [updating, setUpdating] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  // ================================
  // LOAD CATEGORY
  // ================================
  const loadCategories =
    async () => {
      try {
        setError("");

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
          "LOAD CATEGORY THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể tải danh mục."
        );
      }
    };

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(true);

          await loadCategories();
        } finally {
          setLoading(false);
        }
      };

    loadData();
  }, []);

  // ================================
  // FILTER
  // ================================
  const filteredCategories =
    useMemo(() => {
      const search =
        keyword
          .trim()
          .toLowerCase();

      if (!search) {
        return categories;
      }

      return categories.filter(
        (category) =>
          String(
            category.id
          ).includes(search) ||
          String(
            category.name || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            category.description ||
            ""
          )
            .toLowerCase()
            .includes(search)
      );
    }, [categories, keyword]);

  // ================================
  // RESET CREATE
  // ================================
  const resetCreateForm = () => {
    setName("");
    setDescription("");
  };

  // ================================
  // CREATE CATEGORY
  // ================================
  const handleCreate =
    async (e) => {
      e.preventDefault();

      const trimmedName =
        name.trim();

      if (!trimmedName) {
        setError(
          "Tên danh mục không được để trống."
        );

        return;
      }

      try {
        setCreating(true);

        setMessage("");
        setError("");

        await axiosClient.post(
          "/api/categories",
          {
            name:
              trimmedName,

            description:
              description.trim(),
          }
        );

        setMessage(
          "Thêm danh mục thành công."
        );

        resetCreateForm();

        setShowCreateForm(false);

        await loadCategories();
      } catch (err) {
        console.error(
          "CREATE CATEGORY THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể thêm danh mục."
        );
      } finally {
        setCreating(false);
      }
    };

  // ================================
  // OPEN EDIT
  // ================================
  const handleEdit = (
    category
  ) => {
    setEditingCategory({
      id:
        category.id,

      name:
        category.name || "",

      description:
        category.description ||
        "",

      status:
        category.status,
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
    setEditingCategory(
      (current) => ({
        ...current,

        [field]: value,
      })
    );
  };

  // ================================
  // UPDATE CATEGORY
  // ================================
  const handleUpdate =
    async (e) => {
      e.preventDefault();

      if (!editingCategory) {
        return;
      }

      const trimmedName =
        editingCategory.name.trim();

      if (!trimmedName) {
        setError(
          "Tên danh mục không được để trống."
        );

        return;
      }

      try {
        setUpdating(true);

        setMessage("");
        setError("");

        await axiosClient.put(
          `/api/categories/${editingCategory.id}`,
          {
            name:
              trimmedName,

            description:
              editingCategory.description.trim(),
          }
        );

        setMessage(
          `Cập nhật danh mục #${editingCategory.id} thành công.`
        );

        setEditingCategory(
          null
        );

        await loadCategories();
      } catch (err) {
        console.error(
          "UPDATE CATEGORY THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể cập nhật danh mục."
        );
      } finally {
        setUpdating(false);
      }
    };

  // ================================
  // DELETE CATEGORY
  // ================================
  const handleDelete =
    async (category) => {
      const confirmed =
        window.confirm(
          `Bạn có chắc muốn xóa danh mục "${category.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          category.id
        );

        setMessage("");
        setError("");

        await axiosClient.delete(
          `/api/categories/${category.id}`
        );

        setMessage(
          `Đã xóa danh mục #${category.id}.`
        );

        await loadCategories();
      } catch (err) {
        console.error(
          "DELETE CATEGORY THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          "Không thể xóa danh mục. Danh mục có thể đang chứa sản phẩm."
        );
      } finally {
        setDeletingId(null);
      }
    };

  // ================================
  // STATUS
  // ================================
  const getStatusLabel = (
    status
  ) => {
    if (!status) {
      return "—";
    }

    const normalized =
      String(
        status
      ).toUpperCase();

    if (
      normalized === "ACTIVE"
    ) {
      return "Đang hoạt động";
    }

    if (
      normalized === "INACTIVE"
    ) {
      return "Ngừng hoạt động";
    }

    return status;
  };

  if (loading) {
    return (
      <div className="vb-admin-empty">
        Đang tải danh mục...
      </div>
    );
  }

  return (
    <div>
      {/* =========================
          HEADING
      ========================= */}
      <div className="vb-admin-category-heading">
        <div className="vb-admin-page-heading">
          <h2>
            Quản trị danh mục
          </h2>

          <p>
            Quản lý các nhóm sản phẩm
            của VuaBongDa.
          </p>
        </div>

        <button
          type="button"
          className="vb-admin-add-category-btn"
          onClick={() => {
            setShowCreateForm(
              (current) =>
                !current
            );

            setEditingCategory(
              null
            );

            setMessage("");
            setError("");
          }}
        >
          {showCreateForm
            ? "Đóng"
            : "+ Thêm danh mục"}
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
        <section className="vb-admin-category-form-panel">
          <div className="vb-admin-category-form-title">
            <h3>
              Thêm danh mục mới
            </h3>

            <p>
              Nhập thông tin danh mục sản phẩm.
            </p>
          </div>

          <form
            onSubmit={
              handleCreate
            }
          >
            <div className="vb-admin-category-form-grid">
              <div className="vb-admin-form-group">
                <label>
                  Tên danh mục
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Ví dụ: Giày bóng đá"
                  required
                />
              </div>

              <div className="vb-admin-form-group vb-admin-form-full">
                <label>
                  Mô tả
                </label>

                <textarea
                  rows="4"
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Mô tả ngắn về danh mục..."
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
                disabled={creating}
              >
                {creating
                  ? "Đang thêm..."
                  : "Thêm danh mục"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* =========================
          SEARCH
      ========================= */}
      <div className="vb-admin-category-toolbar">
        <div className="vb-admin-category-search">
          <input
            type="text"
            value={keyword}
            onChange={(e) =>
              setKeyword(
                e.target.value
              )
            }
            placeholder="Tìm ID, tên danh mục, mô tả..."
          />
        </div>

        {keyword && (
          <button
            type="button"
            className="vb-admin-category-clear"
            onClick={() =>
              setKeyword("")
            }
          >
            Xóa tìm kiếm
          </button>
        )}
      </div>

      {/* =========================
          LIST
      ========================= */}
      <section className="vb-admin-panel">
        <div className="vb-admin-panel-heading">
          <h3>
            DANH SÁCH DANH MỤC
          </h3>

          <span className="vb-admin-panel-count">
            {filteredCategories.length} danh mục
          </span>
        </div>

        <div className="vb-admin-panel-body">
          {filteredCategories.length ===
            0 ? (
            <div className="vb-admin-empty">
              Không tìm thấy danh mục phù hợp.
            </div>
          ) : (
            <div className="vb-admin-category-table-wrapper">
              <table className="vb-admin-table vb-admin-category-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>
                      Tên danh mục
                    </th>
                    <th>
                      Mô tả
                    </th>
                    <th>
                      Trạng thái
                    </th>
                    <th>
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={
                          category.id
                        }
                      >
                        <td>
                          <strong>
                            #
                            {
                              category.id
                            }
                          </strong>
                        </td>

                        <td>
                          <strong className="vb-admin-category-name">
                            {
                              category.name
                            }
                          </strong>
                        </td>

                        <td>
                          <div className="vb-admin-category-description">
                            {category.description ||
                              "Chưa có mô tả"}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`vb-admin-category-status ${String(
                              category.status ||
                              ""
                            ).toLowerCase()}`}
                          >
                            {getStatusLabel(
                              category.status
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="vb-admin-category-actions">
                            <button
                              type="button"
                              className="vb-admin-category-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  category
                                )
                              }
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              className="vb-admin-category-delete-btn"
                              disabled={
                                deletingId ===
                                category.id
                              }
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                            >
                              {deletingId ===
                                category.id
                                ? "Đang xóa..."
                                : "Xóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
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
      {editingCategory && (
        <div
          className="vb-admin-category-modal-backdrop"
          onMouseDown={() =>
            setEditingCategory(
              null
            )
          }
        >
          <div
            className="vb-admin-category-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="vb-admin-category-modal-header">
              <div>
                <h3>
                  Sửa danh mục #
                  {
                    editingCategory.id
                  }
                </h3>

                <p>
                  Cập nhật tên và mô tả danh mục.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingCategory(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleUpdate
              }
            >
              <div className="vb-admin-category-form-grid">
                <div className="vb-admin-form-group">
                  <label>
                    Tên danh mục
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={
                      editingCategory.name
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

                <div className="vb-admin-form-group vb-admin-form-full">
                  <label>
                    Mô tả
                  </label>

                  <textarea
                    rows="5"
                    value={
                      editingCategory.description
                    }
                    onChange={(e) =>
                      handleEditChange(
                        "description",
                        e.target.value
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
                    setEditingCategory(
                      null
                    )
                  }
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="vb-admin-primary-btn"
                  disabled={updating}
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

export default AdminCategoriesPage;