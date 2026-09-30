package vn.edu.vuabongda.report.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.vuabongda.category.entity.Category;
import vn.edu.vuabongda.order.entity.Order;
import vn.edu.vuabongda.order.entity.OrderItem;
import vn.edu.vuabongda.order.repository.OrderItemRepository;
import vn.edu.vuabongda.order.repository.OrderRepository;
import vn.edu.vuabongda.payment.entity.Payment;
import vn.edu.vuabongda.payment.repository.PaymentRepository;
import vn.edu.vuabongda.product.entity.Product;
import vn.edu.vuabongda.report.dto.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;

    // ========================================
    // MAIN REPORT
    // ========================================
    @Transactional(readOnly = true)
    public ReportResponseDTO getReport(
            LocalDate from,
            LocalDate to,
            String groupBy
    ) {

        LocalDate today =
                LocalDate.now();

        // Neu frontend khong gui ngay
        // mac dinh xem thang hien tai
        if (from == null) {
            from =
                    today.withDayOfMonth(1);
        }

        if (to == null) {
            to = today;
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "Ngay bat dau khong duoc lon hon ngay ket thuc"
            );
        }

        String normalizedGroupBy =
                normalizeGroupBy(
                        groupBy
                );

        LocalDateTime startDateTime =
                from.atStartOfDay();

        // dung < endExclusive
        // de lay tron ngay "to"
        LocalDateTime endExclusive =
                to.plusDays(1)
                        .atStartOfDay();

        // ========================================
        // LOC DON HANG THEO THOI GIAN
        // ========================================
        List<Order> orders =
                orderRepository
                        .findAll()
                        .stream()
                        .filter(order ->
                                order.getCreatedAt() != null
                        )
                        .filter(order ->
                                !order.getCreatedAt()
                                        .isBefore(
                                                startDateTime
                                        )
                        )
                        .filter(order ->
                                order.getCreatedAt()
                                        .isBefore(
                                                endExclusive
                                        )
                        )
                        .sorted(
                                Comparator.comparing(
                                        Order::getCreatedAt
                                )
                        )
                        .toList();

        // ========================================
        // ORDER ITEMS
        // ========================================
        Map<Long, List<OrderItem>>
                orderItemsByOrderId =
                orderItemRepository
                        .findAll()
                        .stream()
                        .filter(item ->
                                item.getOrder() != null
                                        && item
                                        .getOrder()
                                        .getId()
                                        != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        item ->
                                                item.getOrder()
                                                        .getId()
                                )
                        );

        // ========================================
        // PAYMENTS
        // ========================================
        Map<Long, Payment>
                paymentByOrderId =
                paymentRepository
                        .findAll()
                        .stream()
                        .filter(payment ->
                                payment.getOrder()
                                        != null
                                        && payment
                                        .getOrder()
                                        .getId()
                                        != null
                        )
                        .collect(
                                Collectors.toMap(
                                        payment ->
                                                payment.getOrder()
                                                        .getId(),

                                        payment ->
                                                payment,

                                        // Neu du lieu loi trung order
                                        // giu record dau tien
                                        (
                                                first,
                                                second
                                        ) -> first
                                )
                        );

        // ========================================
        // SUMMARY
        // ========================================
        ReportSummaryDTO summary =
                buildSummary(
                        orders
                );

        // ========================================
        // TIME REPORT
        // ========================================
        List<RevenueByTimeDTO>
                revenueByTime =
                buildTimeReport(
                        orders,
                        from,
                        to,
                        normalizedGroupBy
                );

        // ========================================
        // CATEGORY REPORT
        // ========================================
        List<RevenueByCategoryDTO>
                revenueByCategory =
                buildCategoryReport(
                        orders,
                        orderItemsByOrderId
                );

        // ========================================
        // PAYMENT REPORT
        // ========================================
        List<RevenueByPaymentMethodDTO>
                revenueByPaymentMethod =
                buildPaymentReport(
                        orders,
                        paymentByOrderId
                );

        return new ReportResponseDTO(
                from,
                to,
                normalizedGroupBy,
                summary,
                revenueByTime,
                revenueByCategory,
                revenueByPaymentMethod
        );
    }

    // ========================================
    // SUMMARY
    // ========================================
    private ReportSummaryDTO buildSummary(
            List<Order> orders
    ) {

        long totalOrders =
                orders.size();

        long totalCustomers =
                orders.stream()
                        .filter(order ->
                                order.getUser()
                                        != null
                        )
                        .map(order ->
                                order.getUser()
                                        .getId()
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .distinct()
                        .count();

        BigDecimal totalRevenue =
                orders.stream()
                        .filter(
                                this::isCompleted
                        )
                        .map(
                                Order::getTotalAmount
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new ReportSummaryDTO(
                totalOrders,
                totalCustomers,
                totalRevenue
        );
    }

    // ========================================
    // REPORT THEO THOI GIAN
    // ========================================
    private List<RevenueByTimeDTO>
    buildTimeReport(
            List<Order> orders,
            LocalDate from,
            LocalDate to,
            String groupBy
    ) {

        LinkedHashMap<String, TimeAccumulator>
                data =
                initializeTimeBuckets(
                        from,
                        to,
                        groupBy
                );

        for (Order order : orders) {

            String period =
                    getPeriodLabel(
                            order.getCreatedAt(),
                            groupBy
                    );

            TimeAccumulator accumulator =
                    data.computeIfAbsent(
                            period,
                            key ->
                                    new TimeAccumulator()
                    );

            accumulator.totalOrders++;

            if (
                    order.getUser()
                            != null
                            &&
                            order.getUser()
                                    .getId()
                                    != null
            ) {

                accumulator.customerIds
                        .add(
                                order.getUser()
                                        .getId()
                        );
            }

            if (isCompleted(order)) {

                accumulator.totalRevenue =
                        accumulator
                                .totalRevenue
                                .add(
                                        safeMoney(
                                                order.getTotalAmount()
                                        )
                                );
            }
        }

        List<RevenueByTimeDTO>
                result =
                new ArrayList<>();

        for (
                Map.Entry<
                        String,
                        TimeAccumulator
                        > entry :
                data.entrySet()
        ) {

            TimeAccumulator value =
                    entry.getValue();

            result.add(
                    new RevenueByTimeDTO(
                            entry.getKey(),
                            value.totalOrders,
                            (long)
                                    value
                                            .customerIds
                                            .size(),
                            value.totalRevenue
                    )
            );
        }

        return result;
    }

    // ========================================
    // TAO CAC MOC THOI GIAN KE CA KHONG CO DON
    // ========================================
    private LinkedHashMap<String, TimeAccumulator>
    initializeTimeBuckets(
            LocalDate from,
            LocalDate to,
            String groupBy
    ) {

        LinkedHashMap<String, TimeAccumulator>
                map =
                new LinkedHashMap<>();

        if ("DAY".equals(groupBy)) {

            LocalDate current =
                    from;

            while (
                    !current.isAfter(to)
            ) {

                String key =
                        current.format(
                                DateTimeFormatter
                                        .ofPattern(
                                                "dd/MM/yyyy"
                                        )
                        );

                map.put(
                        key,
                        new TimeAccumulator()
                );

                current =
                        current.plusDays(1);
            }

        } else if (
                "MONTH".equals(
                        groupBy
                )
        ) {

            LocalDate current =
                    from.withDayOfMonth(1);

            LocalDate end =
                    to.withDayOfMonth(1);

            while (
                    !current.isAfter(end)
            ) {

                String key =
                        current.format(
                                DateTimeFormatter
                                        .ofPattern(
                                                "MM/yyyy"
                                        )
                        );

                map.put(
                        key,
                        new TimeAccumulator()
                );

                current =
                        current.plusMonths(1);
            }

        } else {

            int year =
                    from.getYear();

            while (
                    year <=
                            to.getYear()
            ) {

                map.put(
                        String.valueOf(
                                year
                        ),
                        new TimeAccumulator()
                );

                year++;
            }
        }

        return map;
    }

    // ========================================
    // REPORT THEO DANH MUC
    // ========================================
    private List<RevenueByCategoryDTO>
    buildCategoryReport(
            List<Order> orders,
            Map<Long, List<OrderItem>>
                    orderItemsByOrderId
    ) {

        Map<Long, CategoryAccumulator>
                categoryMap =
                new LinkedHashMap<>();

        for (Order order : orders) {

            List<OrderItem> items =
                    orderItemsByOrderId
                            .getOrDefault(
                                    order.getId(),
                                    List.of()
                            );

            // ====================================
            // GROUP ITEM CUA 1 ORDER THEO CATEGORY
            // ====================================
            Map<Long, OrderCategoryAccumulator>
                    categoriesInOrder =
                    new LinkedHashMap<>();

            for (
                    OrderItem item :
                    items
            ) {

                Product product =
                        item.getProduct();

                if (
                        product == null
                                ||
                                product.getCategory()
                                        == null
                                ||
                                product.getCategory()
                                        .getId()
                                        == null
                ) {
                    continue;
                }

                Category category =
                        product.getCategory();

                Long categoryId =
                        category.getId();

                OrderCategoryAccumulator
                        orderCategory =
                        categoriesInOrder
                                .computeIfAbsent(
                                        categoryId,
                                        key ->
                                                new OrderCategoryAccumulator(
                                                        categoryId,
                                                        category.getName()
                                                )
                                );

                orderCategory.subtotal =
                        orderCategory
                                .subtotal
                                .add(
                                        safeMoney(
                                                item.getSubtotal()
                                        )
                                );
            }

            // ====================================
            // SO DON + KHACH HANG
            // TINH TAT CA ORDER
            // ====================================
            for (
                    OrderCategoryAccumulator
                            orderCategory :
                    categoriesInOrder
                            .values()
            ) {

                CategoryAccumulator
                        global =
                        categoryMap
                                .computeIfAbsent(
                                        orderCategory.categoryId,
                                        key ->
                                                new CategoryAccumulator(
                                                        orderCategory.categoryId,
                                                        orderCategory.categoryName
                                                )
                                );

                global.orderIds
                        .add(
                                order.getId()
                        );

                if (
                        order.getUser()
                                != null
                                &&
                                order.getUser()
                                        .getId()
                                        != null
                ) {

                    global.customerIds
                            .add(
                                    order.getUser()
                                            .getId()
                            );
                }
            }

            // ====================================
            // DOANH THU:
            // CHI COMPLETED
            // ====================================
            if (
                    !isCompleted(order)
                            ||
                            categoriesInOrder
                                    .isEmpty()
            ) {
                continue;
            }

            BigDecimal itemTotal =
                    categoriesInOrder
                            .values()
                            .stream()
                            .map(value ->
                                    value.subtotal
                            )
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );

            if (
                    itemTotal.compareTo(
                            BigDecimal.ZERO
                    ) <= 0
            ) {
                continue;
            }

            BigDecimal orderRevenue =
                    safeMoney(
                            order.getTotalAmount()
                    );

            List<OrderCategoryAccumulator>
                    categoryList =
                    new ArrayList<>(
                            categoriesInOrder
                                    .values()
                    );

            BigDecimal allocatedRevenue =
                    BigDecimal.ZERO;

            for (
                    int i = 0;
                    i < categoryList.size();
                    i++
            ) {

                OrderCategoryAccumulator
                        orderCategory =
                        categoryList.get(i);

                BigDecimal categoryRevenue;

                // Category cuoi nhan phan con lai
                // de tong khop chinh xac order.totalAmount
                if (
                        i ==
                                categoryList
                                        .size()
                                        - 1
                ) {

                    categoryRevenue =
                            orderRevenue
                                    .subtract(
                                            allocatedRevenue
                                    );

                } else {

                    categoryRevenue =
                            orderRevenue
                                    .multiply(
                                            orderCategory
                                                    .subtotal
                                    )
                                    .divide(
                                            itemTotal,
                                            2,
                                            RoundingMode.HALF_UP
                                    );

                    allocatedRevenue =
                            allocatedRevenue
                                    .add(
                                            categoryRevenue
                                    );
                }

                CategoryAccumulator
                        global =
                        categoryMap
                                .get(
                                        orderCategory
                                                .categoryId
                                );

                global.totalRevenue =
                        global.totalRevenue
                                .add(
                                        categoryRevenue
                                );
            }
        }

        return categoryMap
                .values()
                .stream()
                .sorted(
                        Comparator.comparing(
                                (CategoryAccumulator value) ->
                                        value.totalRevenue
                        ).reversed()
                )
                .map(value ->
                        new RevenueByCategoryDTO(
                                value.categoryId,
                                value.categoryName,
                                (long)
                                        value.orderIds
                                                .size(),
                                (long)
                                        value.customerIds
                                                .size(),
                                value.totalRevenue
                        )
                )
                .toList();
    }

    // ========================================
    // REPORT THEO PHUONG THUC THANH TOAN
    // ========================================
    private List<RevenueByPaymentMethodDTO>
    buildPaymentReport(
            List<Order> orders,
            Map<Long, Payment>
                    paymentByOrderId
    ) {

        Map<String, PaymentAccumulator>
                paymentMap =
                new LinkedHashMap<>();

        for (Order order : orders) {

            Payment payment =
                    paymentByOrderId
                            .get(
                                    order.getId()
                            );

            String method =
                    "UNKNOWN";

            if (
                    payment != null
                            &&
                            payment.getPaymentMethod()
                                    != null
                            &&
                            !payment.getPaymentMethod()
                                    .isBlank()
            ) {

                method =
                        payment.getPaymentMethod()
                                .trim()
                                .toUpperCase();
            }

            PaymentAccumulator accumulator =
                    paymentMap
                            .computeIfAbsent(
                                    method,
                                    key ->
                                            new PaymentAccumulator()
                            );

            accumulator.orderIds
                    .add(
                            order.getId()
                    );

            if (
                    order.getUser()
                            != null
                            &&
                            order.getUser()
                                    .getId()
                                    != null
            ) {

                accumulator.customerIds
                        .add(
                                order.getUser()
                                        .getId()
                        );
            }

            if (
                    isCompleted(order)
            ) {

                accumulator.totalRevenue =
                        accumulator
                                .totalRevenue
                                .add(
                                        safeMoney(
                                                order.getTotalAmount()
                                        )
                                );
            }
        }

        return paymentMap
                .entrySet()
                .stream()
                .sorted(
                        Map.Entry.comparingByKey()
                )
                .map(entry -> {

                    PaymentAccumulator value =
                            entry.getValue();

                    return new RevenueByPaymentMethodDTO(
                            entry.getKey(),
                            (long)
                                    value.orderIds
                                            .size(),
                            (long)
                                    value.customerIds
                                            .size(),
                            value.totalRevenue
                    );
                })
                .toList();
    }

    // ========================================
    // PERIOD LABEL
    // ========================================
    private String getPeriodLabel(
            LocalDateTime dateTime,
            String groupBy
    ) {

        if ("MONTH".equals(groupBy)) {

            return dateTime.format(
                    DateTimeFormatter
                            .ofPattern(
                                    "MM/yyyy"
                            )
            );
        }

        if ("YEAR".equals(groupBy)) {

            return dateTime.format(
                    DateTimeFormatter
                            .ofPattern(
                                    "yyyy"
                            )
            );
        }

        return dateTime.format(
                DateTimeFormatter
                        .ofPattern(
                                "dd/MM/yyyy"
                        )
        );
    }

    // ========================================
    // GROUP BY VALIDATE
    // ========================================
    private String normalizeGroupBy(
            String groupBy
    ) {

        if (
                groupBy == null
                        ||
                        groupBy.isBlank()
        ) {

            return "DAY";
        }

        String value =
                groupBy
                        .trim()
                        .toUpperCase();

        if (
                !"DAY".equals(value)
                        &&
                        !"MONTH".equals(value)
                        &&
                        !"YEAR".equals(value)
        ) {

            throw new IllegalArgumentException(
                    "groupBy chi co the la DAY, MONTH hoac YEAR"
            );
        }

        return value;
    }

    // ========================================
    // COMPLETED?
    // ========================================
    private boolean isCompleted(
            Order order
    ) {

        return order != null
                &&
                order.getStatus() != null
                &&
                "COMPLETED"
                        .equalsIgnoreCase(
                                order.getStatus()
                        );
    }

    // ========================================
    // NULL MONEY -> 0
    // ========================================
    private BigDecimal safeMoney(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    // ========================================
    // INTERNAL ACCUMULATOR
    // ========================================
    private static class TimeAccumulator {

        private long totalOrders = 0;

        private final Set<Long>
                customerIds =
                new HashSet<>();

        private BigDecimal totalRevenue =
                BigDecimal.ZERO;
    }

    private static class CategoryAccumulator {

        private final Long categoryId;

        private final String categoryName;

        private final Set<Long>
                orderIds =
                new HashSet<>();

        private final Set<Long>
                customerIds =
                new HashSet<>();

        private BigDecimal totalRevenue =
                BigDecimal.ZERO;

        private CategoryAccumulator(
                Long categoryId,
                String categoryName
        ) {

            this.categoryId =
                    categoryId;

            this.categoryName =
                    categoryName;
        }
    }

    private static class OrderCategoryAccumulator {

        private final Long categoryId;

        private final String categoryName;

        private BigDecimal subtotal =
                BigDecimal.ZERO;

        private OrderCategoryAccumulator(
                Long categoryId,
                String categoryName
        ) {

            this.categoryId =
                    categoryId;

            this.categoryName =
                    categoryName;
        }
    }

    private static class PaymentAccumulator {

        private final Set<Long>
                orderIds =
                new HashSet<>();

        private final Set<Long>
                customerIds =
                new HashSet<>();

        private BigDecimal totalRevenue =
                BigDecimal.ZERO;
    }
}