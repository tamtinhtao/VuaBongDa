package vn.edu.vuabongda.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.vuabongda.cart.entity.Cart;
import vn.edu.vuabongda.cart.entity.CartItem;
import vn.edu.vuabongda.cart.repository.CartItemRepository;
import vn.edu.vuabongda.cart.repository.CartRepository;
import vn.edu.vuabongda.order.dto.CreateOrderRequestDTO;
import vn.edu.vuabongda.order.dto.OrderItemResponseDTO;
import vn.edu.vuabongda.order.dto.OrderResponseDTO;
import vn.edu.vuabongda.order.dto.UpdateOrderStatusRequestDTO;
import vn.edu.vuabongda.order.entity.Order;
import vn.edu.vuabongda.order.entity.OrderItem;
import vn.edu.vuabongda.order.repository.OrderItemRepository;
import vn.edu.vuabongda.order.repository.OrderRepository;
import vn.edu.vuabongda.payment.service.PaymentService;
import vn.edu.vuabongda.product.entity.Product;
import vn.edu.vuabongda.product.repository.ProductRepository;
import vn.edu.vuabongda.promotion.dto.PromotionApplyResponseDTO;
import vn.edu.vuabongda.promotion.service.PromotionService;
import vn.edu.vuabongda.user.entity.User;
import vn.edu.vuabongda.user.repository.UserRepository;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final UserRepository userRepository;

    private final CartRepository cartRepository;

    private final CartItemRepository cartItemRepository;

    private final ProductRepository productRepository;

    private final PaymentService paymentService;

    private final PromotionService promotionService;

    // ================================
    // TAO DON HANG
    // ================================
    public OrderResponseDTO createOrder(
            String username,
            CreateOrderRequestDTO request
    ) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Khong tim thay nguoi dung"
                        )
                );

        String mode = request.getMode();

        if (mode == null || mode.isBlank()) {
            mode = "CART";
        }

        if ("BUY_NOW".equalsIgnoreCase(mode)) {

            return createBuyNowOrder(
                    user,
                    request
            );
        }

        return createCartOrder(
                user,
                request
        );
    }

    // ================================
    // DAT HANG TU CART
    // CHI CAC ITEM DUOC CHON
    // ================================
    private OrderResponseDTO createCartOrder(
            User user,
            CreateOrderRequestDTO request
    ) {

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Gio hang dang trong"
                        )
                );

        // ================================
        // KIEM TRA ITEM DA CHON
        // ================================
        if (request.getCartItemIds() == null
                || request.getCartItemIds().isEmpty()) {

            throw new IllegalArgumentException(
                    "Vui long chon san pham can thanh toan"
            );
        }

        List<Long> selectedIds =
                request.getCartItemIds()
                        .stream()
                        .distinct()
                        .toList();

        List<CartItem> selectedItems =
                cartItemRepository.findAllById(
                        selectedIds
                );

        if (selectedItems.size()
                != selectedIds.size()) {

            throw new IllegalArgumentException(
                    "Co san pham trong gio hang khong ton tai"
            );
        }

        // ================================
        // KIEM TRA ITEM THUOC CART USER
        // ================================
        for (CartItem item : selectedItems) {

            if (!item.getCart()
                    .getId()
                    .equals(cart.getId())) {

                throw new IllegalArgumentException(
                        "San pham khong thuoc gio hang cua ban"
                );
            }
        }

        // ================================
        // KIEM TRA TON KHO THEO PRODUCT
        // ================================
        Map<Long, Integer> quantityByProduct =
                new HashMap<>();

        for (CartItem item : selectedItems) {

            Product product =
                    item.getProduct();

            validateProduct(product);

            quantityByProduct.merge(
                    product.getId(),
                    item.getQuantity(),
                    Integer::sum
            );
        }

        // ================================
// LOCK PRODUCT TRUOC KHI KIEM TRA KHO
// ================================
//
// Sap xep ID truoc khi lock.
// Neu 2 don cung mua nhieu product,
// lock cung thu tu giup giam nguy co deadlock.
//
        List<Long> productIds =
                quantityByProduct
                        .keySet()
                        .stream()
                        .sorted()
                        .toList();

        Map<Long, Product> lockedProducts =
                new HashMap<>();

        for (Long productId : productIds) {

            Product product =
                    productRepository
                            .findByIdForUpdate(
                                    productId
                            )
                            .orElseThrow(
                                    () -> new NoSuchElementException(
                                            "Khong tim thay san pham"
                                    )
                            );

            validateProduct(product);

            Integer requestedQuantity =
                    quantityByProduct.get(
                            productId
                    );

            if (
                    requestedQuantity
                            > product.getStockQuantity()
            ) {

                throw new IllegalArgumentException(
                        "San pham "
                                + product.getName()
                                + " chi con "
                                + product.getStockQuantity()
                                + " san pham trong kho"
                );
            }

            lockedProducts.put(
                    productId,
                    product
            );
        }

        // ================================
        // TINH TONG TIEN TRUOC KHUYEN MAI
        // ================================
        BigDecimal originalAmount =
                BigDecimal.ZERO;

        for (CartItem item : selectedItems) {

            BigDecimal subtotal =
                    item.getProduct()
                            .getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            originalAmount =
                    originalAmount.add(
                            subtotal
                    );
        }

        // ================================
        // AP DUNG PROMOTION
        // ================================
        PromotionResult promotionResult =
                calculatePromotion(
                        request.getPromotionCode(),
                        originalAmount
                );

        // ================================
        // TAO ORDER
        // ================================
        Order savedOrder =
                createBaseOrder(
                        user,
                        request,
                        originalAmount,
                        promotionResult.discountAmount,
                        promotionResult.promotionCode,
                        promotionResult.finalAmount
                );

        // ================================
        // TAO ORDER ITEMS
        // ================================
        List<OrderItem> orderItems =
                new ArrayList<>();

        for (CartItem cartItem : selectedItems) {

            Long productId =
                    cartItem
                            .getProduct()
                            .getId();

            Product product =
                    lockedProducts
                            .get(productId);

            if (product == null) {

                throw new IllegalStateException(
                        "San pham chua duoc khoa ton kho"
                );
            }

            BigDecimal unitPrice =
                    product.getPrice();

            BigDecimal subtotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    cartItem.getQuantity()
                            )
                    );

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(
                    savedOrder
            );

            orderItem.setProduct(
                    product
            );

            orderItem.setProductName(
                    product.getName()
            );

            orderItem.setSize(
                    cartItem.getSize()
            );

            orderItem.setUnitPrice(
                    unitPrice
            );

            orderItem.setQuantity(
                    cartItem.getQuantity()
            );

            orderItem.setSubtotal(
                    subtotal
            );

            orderItems.add(
                    orderItem
            );

            // ================================
            // TRU TON KHO
            // ================================
            product.setStockQuantity(
                    product.getStockQuantity()
                            - cartItem.getQuantity()
            );

            productRepository.save(
                    product
            );
        }

        orderItemRepository.saveAll(
                orderItems
        );

        // ================================
        // TAO PAYMENT
        // Payment se lay totalAmount
        // DA TRU KHUYEN MAI
        // ================================
        paymentService.createPayment(
                savedOrder,
                request.getPaymentMethod()
        );

        // ================================
        // CHI XOA ITEM DA THANH TOAN
        // ================================
        cartItemRepository.deleteAll(
                selectedItems
        );

        return toDTO(
                savedOrder,
                orderItems
        );
    }

    // ================================
    // BUY NOW
    // KHONG DUNG CART
    // ================================
    private OrderResponseDTO createBuyNowOrder(
            User user,
            CreateOrderRequestDTO request
    ) {

        if (request.getProductId() == null) {

            throw new IllegalArgumentException(
                    "Product ID khong duoc de trong"
            );
        }

        if (request.getQuantity() == null
                || request.getQuantity() < 1) {

            throw new IllegalArgumentException(
                    "So luong phai lon hon 0"
            );
        }

        Product product =
                productRepository
                        .findByIdForUpdate(
                                request.getProductId()
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay san pham"
                                )
                        );

        validateProduct(product);

        String size =
                normalizeSize(
                        request.getSize()
                );

        validateSize(
                product,
                size
        );

        if (request.getQuantity()
                > product.getStockQuantity()) {

            throw new IllegalArgumentException(
                    "So luong vuot qua ton kho"
            );
        }

        BigDecimal unitPrice =
                product.getPrice();

        // ================================
        // TONG TRUOC KHUYEN MAI
        // ================================
        BigDecimal originalAmount =
                unitPrice.multiply(
                        BigDecimal.valueOf(
                                request.getQuantity()
                        )
                );

        // ================================
        // AP DUNG PROMOTION
        // ================================
        PromotionResult promotionResult =
                calculatePromotion(
                        request.getPromotionCode(),
                        originalAmount
                );

        // ================================
        // TAO ORDER
        // ================================
        Order savedOrder =
                createBaseOrder(
                        user,
                        request,
                        originalAmount,
                        promotionResult.discountAmount,
                        promotionResult.promotionCode,
                        promotionResult.finalAmount
                );

        // ================================
        // TAO ORDER ITEM
        // ================================
        OrderItem orderItem =
                new OrderItem();

        orderItem.setOrder(
                savedOrder
        );

        orderItem.setProduct(
                product
        );

        orderItem.setProductName(
                product.getName()
        );

        orderItem.setSize(
                size
        );

        orderItem.setUnitPrice(
                unitPrice
        );

        orderItem.setQuantity(
                request.getQuantity()
        );

        orderItem.setSubtotal(
                originalAmount
        );

        orderItemRepository.save(
                orderItem
        );

        // ================================
        // TRU TON KHO
        // ================================
        product.setStockQuantity(
                product.getStockQuantity()
                        - request.getQuantity()
        );

        productRepository.save(
                product
        );

        // ================================
        // PAYMENT LAY GIA SAU GIAM
        // ================================
        paymentService.createPayment(
                savedOrder,
                request.getPaymentMethod()
        );

        // BUY NOW KHONG DONG VAO CART

        return toDTO(
                savedOrder,
                List.of(orderItem)
        );
    }

    // ================================
    // TINH PROMOTION
    // ================================
    private PromotionResult calculatePromotion(
            String promotionCode,
            BigDecimal originalAmount
    ) {

        // ================================
        // KHONG DUNG MA
        // ================================
        if (promotionCode == null
                || promotionCode.isBlank()) {

            return new PromotionResult(
                    null,
                    BigDecimal.ZERO,
                    originalAmount
            );
        }

        String normalizedCode =
                promotionCode
                        .trim()
                        .toUpperCase();

        /*
         * QUAN TRONG:
         * Backend tu validate lai Promotion.
         *
         * Khong tin discountAmount
         * do frontend gui.
         */
        PromotionApplyResponseDTO result =
                promotionService
                        .applyPromotion(
                                normalizedCode,
                                originalAmount
                        );

        return new PromotionResult(
                result.getCode(),
                result.getDiscountAmount(),
                result.getFinalAmount()
        );
    }

    // ================================
    // TAO ORDER CHUNG
    // ================================
    private Order createBaseOrder(
            User user,
            CreateOrderRequestDTO request,
            BigDecimal originalAmount,
            BigDecimal discountAmount,
            String promotionCode,
            BigDecimal totalAmount
    ) {

        Order order =
                new Order();

        order.setUser(
                user
        );

        order.setRecipientName(
                request.getRecipientName()
        );

        order.setPhone(
                request.getPhone()
        );

        order.setShippingAddress(
                request.getShippingAddress()
        );

        order.setOriginalAmount(
                originalAmount
        );

        order.setDiscountAmount(
                discountAmount
        );

        order.setPromotionCode(
                promotionCode
        );

        order.setTotalAmount(
                totalAmount
        );

        order.setStatus(
                "PENDING"
        );

        return orderRepository.save(
                order
        );
    }

    // ================================
    // VALIDATE PRODUCT
    // ================================
    private void validateProduct(
            Product product
    ) {

        if (!"ACTIVE".equalsIgnoreCase(
                product.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "San pham "
                            + product.getName()
                            + " hien khong hoat dong"
            );
        }

        if (product.getStockQuantity() == null
                || product.getStockQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "San pham "
                            + product.getName()
                            + " da het hang"
            );
        }
    }

    // ================================
    // NORMALIZE SIZE
    // ================================
    private String normalizeSize(
            String size
    ) {

        if (size == null
                || size.isBlank()) {

            return null;
        }

        return size
                .trim()
                .toUpperCase();
    }

    // ================================
    // NORMALIZE CATEGORY
    // ================================
    private String normalizeText(
            String text
    ) {

        if (text == null) {
            return "";
        }

        String normalized =
                Normalizer.normalize(
                        text,
                        Normalizer.Form.NFD
                );

        return normalized
                .replaceAll(
                        "\\p{M}",
                        ""
                )
                .toLowerCase();
    }

    // ================================
    // VALIDATE SIZE
    // ================================
    private void validateSize(
            Product product,
            String size
    ) {

        String categoryName = "";

        if (product.getCategory() != null) {

            categoryName =
                    product.getCategory()
                            .getName();
        }

        String category =
                normalizeText(
                        categoryName
                );

        boolean isShoes =
                category.contains(
                        "giay"
                );

        boolean isClothing =
                category.contains("ao")
                        || category.contains(
                        "quan"
                );

        // GIAY / QUAN AO CAN SIZE
        if ((isShoes || isClothing)
                && size == null) {

            throw new IllegalArgumentException(
                    "Vui long chon size"
            );
        }

        // BONG / PHU KIEN KHONG CAN SIZE
        if (!isShoes
                && !isClothing
                && size != null) {

            throw new IllegalArgumentException(
                    "San pham nay khong can chon size"
            );
        }

        // GIAY
        if (isShoes
                && size != null) {

            List<String> validSizes =
                    List.of(
                            "38",
                            "39",
                            "40",
                            "41",
                            "42",
                            "43"
                    );

            if (!validSizes.contains(
                    size
            )) {

                throw new IllegalArgumentException(
                        "Size giay khong hop le"
                );
            }
        }

        // QUAN AO
        if (isClothing
                && size != null) {

            List<String> validSizes =
                    List.of(
                            "S",
                            "M",
                            "L",
                            "XL"
                    );

            if (!validSizes.contains(
                    size
            )) {

                throw new IllegalArgumentException(
                        "Size quan ao khong hop le"
                );
            }
        }
    }

    // ================================
    // DANH SACH DON CUA CUSTOMER
    // ================================
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getMyOrders(
            String username
    ) {

        User user =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay nguoi dung"
                                )
                        );

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ================================
    // CHI TIET DON CUA CUSTOMER
    // ================================
    @Transactional(readOnly = true)
    public OrderResponseDTO getMyOrderById(
            String username,
            Long orderId
    ) {

        User user =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay nguoi dung"
                                )
                        );

        Order order =
                orderRepository
                        .findByIdAndUserId(
                                orderId,
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay don hang"
                                )
                        );

        return toDTO(
                order
        );
    }
    // ================================
// CUSTOMER - HUY DON CUA MINH
// CHI DUOC HUY KHI PENDING
// ================================
    public OrderResponseDTO cancelMyOrder(
            String username,
            Long orderId
    ) {

        User user =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay nguoi dung"
                                )
                        );

        // Quan trong:
        // tim theo ca orderId + userId
        // de user khong huy don cua nguoi khac
        Order order =
                orderRepository
                        .findByIdAndUserId(
                                orderId,
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay don hang"
                                )
                        );

        String currentStatus =
                order.getStatus();

        // Customer chi duoc huy khi shop
        // chua xac nhan don
        if (!"PENDING".equalsIgnoreCase(
                currentStatus
        )) {

            throw new IllegalArgumentException(
                    "Chi co the huy don hang dang cho xac nhan"
            );
        }

        // Hoan ton kho
        restoreOrderStock(
                order
        );

// Payment cua don cung bi huy
        paymentService.cancelPayment(
                order.getId()
        );

        order.setStatus(
                "CANCELLED"
        );

        Order savedOrder =
                orderRepository.save(
                        order
                );

        return toDTO(
                savedOrder
        );
    }

    // ================================
    // ORDER -> DTO
    // ================================
    private OrderResponseDTO toDTO(
            Order order
    ) {

        List<OrderItem> items =
                orderItemRepository
                        .findByOrderId(
                                order.getId()
                        );

        return toDTO(
                order,
                items
        );
    }

    private OrderResponseDTO toDTO(
            Order order,
            List<OrderItem> items
    ) {

        List<OrderItemResponseDTO> itemDTOs =
                items.stream()
                        .map(this::toItemDTO)
                        .toList();

        /*
         * Ho tro cac Order cu trong DB
         * truoc khi co Promotion.
         */
        BigDecimal originalAmount =
                order.getOriginalAmount()
                        != null
                        ? order.getOriginalAmount()
                        : order.getTotalAmount();

        BigDecimal discountAmount =
                order.getDiscountAmount()
                        != null
                        ? order.getDiscountAmount()
                        : BigDecimal.ZERO;

        return new OrderResponseDTO(
                order.getId(),
                order.getUser().getId(),
                order.getRecipientName(),
                order.getPhone(),
                order.getShippingAddress(),
                originalAmount,
                discountAmount,
                order.getPromotionCode(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                itemDTOs
        );
    }

    // ================================
    // ORDER ITEM -> DTO
    // ================================
    private OrderItemResponseDTO toItemDTO(
            OrderItem item
    ) {

        return new OrderItemResponseDTO(
                item.getId(),
                item.getProduct().getId(),
                item.getProductName(),
                item.getSize(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getSubtotal()
        );
    }

    // ================================
    // ADMIN - TAT CA DON
    // ================================
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {

        return orderRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ================================
    // ADMIN - CHI TIET DON
    // ================================
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(
            Long orderId
    ) {

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay don hang"
                                )
                        );

        return toDTO(
                order
        );
    }

    // ================================
    // ADMIN - CAP NHAT TRANG THAI
    // ================================
    // ================================
// ADMIN - CAP NHAT TRANG THAI
// ================================
    public OrderResponseDTO updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequestDTO request
    ) {

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay don hang"
                                )
                        );

        String currentStatus =
                order.getStatus();

        String newStatus =
                request.getStatus();

        if (newStatus == null
                || newStatus.isBlank()) {

            throw new IllegalArgumentException(
                    "Trang thai moi khong hop le"
            );
        }

        newStatus =
                newStatus.trim()
                        .toUpperCase();

        // ================================
        // KHONG THAY DOI
        // ================================
        if (currentStatus.equals(newStatus)) {

            return toDTO(order);
        }

        // ================================
        // KIEM TRA LUONG TRANG THAI
        // ================================
        if (!isValidStatusTransition(
                currentStatus,
                newStatus
        )) {

            throw new IllegalArgumentException(
                    getInvalidTransitionMessage(
                            currentStatus,
                            newStatus
                    )
            );
        }

        // ================================
        // HUY DON
        // CHI PENDING / CONFIRMED MOI DEN DAY
        // ================================
        if ("CANCELLED".equals(newStatus)) {

            restoreOrderStock(
                    order
            );

            paymentService.cancelPayment(
                    order.getId()
            );
        }
        // ================================
// DON HOAN THANH
// -> THANH TOAN HOAN THANH
// ================================
        if ("COMPLETED".equals(newStatus)) {

            paymentService.markPaymentPaid(
                    order.getId()
            );
        }
        // ================================
        // CAP NHAT
        // ================================
        order.setStatus(
                newStatus
        );

        Order savedOrder =
                orderRepository.save(
                        order
                );

        return toDTO(
                savedOrder
        );
    }

    // ================================
// HOAN LAI TON KHO KHI HUY DON
// ================================
    private void restoreOrderStock(
            Order order
    ) {

        List<OrderItem> orderItems =
                orderItemRepository
                        .findByOrderId(
                                order.getId()
                        );

        for (
                OrderItem orderItem :
                orderItems
        ) {

            Product product =
                    productRepository
                            .findById(
                                    orderItem
                                            .getProduct()
                                            .getId()
                            )
                            .orElseThrow(
                                    () -> new NoSuchElementException(
                                            "Khong tim thay san pham"
                                    )
                            );

            Integer currentStock =
                    product.getStockQuantity();

            if (currentStock == null) {
                currentStock = 0;
            }

            product.setStockQuantity(
                    currentStock
                            + orderItem
                            .getQuantity()
            );

            productRepository.save(
                    product
            );
        }
    }
    // ================================
// KIEM TRA CHUYEN TRANG THAI
// ================================
    private boolean isValidStatusTransition(
            String currentStatus,
            String newStatus
    ) {

        return switch (currentStatus) {

            case "PENDING" ->
                    "CONFIRMED".equals(newStatus)
                            || "CANCELLED".equals(newStatus);

            case "CONFIRMED" ->
                    "SHIPPING".equals(newStatus)
                            || "CANCELLED".equals(newStatus);

            case "SHIPPING" ->
                    "COMPLETED".equals(newStatus);

            case "COMPLETED",
                 "CANCELLED" -> false;

            default -> false;
        };
    }

    // ================================
// MESSAGE KHI CHUYEN SAI
// ================================
    private String getInvalidTransitionMessage(
            String currentStatus,
            String newStatus
    ) {

        if ("SHIPPING".equals(currentStatus)
                && "CANCELLED".equals(newStatus)) {

            return "Don hang dang giao khong the huy";
        }

        if ("COMPLETED".equals(currentStatus)) {

            return "Don hang da hoan thanh khong the cap nhat";
        }

        if ("CANCELLED".equals(currentStatus)) {

            return "Don hang da huy khong the cap nhat";
        }

        return "Khong the chuyen trang thai tu "
                + currentStatus
                + " sang "
                + newStatus;
    }

    // ================================
    // KET QUA PROMOTION NOI BO
    // ================================
    private static class PromotionResult {

        private final String promotionCode;

        private final BigDecimal discountAmount;

        private final BigDecimal finalAmount;

        private PromotionResult(
                String promotionCode,
                BigDecimal discountAmount,
                BigDecimal finalAmount
        ) {

            this.promotionCode =
                    promotionCode;

            this.discountAmount =
                    discountAmount;

            this.finalAmount =
                    finalAmount;
        }
    }
}