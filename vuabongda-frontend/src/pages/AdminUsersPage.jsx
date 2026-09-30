import {
    useEffect,
    useMemo,
    useState,
} from "react";
import axiosClient from "../api/axiosClient";

function AdminUsersPage() {
    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [keyword, setKeyword] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("ALL");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");

    const [
        updatingUserId,
        setUpdatingUserId,
    ] = useState(null);

    // Tai khoan admin dang dang nhap
    const currentUserId =
        Number(
            localStorage.getItem(
                "vb_userId"
            )
        );

    const currentUsername =
        localStorage.getItem(
            "vb_username"
        );

    // ================================
    // FORMAT DATE
    // ================================
    const formatDate = (
        value
    ) => {
        if (!value) {
            return "—";
        }

        return new Date(
            value
        ).toLocaleString(
            "vi-VN"
        );
    };

    // ================================
    // ROLE LABEL
    // ================================
    const getRoleLabel = (
        role
    ) => {
        if (role === "ADMIN") {
            return "Quản trị viên";
        }

        if (
            role === "CUSTOMER"
        ) {
            return "Khách hàng";
        }

        return role || "—";
    };

    // ================================
    // STATUS LABEL
    // ================================
    const getStatusLabel = (
        status
    ) => {
        if (
            status === "ACTIVE"
        ) {
            return "Đang hoạt động";
        }

        if (
            status === "INACTIVE"
        ) {
            return "Đã khóa";
        }

        return status || "—";
    };

    // ================================
    // LOAD USERS
    // ================================
    const loadUsers =
        async () => {
            try {
                setError("");

                const response =
                    await axiosClient.get(
                        "/api/admin/users"
                    );

                const data =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];

                setUsers(data);
            } catch (err) {
                console.error(
                    "LOAD USERS THAT BAI:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể tải danh sách tài khoản."
                );
            }
        };

    useEffect(() => {
        const loadData =
            async () => {
                try {
                    setLoading(true);

                    await loadUsers();
                } finally {
                    setLoading(false);
                }
            };

        loadData();
    }, []);

    // ================================
    // FILTER
    // ================================
    const filteredUsers =
        useMemo(() => {
            const search =
                keyword
                    .trim()
                    .toLowerCase();

            return users.filter(
                (user) => {
                    const matchSearch =
                        !search ||
                        String(user.id)
                            .includes(search) ||
                        String(
                            user.username ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        String(
                            user.email || ""
                        )
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        String(
                            user.fullName ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        String(
                            user.phone || ""
                        )
                            .toLowerCase()
                            .includes(
                                search
                            );

                    const matchRole =
                        roleFilter ===
                        "ALL" ||
                        user.role ===
                        roleFilter;

                    const matchStatus =
                        statusFilter ===
                        "ALL" ||
                        user.status ===
                        statusFilter;

                    return (
                        matchSearch &&
                        matchRole &&
                        matchStatus
                    );
                }
            );
        }, [
            users,
            keyword,
            roleFilter,
            statusFilter,
        ]);

    // ================================
    // COUNTS
    // ================================
    const customerCount =
        users.filter(
            (user) =>
                user.role ===
                "CUSTOMER"
        ).length;

    const adminCount =
        users.filter(
            (user) =>
                user.role ===
                "ADMIN"
        ).length;

    const activeCount =
        users.filter(
            (user) =>
                user.status ===
                "ACTIVE"
        ).length;

    const inactiveCount =
        users.filter(
            (user) =>
                user.status ===
                "INACTIVE"
        ).length;

    // ================================
    // CURRENT USER?
    // ================================
    const isCurrentUser = (
        user
    ) =>
        Number(user.id) ===
        currentUserId;

    // ================================
    // UPDATE STATUS
    // ================================
    const handleToggleStatus =
        async (user) => {
            if (
                isCurrentUser(
                    user
                )
            ) {
                setError(
                    "Bạn không thể tự khóa tài khoản đang đăng nhập."
                );

                return;
            }

            const newStatus =
                user.status ===
                    "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE";

            const actionText =
                newStatus ===
                    "INACTIVE"
                    ? "khóa"
                    : "mở khóa";

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn ${actionText} tài khoản "${user.username}"?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setUpdatingUserId(
                    user.id
                );

                setMessage("");
                setError("");

                const response =
                    await axiosClient.put(
                        `/api/admin/users/${user.id}/status`,
                        {
                            status:
                                newStatus,
                        }
                    );

                setUsers(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                    user.id
                                    ? response.data
                                    : item
                        )
                );

                setMessage(
                    newStatus ===
                        "INACTIVE"
                        ? `Đã khóa tài khoản ${user.username}.`
                        : `Đã mở khóa tài khoản ${user.username}.`
                );
            } catch (err) {
                console.error(
                    "UPDATE USER STATUS THAT BAI:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể cập nhật trạng thái tài khoản."
                );
            } finally {
                setUpdatingUserId(
                    null
                );
            }
        };

    // ================================
    // UPDATE ROLE
    // ================================
    const handleRoleChange =
        async (
            user,
            newRole
        ) => {
            if (
                newRole ===
                user.role
            ) {
                return;
            }

            if (
                isCurrentUser(
                    user
                )
            ) {
                setError(
                    "Bạn không thể tự thay đổi quyền của tài khoản đang đăng nhập."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Đổi quyền tài khoản "${user.username}" từ "${getRoleLabel(
                        user.role
                    )}" sang "${getRoleLabel(
                        newRole
                    )}"?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setUpdatingUserId(
                    user.id
                );

                setMessage("");
                setError("");

                const response =
                    await axiosClient.put(
                        `/api/admin/users/${user.id}/role`,
                        {
                            role:
                                newRole,
                        }
                    );

                setUsers(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                    user.id
                                    ? response.data
                                    : item
                        )
                );

                setMessage(
                    `Đã cập nhật quyền của ${user.username} thành ${getRoleLabel(
                        newRole
                    )}.`
                );
            } catch (err) {
                console.error(
                    "UPDATE USER ROLE THAT BAI:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể cập nhật quyền tài khoản."
                );
            } finally {
                setUpdatingUserId(
                    null
                );
            }
        };

    if (loading) {
        return (
            <div className="vb-admin-empty">
                Đang tải danh sách tài khoản...
            </div>
        );
    }

    return (
        <div>
            {/* HEADER */}
            <div className="vb-admin-page-heading">
                <h2>
                    Quản lý tài khoản
                </h2>

                <p>
                    Quản lý quyền và trạng thái
                    tài khoản người dùng.
                </p>
            </div>

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

            {/* CURRENT ADMIN */}
            <div className="vb-admin-current-account">
                Đang đăng nhập:
                <strong>
                    {currentUsername ||
                        "Admin"}
                </strong>

                <span>
                    Tài khoản này không thể
                    tự khóa hoặc tự hạ quyền.
                </span>
            </div>

            {/* STATS */}
            <div className="vb-admin-user-stats">
                <div>
                    <span>
                        Tổng tài khoản
                    </span>

                    <strong>
                        {users.length}
                    </strong>
                </div>

                <div>
                    <span>
                        Khách hàng
                    </span>

                    <strong>
                        {customerCount}
                    </strong>
                </div>

                <div>
                    <span>
                        Admin
                    </span>

                    <strong>
                        {adminCount}
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
                        Đã khóa
                    </span>

                    <strong>
                        {inactiveCount}
                    </strong>
                </div>
            </div>

            {/* FILTER */}
            <div className="vb-admin-user-toolbar">
                <div className="vb-admin-user-search">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(
                                e.target.value
                            )
                        }
                        placeholder="Tìm username, họ tên, email, SĐT..."
                    />
                </div>

                <div className="vb-admin-user-filters">
                    <select
                        value={
                            roleFilter
                        }
                        onChange={(e) =>
                            setRoleFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            Tất cả vai trò
                        </option>

                        <option value="CUSTOMER">
                            Khách hàng
                        </option>

                        <option value="ADMIN">
                            Admin
                        </option>
                    </select>

                    <select
                        value={
                            statusFilter
                        }
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
                            Đã khóa
                        </option>
                    </select>

                    {(keyword ||
                        roleFilter !==
                        "ALL" ||
                        statusFilter !==
                        "ALL") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setKeyword("");

                                    setRoleFilter(
                                        "ALL"
                                    );

                                    setStatusFilter(
                                        "ALL"
                                    );
                                }}
                            >
                                Xóa lọc
                            </button>
                        )}
                </div>
            </div>

            {/* TABLE */}
            <section className="vb-admin-panel">
                <div className="vb-admin-panel-heading">
                    <h3>
                        DANH SÁCH TÀI KHOẢN
                    </h3>

                    <span className="vb-admin-panel-count">
                        {filteredUsers.length} tài khoản
                    </span>
                </div>

                <div className="vb-admin-panel-body">
                    {filteredUsers.length ===
                        0 ? (
                        <div className="vb-admin-empty">
                            Không tìm thấy tài khoản phù hợp.
                        </div>
                    ) : (
                        <div className="vb-admin-user-table-wrapper">
                            <table className="vb-admin-table vb-admin-user-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>
                                            Tài khoản
                                        </th>
                                        <th>
                                            Họ tên
                                        </th>
                                        <th>
                                            Liên hệ
                                        </th>
                                        <th>
                                            Vai trò
                                        </th>
                                        <th>
                                            Trạng thái
                                        </th>
                                        <th>
                                            Ngày tạo
                                        </th>
                                        <th>
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map(
                                        (user) => {
                                            const self =
                                                isCurrentUser(
                                                    user
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        user.id
                                                    }
                                                    className={
                                                        self
                                                            ? "vb-admin-user-self-row"
                                                            : ""
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            #
                                                            {
                                                                user.id
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <div className="vb-admin-user-account">
                                                            <strong>
                                                                {
                                                                    user.username
                                                                }
                                                            </strong>

                                                            {self && (
                                                                <span className="vb-admin-you-badge">
                                                                    Bạn
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {user.fullName ||
                                                            "—"}
                                                    </td>

                                                    <td>
                                                        <div className="vb-admin-user-contact">
                                                            <span>
                                                                {user.email ||
                                                                    "—"}
                                                            </span>

                                                            <span>
                                                                {user.phone ||
                                                                    "Chưa có SĐT"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* ROLE */}
                                                    <td>
                                                        {self ? (
                                                            <span
                                                                className={`vb-admin-user-role ${String(
                                                                    user.role ||
                                                                    ""
                                                                ).toLowerCase()}`}
                                                            >
                                                                {getRoleLabel(
                                                                    user.role
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <select
                                                                className="vb-admin-user-role-select"
                                                                value={
                                                                    user.role
                                                                }
                                                                disabled={
                                                                    updatingUserId ===
                                                                    user.id
                                                                }
                                                                onChange={(e) =>
                                                                    handleRoleChange(
                                                                        user,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >
                                                                <option value="CUSTOMER">
                                                                    Khách hàng
                                                                </option>

                                                                <option value="ADMIN">
                                                                    Quản trị viên
                                                                </option>
                                                            </select>
                                                        )}
                                                    </td>

                                                    {/* STATUS */}
                                                    <td>
                                                        <span
                                                            className={`vb-admin-user-status ${String(
                                                                user.status ||
                                                                ""
                                                            ).toLowerCase()}`}
                                                        >
                                                            {getStatusLabel(
                                                                user.status
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </td>

                                                    {/* ACTION */}
                                                    <td>
                                                        {self ? (
                                                            <span className="vb-admin-self-protected">
                                                                Tài khoản hiện tại
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className={
                                                                    user.status ===
                                                                        "ACTIVE"
                                                                        ? "vb-admin-lock-user-btn"
                                                                        : "vb-admin-unlock-user-btn"
                                                                }
                                                                disabled={
                                                                    updatingUserId ===
                                                                    user.id
                                                                }
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                {updatingUserId ===
                                                                    user.id
                                                                    ? "Đang xử lý..."
                                                                    : user.status ===
                                                                        "ACTIVE"
                                                                        ? "Khóa"
                                                                        : "Mở khóa"}
                                                            </button>
                                                        )}
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

            <div className="vb-admin-user-note">
                <strong>
                    Lưu ý:
                </strong>{" "}
                tài khoản không bị xóa khỏi hệ
                thống. Khi khóa, trạng thái được
                chuyển thành{" "}
                <code>
                    INACTIVE
                </code>{" "}
                và người dùng sẽ không thể đăng
                nhập.
            </div>
        </div>
    );
}

export default AdminUsersPage;