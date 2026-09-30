import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosClient from "../api/axiosClient";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

// Luong trang thai hop le
const STATUS_TRANSITIONS = {
  PENDING: [
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "SHIPPING",
    "CANCELLED",
  ],

  SHIPPING: [
    "COMPLETED",
  ],

  COMPLETED: [],

  CANCELLED: [],
};

function getAllowedStatuses(status) {
  return (
    STATUS_TRANSITIONS[status] || []
  );
}

function AdminOrdersPage() {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [keyword, setKeyword] =
    useState("");

  const [
    expandedOrderId,
    setExpandedOrderId,
  ] = useState(null);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  // ================================
  // BULK UPDATE
  // ================================
  const [
    selectedOrderIds,
    setSelectedOrderIds,
  ] = useState([]);

  const [
    bulkStatus,
    setBulkStatus,
  ] = useState("");

  const [
    bulkUpdating,
    setBulkUpdating,
  ] = useState(false);

  // ================================
  // FORMAT PRICE
  // ================================
  const formatPrice = (value) =>
    Number(value || 0).toLocaleString(
      "vi-VN"
    ) + " đ";

  // ================================
  // FORMAT DATE
  // ================================
  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    return new Date(
      value
    ).toLocaleString("vi-VN");
  };

  // ================================
  // STATUS LABEL
  // ================================
  const getStatusLabel = (status) =>
    STATUS_LABELS[status] || status;

  // ================================
  // STATUS CLASS
  // ================================
  const getStatusClass = (status) =>
    `vb-admin-status ${String(
      status || ""
    ).toLowerCase()}`;

  // ================================
  // CO THE CAP NHAT KHONG
  // ================================
  const canUpdateOrder = (order) =>
    getAllowedStatuses(
      order.status
    ).length > 0;

  // ================================
  // LOAD ORDERS
  // ================================
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosClient.get(
          "/api/admin/orders"
        );

      const data =
        Array.isArray(response.data)
          ? response.data
          : [];

      setOrders(
        data.map((order) => ({
          ...order,
          selectedStatus:
            order.status,
        }))
      );
    } catch (err) {
      console.error(
        "ADMIN GET ORDERS THAT BAI:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể tải danh sách đơn hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ================================
  // FILTER
  // ================================
  const filteredOrders =
    useMemo(() => {
      const search =
        keyword
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const matchStatus =
            statusFilter === "ALL" ||
            order.status ===
            statusFilter;

          const matchKeyword =
            !search ||
            String(order.id)
              .toLowerCase()
              .includes(search) ||
            String(
              order.recipientName ||
              ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              order.phone || ""
            )
              .toLowerCase()
              .includes(search);

          return (
            matchStatus &&
            matchKeyword
          );
        }
      );
    }, [
      orders,
      statusFilter,
      keyword,
    ]);

  // ================================
  // DON DANG HIEN THI CO THE CHON
  // ================================
  const selectableVisibleOrders =
    useMemo(
      () =>
        filteredOrders.filter(
          canUpdateOrder
        ),
      [filteredOrders]
    );

  const allVisibleSelected =
    selectableVisibleOrders.length > 0 &&
    selectableVisibleOrders.every(
      (order) =>
        selectedOrderIds.includes(
          order.id
        )
    );

  // ================================
  // CAC DON DANG DUOC CHON
  // ================================
  const selectedOrders =
    useMemo(
      () =>
        orders.filter(
          (order) =>
            selectedOrderIds.includes(
              order.id
            )
        ),
      [orders, selectedOrderIds]
    );

  // ================================
  // TIM TRANG THAI CHUNG
  // CHO BULK UPDATE
  // ================================
  const bulkAllowedStatuses =
    useMemo(() => {
      if (
        selectedOrders.length ===
        0
      ) {
        return [];
      }

      let commonStatuses = [
        ...getAllowedStatuses(
          selectedOrders[0].status
        ),
      ];

      for (
        let i = 1;
        i <
        selectedOrders.length;
        i++
      ) {
        const allowed =
          getAllowedStatuses(
            selectedOrders[i]
              .status
          );

        commonStatuses =
          commonStatuses.filter(
            (status) =>
              allowed.includes(
                status
              )
          );
      }

      return commonStatuses;
    }, [selectedOrders]);

  // ================================
  // TU DONG CHON BULK STATUS
  // ================================
  useEffect(() => {
    if (
      bulkAllowedStatuses.length >
      0
    ) {
      setBulkStatus(
        bulkAllowedStatuses[0]
      );
    } else {
      setBulkStatus("");
    }
  }, [bulkAllowedStatuses]);

  // ================================
  // COUNT STATUS
  // ================================
  const getStatusCount = (
    status
  ) => {
    if (status === "ALL") {
      return orders.length;
    }

    return orders.filter(
      (order) =>
        order.status === status
    ).length;
  };

  // ================================
  // CHON 1 DON
  // ================================
  const handleSelectOrder = (
    orderId
  ) => {
    setSelectedOrderIds(
      (current) => {
        if (
          current.includes(
            orderId
          )
        ) {
          return current.filter(
            (id) =>
              id !== orderId
          );
        }

        return [
          ...current,
          orderId,
        ];
      }
    );
  };

  // ================================
  // CHON TAT CA DON DANG HIEN
  // ================================
  const handleSelectAllVisible =
    () => {
      const visibleIds =
        selectableVisibleOrders.map(
          (order) => order.id
        );

      if (allVisibleSelected) {
        setSelectedOrderIds(
          (current) =>
            current.filter(
              (id) =>
                !visibleIds.includes(
                  id
                )
            )
        );

        return;
      }

      setSelectedOrderIds(
        (current) => [
          ...new Set([
            ...current,
            ...visibleIds,
          ]),
        ]
      );
    };

  // ================================
  // BO CHON
  // ================================
  const clearSelection = () => {
    setSelectedOrderIds([]);
  };

  // ================================
  // DOI SELECT CUA 1 DON
  // ================================
  const handleStatusChange = (
    orderId,
    newStatus
  ) => {
    setOrders(
      (currentOrders) =>
        currentOrders.map(
          (order) =>
            order.id === orderId
              ? {
                ...order,
                selectedStatus:
                  newStatus,
              }
              : order
        )
    );

    setMessage("");
    setError("");
  };

  // ================================
  // UPDATE 1 DON
  // ================================
  const handleUpdateStatus =
    async (order) => {
      const newStatus =
        order.selectedStatus ||
        order.status;

      if (
        newStatus === order.status
      ) {
        return;
      }

      // Frontend kiem tra lai
      if (
        !getAllowedStatuses(
          order.status
        ).includes(newStatus)
      ) {
        setError(
          `Không thể chuyển đơn #${order.id} từ "${getStatusLabel(
            order.status
          )}" sang "${getStatusLabel(
            newStatus
          )}".`
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Cập nhật đơn #${order.id} từ "${getStatusLabel(
            order.status
          )}" sang "${getStatusLabel(
            newStatus
          )}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingId(order.id);

        setMessage("");
        setError("");

        const response =
          await axiosClient.put(
            `/api/admin/orders/${order.id}/status`,
            {
              status:
                newStatus,
            }
          );

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (item) =>
                item.id ===
                  order.id
                  ? {
                    ...response.data,

                    selectedStatus:
                      response.data
                        .status,
                  }
                  : item
            )
        );

        setSelectedOrderIds(
          (current) =>
            current.filter(
              (id) =>
                id !== order.id
            )
        );

        setMessage(
          `Cập nhật đơn #${order.id} thành công.`
        );
      } catch (err) {
        console.error(
          "UPDATE ORDER STATUS THAT BAI:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          "Không thể cập nhật trạng thái đơn hàng."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  // ================================
  // UPDATE NHIEU DON
  // ================================
  const handleBulkUpdate =
    async () => {
      if (
        selectedOrderIds.length ===
        0
      ) {
        setError(
          "Vui lòng chọn ít nhất một đơn hàng."
        );

        return;
      }

      if (!bulkStatus) {
        setError(
          "Các đơn đã chọn không có trạng thái tiếp theo chung."
        );

        return;
      }

      const validOrders =
        selectedOrders.filter(
          (order) =>
            getAllowedStatuses(
              order.status
            ).includes(
              bulkStatus
            )
        );

      if (
        validOrders.length !==
        selectedOrders.length
      ) {
        setError(
          "Có đơn hàng không thể chuyển sang trạng thái đã chọn."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Cập nhật ${validOrders.length} đơn hàng sang "${getStatusLabel(
            bulkStatus
          )}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setBulkUpdating(true);

        setMessage("");
        setError("");

        const results =
          await Promise.allSettled(
            validOrders.map(
              (order) =>
                axiosClient.put(
                  `/api/admin/orders/${order.id}/status`,
                  {
                    status:
                      bulkStatus,
                  }
                )
            )
          );

        const successfulOrders =
          [];

        const failedOrderIds =
          [];

        results.forEach(
          (result, index) => {
            const originalOrder =
              validOrders[index];

            if (
              result.status ===
              "fulfilled"
            ) {
              successfulOrders.push(
                result.value.data
              );
            } else {
              failedOrderIds.push(
                originalOrder.id
              );

              console.error(
                `BULK UPDATE ORDER #${originalOrder.id} THAT BAI:`,
                result.reason
              );
            }
          }
        );

        // Update state local
        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                const updated =
                  successfulOrders.find(
                    (item) =>
                      item.id ===
                      order.id
                  );

                if (!updated) {
                  return order;
                }

                return {
                  ...updated,

                  selectedStatus:
                    updated.status,
                };
              }
            )
        );

        // Chi giu lai cac don bi loi
        setSelectedOrderIds(
          failedOrderIds
        );

        if (
          failedOrderIds.length ===
          0
        ) {
          setMessage(
            `Đã cập nhật thành công ${successfulOrders.length} đơn hàng sang "${getStatusLabel(
              bulkStatus
            )}".`
          );
        } else {
          setMessage(
            `Đã cập nhật ${successfulOrders.length} đơn hàng.`
          );

          setError(
            `Không thể cập nhật ${failedOrderIds.length} đơn: ${failedOrderIds
              .map(
                (id) =>
                  `#${id}`
              )
              .join(", ")}.`
          );
        }
      } finally {
        setBulkUpdating(false);
      }
    };

  // ================================
  // MO / DONG CHI TIET
  // ================================
  const toggleDetail = (
    orderId
  ) => {
    setExpandedOrderId(
      (current) =>
        current === orderId
          ? null
          : orderId
    );
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="vb-admin-empty">
        Đang tải danh sách đơn hàng...
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="vb-admin-page-heading">
        <h2>
          Quản lý đơn hàng
        </h2>

        <p>
          Theo dõi, lựa chọn và cập
          nhật trạng thái đơn hàng.
        </p>
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

      {/* FILTER */}
      <div className="vb-admin-order-toolbar">
        <div className="vb-admin-order-tabs">
          {STATUS_OPTIONS.map(
            (item) => (
              <button
                key={item.value}
                type="button"
                className={
                  statusFilter ===
                    item.value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(
                    item.value
                  )
                }
              >
                {item.label}

                <span>
                  {getStatusCount(
                    item.value
                  )}
                </span>
              </button>
            )
          )}
        </div>

        <div className="vb-admin-order-search">
          <input
            type="text"
            placeholder="Tìm mã đơn, người nhận, SĐT..."
            value={keyword}
            onChange={(e) =>
              setKeyword(
                e.target.value
              )
            }
          />
        </div>
      </div>

      {/* BULK UPDATE */}
      <div className="vb-admin-bulk-bar">
        <div className="vb-admin-bulk-left">
          <label className="vb-admin-check-label">
            <input
              type="checkbox"
              checked={
                allVisibleSelected
              }
              disabled={
                selectableVisibleOrders.length ===
                0
              }
              onChange={
                handleSelectAllVisible
              }
            />

            <span>
              Chọn tất cả
            </span>
          </label>

          <span className="vb-admin-selected-count">
            Đã chọn{" "}
            <strong>
              {
                selectedOrderIds.length
              }
            </strong>{" "}
            đơn
          </span>
        </div>

        <div className="vb-admin-bulk-actions">
          <select
            value={bulkStatus}
            disabled={
              bulkUpdating ||
              selectedOrderIds.length ===
              0 ||
              bulkAllowedStatuses.length ===
              0
            }
            onChange={(e) =>
              setBulkStatus(
                e.target.value
              )
            }
          >
            {bulkAllowedStatuses.length ===
              0 ? (
              <option value="">
                Không có trạng thái phù hợp
              </option>
            ) : (
              bulkAllowedStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {getStatusLabel(
                      status
                    )}
                  </option>
                )
              )
            )}
          </select>

          <button
            type="button"
            className="vb-admin-bulk-update"
            disabled={
              bulkUpdating ||
              selectedOrderIds.length ===
              0 ||
              !bulkStatus
            }
            onClick={
              handleBulkUpdate
            }
          >
            {bulkUpdating
              ? "Đang cập nhật..."
              : "Cập nhật đã chọn"}
          </button>

          {selectedOrderIds.length >
            0 && (
              <button
                type="button"
                className="vb-admin-clear-selection"
                disabled={
                  bulkUpdating
                }
                onClick={
                  clearSelection
                }
              >
                Bỏ chọn
              </button>
            )}
        </div>
      </div>

      {/* TABLE */}
      <section className="vb-admin-panel">
        <div className="vb-admin-panel-heading">
          <h3>
            DANH SÁCH ĐƠN HÀNG
          </h3>

          <span className="vb-admin-panel-count">
            {filteredOrders.length} đơn hàng
          </span>
        </div>

        <div className="vb-admin-panel-body">
          {filteredOrders.length ===
            0 ? (
            <div className="vb-admin-empty">
              Không tìm thấy đơn hàng phù hợp.
            </div>
          ) : (
            <div className="vb-admin-order-table-wrapper">
              <table className="vb-admin-table vb-admin-order-table">
                <thead>
                  <tr>
                    <th className="vb-admin-checkbox-column">
                      <input
                        type="checkbox"
                        checked={
                          allVisibleSelected
                        }
                        disabled={
                          selectableVisibleOrders.length ===
                          0
                        }
                        onChange={
                          handleSelectAllVisible
                        }
                      />
                    </th>

                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>SĐT</th>
                    <th>Tổng tiền</th>
                    <th>
                      Trạng thái hiện tại
                    </th>
                    <th>
                      Chuyển trạng thái
                    </th>
                    <th>
                      Ngày đặt
                    </th>
                    <th>
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map(
                    (order) => {
                      const editable =
                        canUpdateOrder(
                          order
                        );

                      const checked =
                        selectedOrderIds.includes(
                          order.id
                        );

                      const allowedStatuses =
                        getAllowedStatuses(
                          order.status
                        );

                      return (
                        <Fragment
                          key={
                            order.id
                          }
                        >
                          {/* MAIN ROW */}
                          <tr
                            className={
                              checked
                                ? "vb-admin-selected-row"
                                : ""
                            }
                          >
                            {/* CHECK */}
                            <td className="vb-admin-checkbox-column">
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                disabled={
                                  !editable ||
                                  bulkUpdating
                                }
                                onChange={() =>
                                  handleSelectOrder(
                                    order.id
                                  )
                                }
                              />
                            </td>

                            {/* ID */}
                            <td>
                              <strong>
                                #
                                {
                                  order.id
                                }
                              </strong>
                            </td>

                            {/* CUSTOMER */}
                            <td>
                              <div className="vb-admin-customer-cell">
                                <strong>
                                  {
                                    order.recipientName
                                  }
                                </strong>

                                <span>
                                  User ID:{" "}
                                  {
                                    order.userId
                                  }
                                </span>
                              </div>
                            </td>

                            {/* PHONE */}
                            <td>
                              {
                                order.phone
                              }
                            </td>

                            {/* TOTAL */}
                            <td>
                              <strong className="vb-admin-order-price">
                                {formatPrice(
                                  order.totalAmount
                                )}
                              </strong>

                              {Number(
                                order.discountAmount ||
                                0
                              ) >
                                0 && (
                                  <small className="vb-admin-order-discount">
                                    Giảm{" "}
                                    {formatPrice(
                                      order.discountAmount
                                    )}
                                  </small>
                                )}
                            </td>

                            {/* CURRENT STATUS */}
                            <td>
                              <span
                                className={getStatusClass(
                                  order.status
                                )}
                              >
                                {getStatusLabel(
                                  order.status
                                )}
                              </span>
                            </td>

                            {/* INLINE UPDATE */}
                            <td>
                              {editable ? (
                                <div className="vb-admin-inline-status">
                                  <select
                                    value={
                                      order.selectedStatus ||
                                      order.status
                                    }
                                    disabled={
                                      updatingId ===
                                      order.id ||
                                      bulkUpdating
                                    }
                                    onChange={(e) =>
                                      handleStatusChange(
                                        order.id,
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                  >
                                    {/* Trang thai hien tai */}
                                    <option
                                      value={
                                        order.status
                                      }
                                    >
                                      {getStatusLabel(
                                        order.status
                                      )}
                                    </option>

                                    {/* Chi hien trang thai hop le */}
                                    {allowedStatuses.map(
                                      (
                                        status
                                      ) => (
                                        <option
                                          key={
                                            status
                                          }
                                          value={
                                            status
                                          }
                                        >
                                          {getStatusLabel(
                                            status
                                          )}
                                        </option>
                                      )
                                    )}
                                  </select>

                                  <button
                                    type="button"
                                    disabled={
                                      updatingId ===
                                      order.id ||
                                      bulkUpdating ||
                                      (order.selectedStatus ||
                                        order.status) ===
                                      order.status
                                    }
                                    onClick={() =>
                                      handleUpdateStatus(
                                        order
                                      )
                                    }
                                  >
                                    {updatingId ===
                                      order.id
                                      ? "..."
                                      : "Lưu"}
                                  </button>
                                </div>
                              ) : (
                                <span className="vb-admin-locked-status">
                                  Đã khóa
                                </span>
                              )}
                            </td>

                            {/* DATE */}
                            <td>
                              {formatDate(
                                order.createdAt
                              )}
                            </td>

                            {/* DETAIL */}
                            <td>
                              <button
                                type="button"
                                className="vb-admin-detail-btn"
                                onClick={() =>
                                  toggleDetail(
                                    order.id
                                  )
                                }
                              >
                                {expandedOrderId ===
                                  order.id
                                  ? "Đóng"
                                  : "Chi tiết"}
                              </button>
                            </td>
                          </tr>

                          {/* DETAIL ROW */}
                          {expandedOrderId ===
                            order.id && (
                              <tr className="vb-admin-order-detail-row">
                                <td colSpan="9">
                                  <div className="vb-admin-order-detail">

                                    {/* CUSTOMER INFO */}
                                    <div className="vb-admin-order-detail-grid">
                                      <div>
                                        <span>
                                          Người nhận
                                        </span>

                                        <strong>
                                          {
                                            order.recipientName
                                          }
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          Số điện thoại
                                        </span>

                                        <strong>
                                          {
                                            order.phone
                                          }
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          Địa chỉ
                                        </span>

                                        <strong>
                                          {
                                            order.shippingAddress
                                          }
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          Ngày đặt
                                        </span>

                                        <strong>
                                          {formatDate(
                                            order.createdAt
                                          )}
                                        </strong>
                                      </div>
                                    </div>

                                    {/* PRODUCTS */}
                                    <div className="vb-admin-order-products">
                                      <h4>
                                        Sản phẩm
                                      </h4>

                                      <table>
                                        <thead>
                                          <tr>
                                            <th>
                                              Sản phẩm
                                            </th>

                                            <th>
                                              Size
                                            </th>

                                            <th>
                                              Đơn giá
                                            </th>

                                            <th>
                                              SL
                                            </th>

                                            <th>
                                              Thành tiền
                                            </th>
                                          </tr>
                                        </thead>

                                        <tbody>
                                          {(
                                            order.items ||
                                            []
                                          ).map(
                                            (
                                              item
                                            ) => (
                                              <tr
                                                key={
                                                  item.id
                                                }
                                              >
                                                <td>
                                                  {
                                                    item.productName
                                                  }
                                                </td>

                                                <td>
                                                  {item.size ||
                                                    "—"}
                                                </td>

                                                <td>
                                                  {formatPrice(
                                                    item.unitPrice
                                                  )}
                                                </td>

                                                <td>
                                                  {
                                                    item.quantity
                                                  }
                                                </td>

                                                <td>
                                                  <strong>
                                                    {formatPrice(
                                                      item.subtotal
                                                    )}
                                                  </strong>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* TOTAL */}
                                    <div className="vb-admin-order-summary">
                                      <div>
                                        <span>
                                          Tạm tính
                                        </span>

                                        <strong>
                                          {formatPrice(
                                            order.originalAmount ??
                                            order.totalAmount
                                          )}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          Khuyến mãi
                                        </span>

                                        <strong className="vb-admin-order-discount-text">
                                          {Number(
                                            order.discountAmount ||
                                            0
                                          ) > 0
                                            ? `- ${formatPrice(
                                              order.discountAmount
                                            )}`
                                            : "0 đ"}
                                        </strong>
                                      </div>

                                      {order.promotionCode && (
                                        <div>
                                          <span>
                                            Mã giảm giá
                                          </span>

                                          <strong>
                                            {
                                              order.promotionCode
                                            }
                                          </strong>
                                        </div>
                                      )}

                                      <div className="total">
                                        <span>
                                          Tổng thanh toán
                                        </span>

                                        <strong>
                                          {formatPrice(
                                            order.totalAmount
                                          )}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </Fragment>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminOrdersPage;