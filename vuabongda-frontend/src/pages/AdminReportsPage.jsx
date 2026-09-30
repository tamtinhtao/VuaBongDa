import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

const PIE_COLORS = [
    "#3c8dbc",
    "#00a65a",
    "#f39c12",
    "#dd4b39",
    "#605ca8",
];

function AdminReportsPage() {
    const today = new Date();

    const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const toDateInput = (date) => {
        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const [from, setFrom] = useState(
        toDateInput(firstDayOfMonth)
    );

    const [to, setTo] = useState(
        toDateInput(today)
    );

    const [groupBy, setGroupBy] =
        useState("DAY");

    const [report, setReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // ======================================
    // FORMAT MONEY
    // ======================================
    const formatMoney = (value) => {
        const number =
            Number(value || 0);

        return new Intl.NumberFormat(
            "vi-VN"
        ).format(number) + " đ";
    };

    // ======================================
    // FORMAT NUMBER
    // ======================================
    const formatNumber = (value) => {
        return new Intl.NumberFormat(
            "vi-VN"
        ).format(
            Number(value || 0)
        );
    };

    // ======================================
    // PAYMENT NAME
    // ======================================
    const getPaymentName = (
        method
    ) => {
        if (
            method === "COD"
        ) {
            return "Thanh toán khi nhận hàng";
        }

        if (
            method ===
            "BANK_TRANSFER"
        ) {
            return "Chuyển khoản ngân hàng";
        }

        if (
            method === "UNKNOWN"
        ) {
            return "Chưa xác định";
        }

        return method || "Chưa xác định";
    };

    // ======================================
    // LOAD REPORT
    // ======================================
    const loadReport =
        async (
            selectedFrom = from,
            selectedTo = to,
            selectedGroupBy =
                groupBy
        ) => {
            try {
                setLoading(true);
                setError("");

                if (
                    !selectedFrom ||
                    !selectedTo
                ) {
                    setError(
                        "Vui lòng chọn đầy đủ khoảng thời gian."
                    );

                    return;
                }

                if (
                    selectedFrom >
                    selectedTo
                ) {
                    setError(
                        "Ngày bắt đầu không được lớn hơn ngày kết thúc."
                    );

                    return;
                }

                const response =
                    await axiosClient.get(
                        "/api/admin/reports",
                        {
                            params: {
                                from:
                                    selectedFrom,
                                to: selectedTo,
                                groupBy:
                                    selectedGroupBy,
                            },
                        }
                    );

                setReport(
                    response.data
                );
            } catch (err) {
                console.error(
                    "LOAD REPORT ERROR:",
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                    "Không thể tải dữ liệu báo cáo."
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ======================================
    // FILTER
    // ======================================
    const handleFilter = () => {
        loadReport(
            from,
            to,
            groupBy
        );
    };

    // ======================================
    // THIS MONTH
    // ======================================
    const handleThisMonth = () => {
        const now =
            new Date();

        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const newFrom =
            toDateInput(start);

        const newTo =
            toDateInput(now);

        setFrom(newFrom);
        setTo(newTo);
        setGroupBy("DAY");

        loadReport(
            newFrom,
            newTo,
            "DAY"
        );
    };

    // ======================================
    // THIS YEAR
    // ======================================
    const handleThisYear = () => {
        const now =
            new Date();

        const start =
            new Date(
                now.getFullYear(),
                0,
                1
            );

        const newFrom =
            toDateInput(start);

        const newTo =
            toDateInput(now);

        setFrom(newFrom);
        setTo(newTo);
        setGroupBy("MONTH");

        loadReport(
            newFrom,
            newTo,
            "MONTH"
        );
    };

    // ======================================
    // ALL ARRAYS
    // ======================================
    const timeData =
        useMemo(
            () =>
                report?.revenueByTime ||
                [],
            [report]
        );

    const categoryData =
        useMemo(
            () =>
                report?.revenueByCategory ||
                [],
            [report]
        );

    const paymentData =
        useMemo(
            () =>
                (
                    report
                        ?.revenueByPaymentMethod ||
                    []
                ).map((item) => ({
                    ...item,
                    displayName:
                        getPaymentName(
                            item.paymentMethod
                        ),
                })),
            [report]
        );

    const summary =
        report?.summary || {
            totalOrders: 0,
            totalCustomers: 0,
            totalRevenue: 0,
        };

    if (
        loading &&
        !report
    ) {
        return (
            <div className="vb-admin-empty">
                Đang tải báo cáo...
            </div>
        );
    }

    return (
        <div>
            {/* =========================
          HEADER
      ========================= */}
            <div className="vb-admin-page-heading">
                <h2>
                    Báo cáo - Thống kê
                </h2>

                <p>
                    Theo dõi đơn hàng,
                    khách hàng và doanh
                    thu của hệ thống.
                </p>
            </div>

            {error && (
                <div className="vb-admin-alert error">
                    {error}
                </div>
            )}

            {/* =========================
          FILTER
      ========================= */}
            <section className="vb-admin-panel vb-report-filter-panel">
                <div className="vb-admin-panel-heading">
                    <h3>
                        BỘ LỌC BÁO CÁO
                    </h3>
                </div>

                <div className="vb-report-filter">
                    <div className="vb-report-filter-group">
                        <label>
                            Từ ngày
                        </label>

                        <input
                            type="date"
                            value={from}
                            onChange={(e) =>
                                setFrom(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="vb-report-filter-group">
                        <label>
                            Đến ngày
                        </label>

                        <input
                            type="date"
                            value={to}
                            onChange={(e) =>
                                setTo(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="vb-report-filter-group">
                        <label>
                            Nhóm theo
                        </label>

                        <select
                            value={groupBy}
                            onChange={(e) =>
                                setGroupBy(
                                    e.target.value
                                )
                            }
                        >
                            <option value="DAY">
                                Ngày
                            </option>

                            <option value="MONTH">
                                Tháng
                            </option>

                            <option value="YEAR">
                                Năm
                            </option>
                        </select>
                    </div>

                    <div className="vb-report-filter-actions">
                        <button
                            type="button"
                            className="vb-report-filter-btn"
                            onClick={
                                handleFilter
                            }
                            disabled={
                                loading
                            }
                        >
                            {loading
                                ? "Đang tải..."
                                : "Lọc báo cáo"}
                        </button>

                        <button
                            type="button"
                            className="vb-report-quick-btn"
                            onClick={
                                handleThisMonth
                            }
                        >
                            Tháng này
                        </button>

                        <button
                            type="button"
                            className="vb-report-quick-btn"
                            onClick={
                                handleThisYear
                            }
                        >
                            Năm nay
                        </button>
                    </div>
                </div>
            </section>

            {/* =========================
          SUMMARY
      ========================= */}
            <div className="vb-report-summary">
                <div className="vb-report-card orders">
                    <div>
                        <span>
                            Tổng đơn hàng
                        </span>

                        <strong>
                            {formatNumber(
                                summary.totalOrders
                            )}
                        </strong>
                    </div>

                    <span className="vb-report-card-icon">
                        ▤
                    </span>
                </div>

                <div className="vb-report-card customers">
                    <div>
                        <span>
                            Tổng khách hàng
                        </span>

                        <strong>
                            {formatNumber(
                                summary.totalCustomers
                            )}
                        </strong>
                    </div>

                    <span className="vb-report-card-icon">
                        ♙
                    </span>
                </div>

                <div className="vb-report-card revenue">
                    <div>
                        <span>
                            Doanh thu
                        </span>

                        <strong>
                            {formatMoney(
                                summary.totalRevenue
                            )}
                        </strong>

                        <small>
                            Chỉ tính đơn hoàn thành
                        </small>
                    </div>

                    <span className="vb-report-card-icon">
                        ₫
                    </span>
                </div>
            </div>

            {/* =========================
          TIME CHART
      ========================= */}
            <section className="vb-admin-panel">
                <div className="vb-admin-panel-heading">
                    <h3>
                        DOANH THU THEO THỜI GIAN
                    </h3>

                    <span className="vb-admin-panel-count">
                        {groupBy === "DAY"
                            ? "Theo ngày"
                            : groupBy ===
                                "MONTH"
                                ? "Theo tháng"
                                : "Theo năm"}
                    </span>
                </div>

                <div className="vb-admin-panel-body">
                    {timeData.length ===
                        0 ? (
                        <div className="vb-admin-empty">
                            Chưa có dữ liệu.
                        </div>
                    ) : (
                        <div className="vb-report-chart-large">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <LineChart
                                    data={
                                        timeData
                                    }
                                    margin={{
                                        top: 15,
                                        right: 25,
                                        bottom: 10,
                                        left: 15,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="period"
                                        tick={{
                                            fontSize: 10,
                                        }}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 10,
                                        }}
                                        tickFormatter={(
                                            value
                                        ) =>
                                            `${Math.round(
                                                value /
                                                1000000
                                            )}tr`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) => [
                                                formatMoney(
                                                    value
                                                ),
                                                "Doanh thu",
                                            ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="totalRevenue"
                                        stroke="#3c8dbc"
                                        strokeWidth={2}
                                        dot={{
                                            r: 3,
                                        }}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </section>

            {/* =========================
          TIME TABLE
      ========================= */}
            <section className="vb-admin-panel">
                <div className="vb-admin-panel-heading">
                    <h3>
                        CHI TIẾT THEO THỜI GIAN
                    </h3>
                </div>

                <div className="vb-admin-panel-body">
                    <div className="vb-report-table-wrapper">
                        <table className="vb-admin-table vb-report-table">
                            <thead>
                                <tr>
                                    <th>
                                        Thời gian
                                    </th>

                                    <th>
                                        Đơn hàng
                                    </th>

                                    <th>
                                        Khách hàng
                                    </th>

                                    <th>
                                        Doanh thu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {timeData.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.period
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        item.period
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {formatNumber(
                                                    item.totalOrders
                                                )}
                                            </td>

                                            <td>
                                                {formatNumber(
                                                    item.totalCustomers
                                                )}
                                            </td>

                                            <td className="vb-report-money">
                                                {formatMoney(
                                                    item.totalRevenue
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* =========================
          CATEGORY
      ========================= */}
            <div className="vb-report-two-columns">
                <section className="vb-admin-panel">
                    <div className="vb-admin-panel-heading">
                        <h3>
                            DOANH THU THEO DANH MỤC
                        </h3>
                    </div>

                    <div className="vb-admin-panel-body">
                        {categoryData.length ===
                            0 ? (
                            <div className="vb-admin-empty">
                                Chưa có dữ liệu.
                            </div>
                        ) : (
                            <div className="vb-report-chart-medium">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={
                                            categoryData
                                        }
                                        margin={{
                                            top: 15,
                                            right: 15,
                                            bottom: 30,
                                            left: 10,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="categoryName"
                                            tick={{
                                                fontSize: 9,
                                            }}
                                            interval={0}
                                        />

                                        <YAxis
                                            tick={{
                                                fontSize: 9,
                                            }}
                                            tickFormatter={(
                                                value
                                            ) =>
                                                `${Math.round(
                                                    value /
                                                    1000000
                                                )}tr`
                                            }
                                        />

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => [
                                                    formatMoney(
                                                        value
                                                    ),
                                                    "Doanh thu",
                                                ]}
                                        />

                                        <Bar
                                            dataKey="totalRevenue"
                                            fill="#00a65a"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </section>

                {/* =========================
            PAYMENT CHART
        ========================= */}
                <section className="vb-admin-panel">
                    <div className="vb-admin-panel-heading">
                        <h3>
                            PHƯƠNG THỨC THANH TOÁN
                        </h3>
                    </div>

                    <div className="vb-admin-panel-body">
                        {paymentData.length ===
                            0 ? (
                            <div className="vb-admin-empty">
                                Chưa có dữ liệu.
                            </div>
                        ) : (
                            <div className="vb-report-chart-medium">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <PieChart>
                                        <Pie
                                            data={
                                                paymentData
                                            }
                                            dataKey="totalRevenue"
                                            nameKey="displayName"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({
                                                displayName,
                                            }) =>
                                                displayName
                                            }
                                        >
                                            {paymentData.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={`${item.paymentMethod}-${index}`}
                                                        fill={
                                                            PIE_COLORS[
                                                            index %
                                                            PIE_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => [
                                                    formatMoney(
                                                        value
                                                    ),
                                                    "Doanh thu",
                                                ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* =========================
          CATEGORY TABLE
      ========================= */}
            <section className="vb-admin-panel">
                <div className="vb-admin-panel-heading">
                    <h3>
                        BẢNG THỐNG KÊ THEO DANH MỤC
                    </h3>

                    <span className="vb-admin-panel-count">
                        {categoryData.length} danh mục
                    </span>
                </div>

                <div className="vb-admin-panel-body">
                    <div className="vb-report-table-wrapper">
                        <table className="vb-admin-table vb-report-table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Danh mục
                                    </th>

                                    <th>
                                        Đơn hàng
                                    </th>

                                    <th>
                                        Khách hàng
                                    </th>

                                    <th>
                                        Doanh thu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {categoryData.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="vb-report-empty-cell"
                                        >
                                            Chưa có dữ liệu.
                                        </td>
                                    </tr>
                                ) : (
                                    categoryData.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.categoryId
                                                }
                                            >
                                                <td>
                                                    #
                                                    {
                                                        item.categoryId
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            item.categoryName
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        item.totalOrders
                                                    )}
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        item.totalCustomers
                                                    )}
                                                </td>

                                                <td className="vb-report-money">
                                                    {formatMoney(
                                                        item.totalRevenue
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* =========================
          PAYMENT TABLE
      ========================= */}
            <section className="vb-admin-panel">
                <div className="vb-admin-panel-heading">
                    <h3>
                        BẢNG THỐNG KÊ THANH TOÁN
                    </h3>
                </div>

                <div className="vb-admin-panel-body">
                    <div className="vb-report-table-wrapper">
                        <table className="vb-admin-table vb-report-table">
                            <thead>
                                <tr>
                                    <th>
                                        Phương thức
                                    </th>

                                    <th>
                                        Đơn hàng
                                    </th>

                                    <th>
                                        Khách hàng
                                    </th>

                                    <th>
                                        Doanh thu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {paymentData.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="vb-report-empty-cell"
                                        >
                                            Chưa có dữ liệu.
                                        </td>
                                    </tr>
                                ) : (
                                    paymentData.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.paymentMethod
                                                }
                                            >
                                                <td>
                                                    <span className="vb-report-payment-label">
                                                        {
                                                            item.displayName
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        item.totalOrders
                                                    )}
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        item.totalCustomers
                                                    )}
                                                </td>

                                                <td className="vb-report-money">
                                                    {formatMoney(
                                                        item.totalRevenue
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AdminReportsPage;