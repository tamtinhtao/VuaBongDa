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
    // DAT HANG TU CAC ITEM DUOC CHON
    // TRONG CART
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

        // Bat buoc phai chon item
        if (request.getCartItemIds() == null
                || request.getCartItemIds().isEmpty()) {

            throw new IllegalArgumentException(
                    "Vui long chon san pham can thanh toan"
            );
        }

        // Loai bo ID trung
        List<Long> selectedIds =
                request.getCartItemIds()
                        .stream()
                        .distinct()
                        .toList();

        List<CartItem> selectedItems =
                cartItemRepository.findAllById(
                        selectedIds
                );

        // Kiem tra ID co ton tai day du khong
        if (selectedItems.size()
                != selectedIds.size()) {

            throw new IllegalArgumentException(
                    "Co san pham trong gio hang khong ton tai"
            );
        }

        // Kiem tra tat ca item co thuoc cart
        // cua user hien tai khong
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
        // KIEM TRA PRODUCT + TON KHO
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

        for (Map.Entry<Long, Integer> entry
                : quantityByProduct.entrySet()) {

            Product product =
                    productRepository
                            .findById(entry.getKey())
                            .orElseThrow(
                                    () -> new NoSuchElementException(
                                            "Khong tim thay san pham"
                                    )
                            );

            if (entry.getValue()
                    > product.getStockQuantity()) {

                throw new IllegalArgumentException(
                        "San pham "
                                + product.getName()
                                + " khong du ton kho"
                );
            }
        }

        // ================================
        // TINH TONG TIEN
        // ================================
        BigDecimal totalAmount =
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

            totalAmount =
                    totalAmount.add(
                            subtotal
                    );
        }

        // ================================
        // TAO ORDER
        // ================================
        Order savedOrder =
                createBaseOrder(
                        user,
                        request,
                        totalAmount
                );

        // ================================
        // TAO ORDER ITEM
        // ================================
        List<OrderItem> orderItems =
                new ArrayList<>();

        for (CartItem cartItem
                : selectedItems) {

            Product product =
                    cartItem.getProduct();

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
    // MUA NGAY
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
                        .findById(
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

        BigDecimal subtotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(
                                request.getQuantity()
                        )
                );

        // ================================
        // TAO ORDER
        // ================================
        Order savedOrder =
                createBaseOrder(
                        user,
                        request,
                        subtotal
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
                subtotal
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
        // TAO PAYMENT
        // ================================
        paymentService.createPayment(
                savedOrder,
                request.getPaymentMethod()
        );

        // BUY_NOW:
        // KHONG XOA HOAC SUA CART

        return toDTO(
                savedOrder,
                List.of(orderItem)
        );
    }

    // ================================
    // TAO ORDER CHUNG
    // ================================
    private Order createBaseOrder(
            User user,
            CreateOrderRequestDTO request,
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
    // NORMALIZE TEXT
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

        if (product.getCategory()
                != null) {

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

        if ((isShoes || isClothing)
                && size == null) {

            throw new IllegalArgumentException(
                    "Vui long chon size"
            );
        }

        if (!isShoes
                && !isClothing
                && size != null) {

            throw new IllegalArgumentException(
                    "San pham nay khong can chon size"
            );
        }

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
    // DON HANG CUA USER
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
    // CHI TIET DON CUA USER
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

        return toDTO(order);
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

        return new OrderResponseDTO(
                order.getId(),
                order.getUser().getId(),
                order.getRecipientName(),
                order.getPhone(),
                order.getShippingAddress(),
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

        return toDTO(order);
    }

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

        // Don da huy -> khong mo lai
        if ("CANCELLED".equals(
                currentStatus
        )
                && !"CANCELLED".equals(
                newStatus
        )) {

            throw new IllegalArgumentException(
                    "Don hang da huy khong the cap nhat lai"
            );
        }

        // Don hoan thanh -> khong doi lai
        if ("COMPLETED".equals(
                currentStatus
        )
                && !"COMPLETED".equals(
                newStatus
        )) {

            throw new IllegalArgumentException(
                    "Don hang da hoan thanh khong the cap nhat lai"
            );
        }

        // Huy don -> hoan ton kho
        if ("CANCELLED".equals(
                newStatus
        )
                && !"CANCELLED".equals(
                currentStatus
        )) {

            List<OrderItem> orderItems =
                    orderItemRepository
                            .findByOrderId(
                                    order.getId()
                            );

            for (OrderItem orderItem
                    : orderItems) {

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

                product.setStockQuantity(
                        product.getStockQuantity()
                                + orderItem.getQuantity()
                );

                productRepository.save(
                        product
                );
            }
        }

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
}