import {
    useEffect,
    useMemo,
    useState,
} from "react";
import axiosClient from "../api/axiosClient";

const EMPTY_FORM = {
    code: "",
    name: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    startAt: "",
    endAt: "",
    status: "ACTIVE",
};

function AdminPromotionsPage() {
    const [promotions, setPromotions] =
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

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [typeFilter, setTypeFilter] =
        useState("ALL");

    // ================================
    // CREATE
    // ================================
    const [
        showCreateForm,
        setShowCreateForm,
    ] = useState(false);

    const [createForm, setCreateForm] =
        useState({
            ...EMPTY_FORM,
        });

    const [creating, setCreating] =
        useState(false);

    // ================================
    // EDIT
    // ================================
    const [
        editingPromotion,
        setEditingPromotion,
    ] = useState(null);

    const [updating, setUpdating] =
        useState(false);

    const [
        deletingId,
        setDeletingId,
    ] = useState(null);

    // ================================
    // FORMAT
    // ================================
    const formatMoney = (value) =>
        Number(value || 0).toLocaleString(
            "vi-VN"
        ) + " đ";

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        return new Date(
            value
        ).toLocaleString("vi-VN");
    };

    const toDateTimeLocal = (
        value
    ) => {
        if (!value) {
            return "";
        }

        return String(value).slice(
            0,
            16
        );
    };

    const getDiscountText = (
        promotion
    ) => {
        if (
            promotion.discountType ===
            "PERCENT"
        ) {
            return `${Number(
                promotion.discountValue || 0
            )}%`;
        }

        return formatMoney(
            promotion.discountValue
        );
    };

    const getTypeLabel = (type) => {
        if (type === "PERCENT") {
            return "Phần trăm";
        }

        if (type === "FIXED") {
            return "Số tiền";
        }

        return type || "—";
    };

    const getStatusLabel = (
        status
    ) => {
        if (status === "ACTIVE") {
            return "Đang hoạt động";
        }

        if (status === "INACTIVE") {
            return "Ngừng hoạt động";
        }

        return status || "—";
    };

    // ================================
    // LOAD
    // ================================
    const loadPromotions =
        async () => {
            try {
                setError("");

                const response =
                    await axiosClient.get(
                        "/api/admin/promotions"
                    );

                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                setPromotions(
                    [...data].sort(
                        (a, b) =>
                            Number(b.id) -
                            Number(a.id)
                    )
                );
            } catch (err) {
                console.error(
                    "LOAD PROMOTIONS THAT BAI:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể tải danh sách khuyến mãi."
                );
            }
        };

    useEffect(() => {
        const loadData =
            async () => {
                try {
                    setLoading(true);

                    await loadPromotions();
                } finally {
                    setLoading(false);
                }
            };

        loadData();
    }, []);

    // ================================
    // FILTER
    // ================================
    const filteredPromotions =
        useMemo(() => {
            const search =
                keyword
                    .trim()
                    .toLowerCase();

            return promotions.filter(
                (promotion) => {
                    const matchKeyword =
                        !search ||
                        String(
                            promotion.id
                        ).includes(search) ||
                        String(
                            promotion.code || ""
                        )
                            .toLowerCase()
                            .includes(search) ||
                        String(
                            promotion.name || ""
                        )
                            .toLowerCase()
                            .includes(search);

                    const matchStatus =
                        statusFilter ===
                        "ALL" ||
                        promotion.status ===
                        statusFilter;

                    const matchType =
                        typeFilter === "ALL" ||
                        promotion.discountType ===
                        typeFilter;

                    return (
                        matchKeyword &&
                        matchStatus &&
                        matchType
                    );
                }
            );
        }, [
            promotions,
            keyword,
            statusFilter,
            typeFilter,
        ]);

    // ================================
    // COUNTS
    // ================================
    const activeCount =
        promotions.filter(
            (item) =>
                item.status === "ACTIVE"
        ).length;

    const inactiveCount =
        promotions.filter(
            (item) =>
                item.status ===
                "INACTIVE"
        ).length;

    // ================================
    // CREATE FORM CHANGE
    // ================================
    const handleCreateChange = (
        field,
        value
    ) => {
        setCreateForm(
            (current) => ({
                ...current,

                [field]: value,
            })
        );
    };

    // ================================
    // VALIDATE
    // ================================
    const validateForm = (
        form
    ) => {
        if (
            !String(
                form.code
            ).trim()
        ) {
            return "Vui lòng nhập mã khuyến mãi.";
        }

        if (
            !String(
                form.name
            ).trim()
        ) {
            return "Vui lòng nhập tên khuyến mãi.";
        }

        const discountValue =
            Number(
                form.discountValue
            );

        if (
            !discountValue ||
            discountValue <= 0
        ) {
            return "Giá trị giảm phải lớn hơn 0.";
        }

        if (
            form.discountType ===
            "PERCENT" &&
            discountValue > 100
        ) {
            return "Khuyến mãi phần trăm không được vượt quá 100%.";
        }

        if (
            Number(
                form.minOrderAmount ||
                0
            ) < 0
        ) {
            return "Giá trị đơn tối thiểu không hợp lệ.";
        }

        if (
            form.maxDiscountAmount &&
            Number(
                form.maxDiscountAmount
            ) < 0
        ) {
            return "Giảm tối đa không hợp lệ.";
        }

        if (
            form.startAt &&
            form.endAt &&
            new Date(form.startAt) >=
            new Date(form.endAt)
        ) {
            return "Thời gian kết thúc phải sau thời gian bắt đầu.";
        }

        return "";
    };

    // ================================
    // BUILD REQUEST
    // ================================
    const buildRequest = (
        form
    ) => {
        return {
            code:
                String(
                    form.code
                )
                    .trim()
                    .toUpperCase(),

            name:
                String(
                    form.name
                ).trim(),

            description:
                String(
                    form.description || ""
                ).trim(),

            discountType:
                form.discountType,

            discountValue:
                Number(
                    form.discountValue
                ),

            minOrderAmount:
                form.minOrderAmount ===
                    ""
                    ? 0
                    : Number(
                        form.minOrderAmount
                    ),

            maxDiscountAmount:
                form.maxDiscountAmount ===
                    ""
                    ? null
                    : Number(
                        form.maxDiscountAmount
                    ),

            startAt:
                form.startAt || null,

            endAt:
                form.endAt || null,

            status:
                form.status,
        };
    };

    // ================================
    // CREATE
    // ================================
    const handleCreate =
        async (e) => {
            e.preventDefault();

            const validationError =
                validateForm(
                    createForm
                );

            if (validationError) {
                setError(
                    validationError
                );

                return;
            }

            try {
                setCreating(true);

                setMessage("");
                setError("");

                await axiosClient.post(
                    "/api/admin/promotions",
                    buildRequest(
                        createForm
                    )
                );

                setMessage(
                    `Đã tạo mã khuyến mãi ${createForm.code
                        .trim()
                        .toUpperCase()} thành công.`
                );

                setCreateForm({
                    ...EMPTY_FORM,
                });

                setShowCreateForm(
                    false
                );

                await loadPromotions();
            } catch (err) {
                console.error(
                    "CREATE PROMOTION THAT BAI:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể tạo khuyến mãi."
                );
            } finally {
                setCreating(false);
            }
        };

    // ================================
    // OPEN EDIT
    // ================================
    const handleEdit = (
        promotion
    ) => {
        setEditingPromotion({
            id:
                promotion.id,

            code:
                promotion.code || "",

            name:
                promotion.name || "",

            description:
                promotion.description ||
                "",

            discountType:
                promotion.discountType ||
                "PERCENT",

            discountValue:
                promotion.discountValue ??
                "",

            minOrderAmount:
                promotion.minOrderAmount ??
                "",

            maxDiscountAmount:
                promotion.maxDiscountAmount ??
                "",

            startAt:
                toDateTimeLocal(
                    promotion.startAt
                ),

            endAt:
                toDateTimeLocal(
                    promotion.endAt
                ),

            status:
                promotion.status ||
                "ACTIVE",
        });

        setMessage("");
        setError("");
    };

    const handleEditChange = (
        field,
        value
    ) => {
        setEditingPromotion(
            (current) => ({
                ...current,

                [field]: value,
            })
        );
    };

    // ================================
    // UPDATE
    // ================================
    const handleUpdate =
        async (e) => {
            e.preventDefault();

            if (!editingPromotion) {
                return;
            }

            const validationError =
                validateForm(
                    editingPromotion
                );

            if (validationError) {
                setError(
                    validationError
                );

                return;
            }

            try {
                setUpdating(true);

                setMessage("");
                setError("");

                await axiosClient.put(
                    `/api/admin/promotions/${editingPromotion.id}`,
                    buildRequest(
                        editingPromotion
                    )
                );

                setMessage(
                    `Cập nhật khuyến mãi #${editingPromotion.id} thành công.`
                );

                setEditingPromotion(
                    null
                );

                await loadPromotions();
            } catch (err) {
                console.error(
                    "UPDATE PROMOTION THAT BAI:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể cập nhật khuyến mãi."
                );
            } finally {
                setUpdating(false);
            }
        };

    // ================================
    // DELETE
    // ================================
    const handleDelete =
        async (promotion) => {
            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa mã "${promotion.code}"?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setDeletingId(
                    promotion.id
                );

                setMessage("");
                setError("");

                await axiosClient.delete(
                    `/api/admin/promotions/${promotion.id}`
                );

                setMessage(
                    `Đã xóa mã ${promotion.code}.`
                );

                await loadPromotions();
            } catch (err) {
                console.error(
                    "DELETE PROMOTION THAT BAI:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể xóa khuyến mãi."
                );
            } finally {
                setDeletingId(null);
            }
        };

    if (loading) {
        return (
            <div className="vb-admin-empty">
                Đang tải khuyến mãi...
            </div>
        );
    }

    return (
        <div>
            {/* =========================
          HEADER
      ========================= */}
            <div className="vb-admin-promotion-heading">
                <div className="vb-admin-page-heading">
                    <h2>
                        Quản lý khuyến mãi
                    </h2>

                    <p>
                        Tạo mã giảm giá, thiết lập
                        điều kiện và thời gian áp dụng.
                    </p>
                </div>

                <button
                    type="button"
                    className="vb-admin-add-promotion-btn"
                    onClick={() => {
                        setShowCreateForm(
                            (current) =>
                                !current
                        );

                        setEditingPromotion(
                            null
                        );

                        setMessage("");
                        setError("");
                    }}
                >
                    {showCreateForm
                        ? "Đóng"
                        : "+ Thêm khuyến mãi"}
                </button>
            </div>

            {/* MESSAGE */}
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
          STATS
      ========================= */}
            <div className="vb-admin-promotion-stats">
                <div>
                    <span>
                        Tổng khuyến mãi
                    </span>

                    <strong>
                        {promotions.length}
                    </strong>
                </div>

                <div>
                    <span>
                        Đang hoạt động
                    </span>

                    <strong>
                        {activeCount}
                    </strong>
                </div>

                <div>
                    <span>
                        Ngừng hoạt động
                    </span>

                    <strong>
                        {inactiveCount}
                    </strong>
                </div>
            </div>

            {/* =========================
          CREATE FORM
      ========================= */}
            {showCreateForm && (
                <section className="vb-admin-promotion-form-panel">
                    <div className="vb-admin-promotion-form-title">
                        <h3>
                            Thêm khuyến mãi mới
                        </h3>

                        <p>
                            Thiết lập mã, mức giảm và
                            điều kiện áp dụng.
                        </p>
                    </div>

                    <PromotionForm
                        form={createForm}
                        onChange={
                            handleCreateChange
                        }
                        categories={null}
                    />

                    <div className="vb-admin-product-form-actions">
                        <button
                            type="button"
                            className="vb-admin-secondary-btn"
                            onClick={() => {
                                setShowCreateForm(
                                    false
                                );

                                setCreateForm({
                                    ...EMPTY_FORM,
                                });
                            }}
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            className="vb-admin-primary-btn"
                            disabled={creating}
                            onClick={
                                handleCreate
                            }
                        >
                            {creating
                                ? "Đang tạo..."
                                : "Tạo khuyến mãi"}
                        </button>
                    </div>
                </section>
            )}

            {/* =========================
          FILTER
      ========================= */}
            <div className="vb-admin-promotion-toolbar">
                <div className="vb-admin-promotion-search">
                    <input
                        type="text"
                        placeholder="Tìm ID, mã hoặc tên khuyến mãi..."
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="vb-admin-promotion-filters">
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            Tất cả trạng thái
                        </option>

                        <option value="ACTIVE">
                            Đang hoạt động
                        </option>

                        <option value="INACTIVE">
                            Ngừng hoạt động
                        </option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) =>
                            setTypeFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            Tất cả loại giảm
                        </option>

                        <option value="PERCENT">
                            Phần trăm
                        </option>

                        <option value="FIXED">
                            Số tiền
                        </option>
                    </select>

                    {(keyword ||
                        statusFilter !==
                        "ALL" ||
                        typeFilter !==
                        "ALL") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setKeyword("");
                                    setStatusFilter(
                                        "ALL"
                                    );
                                    setTypeFilter(
                                        "ALL"
                                    );
                                }}
                            >
                                Xóa lọc
                            </button>
                        )}
                </div>
            </div>

            {/* =========================
          TABLE
      ========================= */}
            <section className="vb-admin-panel">
                <div className="vb-admin-panel-heading">
                    <h3>
                        DANH SÁCH KHUYẾN MÃI
                    </h3>

                    <span className="vb-admin-panel-count">
                        {filteredPromotions.length} mã
                    </span>
                </div>

                <div className="vb-admin-panel-body">
                    {filteredPromotions.length ===
                        0 ? (
                        <div className="vb-admin-empty">
                            Không tìm thấy khuyến mãi phù hợp.
                        </div>
                    ) : (
                        <div className="vb-admin-promotion-table-wrapper">
                            <table className="vb-admin-table vb-admin-promotion-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Mã</th>
                                        <th>
                                            Tên khuyến mãi
                                        </th>
                                        <th>
                                            Loại
                                        </th>
                                        <th>
                                            Giá trị giảm
                                        </th>
                                        <th>
                                            Đơn tối thiểu
                                        </th>
                                        <th>
                                            Giảm tối đa
                                        </th>
                                        <th>
                                            Thời gian
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
                                    {filteredPromotions.map(
                                        (
                                            promotion
                                        ) => (
                                            <tr
                                                key={
                                                    promotion.id
                                                }
                                            >
                                                <td>
                                                    <strong>
                                                        #
                                                        {
                                                            promotion.id
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="vb-admin-promotion-code">
                                                        {
                                                            promotion.code
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="vb-admin-promotion-name">
                                                        <strong>
                                                            {
                                                                promotion.name
                                                            }
                                                        </strong>

                                                        {promotion.description && (
                                                            <span>
                                                                {
                                                                    promotion.description
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="vb-admin-promotion-type">
                                                        {getTypeLabel(
                                                            promotion.discountType
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="vb-admin-promotion-value">
                                                        {getDiscountText(
                                                            promotion
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {Number(
                                                        promotion.minOrderAmount ||
                                                        0
                                                    ) > 0
                                                        ? formatMoney(
                                                            promotion.minOrderAmount
                                                        )
                                                        : "Không yêu cầu"}
                                                </td>

                                                <td>
                                                    {promotion.maxDiscountAmount
                                                        ? formatMoney(
                                                            promotion.maxDiscountAmount
                                                        )
                                                        : "Không giới hạn"}
                                                </td>

                                                <td>
                                                    <div className="vb-admin-promotion-dates">
                                                        <span>
                                                            Từ:{" "}
                                                            {formatDate(
                                                                promotion.startAt
                                                            )}
                                                        </span>

                                                        <span>
                                                            Đến:{" "}
                                                            {formatDate(
                                                                promotion.endAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`vb-admin-promotion-status ${String(
                                                            promotion.status ||
                                                            ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {getStatusLabel(
                                                            promotion.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="vb-admin-promotion-actions">
                                                        <button
                                                            type="button"
                                                            className="edit"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    promotion
                                                                )
                                                            }
                                                        >
                                                            Sửa
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete"
                                                            disabled={
                                                                deletingId ===
                                                                promotion.id
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    promotion
                                                                )
                                                            }
                                                        >
                                                            {deletingId ===
                                                                promotion.id
                                                                ? "..."
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
            {editingPromotion && (
                <div
                    className="vb-admin-promotion-modal-backdrop"
                    onMouseDown={() =>
                        setEditingPromotion(
                            null
                        )
                    }
                >
                    <div
                        className="vb-admin-promotion-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="vb-admin-promotion-modal-header">
                            <div>
                                <h3>
                                    Sửa khuyến mãi #
                                    {
                                        editingPromotion.id
                                    }
                                </h3>

                                <p>
                                    {
                                        editingPromotion.code
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingPromotion(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>
                        </div>

                        <PromotionForm
                            form={
                                editingPromotion
                            }
                            onChange={
                                handleEditChange
                            }
                        />

                        <div className="vb-admin-product-form-actions">
                            <button
                                type="button"
                                className="vb-admin-secondary-btn"
                                onClick={() =>
                                    setEditingPromotion(
                                        null
                                    )
                                }
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                className="vb-admin-primary-btn"
                                disabled={updating}
                                onClick={
                                    handleUpdate
                                }
                            >
                                {updating
                                    ? "Đang lưu..."
                                    : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// =================================
// FORM DUNG CHUNG CREATE / EDIT
// =================================
function PromotionForm({
    form,
    onChange,
}) {
    return (
        <div className="vb-admin-promotion-form-grid">
            <div className="vb-admin-form-group">
                <label>
                    Mã khuyến mãi
                    <span>*</span>
                </label>

                <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                        onChange(
                            "code",
                            e.target.value.toUpperCase()
                        )
                    }
                    placeholder="WELCOME10"
                    required
                />
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Tên khuyến mãi
                    <span>*</span>
                </label>

                <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                        onChange(
                            "name",
                            e.target.value
                        )
                    }
                    placeholder="Giảm 10% đơn đầu tiên"
                    required
                />
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Loại giảm
                    <span>*</span>
                </label>

                <select
                    value={
                        form.discountType
                    }
                    onChange={(e) =>
                        onChange(
                            "discountType",
                            e.target.value
                        )
                    }
                >
                    <option value="PERCENT">
                        Giảm theo phần trăm
                    </option>

                    <option value="FIXED">
                        Giảm số tiền cố định
                    </option>
                </select>
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Giá trị giảm
                    <span>*</span>
                </label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={
                        form.discountType ===
                            "PERCENT"
                            ? 100
                            : undefined
                    }
                    value={
                        form.discountValue
                    }
                    onChange={(e) =>
                        onChange(
                            "discountValue",
                            e.target.value
                        )
                    }
                    placeholder={
                        form.discountType ===
                            "PERCENT"
                            ? "10"
                            : "200000"
                    }
                    required
                />

                <small>
                    {form.discountType ===
                        "PERCENT"
                        ? "Ví dụ: 10 = giảm 10%"
                        : "Ví dụ: 200000 = giảm 200.000 đ"}
                </small>
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Giá trị đơn tối thiểu
                </label>

                <input
                    type="number"
                    min="0"
                    step="1000"
                    value={
                        form.minOrderAmount
                    }
                    onChange={(e) =>
                        onChange(
                            "minOrderAmount",
                            e.target.value
                        )
                    }
                    placeholder="1000000"
                />
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Giảm tối đa
                </label>

                <input
                    type="number"
                    min="0"
                    step="1000"
                    value={
                        form.maxDiscountAmount
                    }
                    onChange={(e) =>
                        onChange(
                            "maxDiscountAmount",
                            e.target.value
                        )
                    }
                    placeholder="300000"
                />

                <small>
                    Để trống nếu không giới hạn.
                </small>
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Bắt đầu
                </label>

                <input
                    type="datetime-local"
                    value={
                        form.startAt
                    }
                    onChange={(e) =>
                        onChange(
                            "startAt",
                            e.target.value
                        )
                    }
                />
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Kết thúc
                </label>

                <input
                    type="datetime-local"
                    value={
                        form.endAt
                    }
                    onChange={(e) =>
                        onChange(
                            "endAt",
                            e.target.value
                        )
                    }
                />
            </div>

            <div className="vb-admin-form-group">
                <label>
                    Trạng thái
                </label>

                <select
                    value={form.status}
                    onChange={(e) =>
                        onChange(
                            "status",
                            e.target.value
                        )
                    }
                >
                    <option value="ACTIVE">
                        Đang hoạt động
                    </option>

                    <option value="INACTIVE">
                        Ngừng hoạt động
                    </option>
                </select>
            </div>

            <div className="vb-admin-form-group vb-admin-form-full">
                <label>
                    Mô tả
                </label>

                <textarea
                    rows="4"
                    value={
                        form.description
                    }
                    onChange={(e) =>
                        onChange(
                            "description",
                            e.target.value
                        )
                    }
                    placeholder="Mô tả chương trình khuyến mãi..."
                />
            </div>
        </div>
    );
}

export default AdminPromotionsPage;