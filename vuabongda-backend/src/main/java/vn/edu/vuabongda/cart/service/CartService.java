package vn.edu.vuabongda.cart.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.vuabongda.cart.dto.AddToCartRequestDTO;
import vn.edu.vuabongda.cart.dto.CartItemResponseDTO;
import vn.edu.vuabongda.cart.dto.CartResponseDTO;
import vn.edu.vuabongda.cart.dto.UpdateCartItemRequestDTO;
import vn.edu.vuabongda.cart.entity.Cart;
import vn.edu.vuabongda.cart.entity.CartItem;
import vn.edu.vuabongda.cart.repository.CartItemRepository;
import vn.edu.vuabongda.cart.repository.CartRepository;
import vn.edu.vuabongda.product.entity.Product;
import vn.edu.vuabongda.product.repository.ProductRepository;
import vn.edu.vuabongda.user.entity.User;
import vn.edu.vuabongda.user.repository.UserRepository;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // ================================
    // LAY GIO HANG
    // ================================
    public CartResponseDTO getCart(
            String username
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        return toCartResponseDTO(cart);
    }

    // ================================
    // THEM SAN PHAM VAO GIO
    // ================================
    public CartResponseDTO addItem(
            String username,
            AddToCartRequestDTO request
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        Product product = productRepository
                .findById(request.getProductId())
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

        CartItem cartItem =
                findItemByProductAndSize(
                        cart.getId(),
                        product.getId(),
                        size
                );

        int newQuantity =
                request.getQuantity();

        if (cartItem != null) {

            newQuantity =
                    cartItem.getQuantity()
                            + request.getQuantity();
        }

        // Kiem tra tong so luong cung product
        // trong toan bo gio hang
        int currentTotal =
                getTotalProductQuantity(
                        cart.getId(),
                        product.getId()
                );

        int newTotal;

        if (cartItem != null) {

            newTotal =
                    currentTotal
                            - cartItem.getQuantity()
                            + newQuantity;

        } else {

            newTotal =
                    currentTotal
                            + request.getQuantity();
        }

        if (newTotal
                > product.getStockQuantity()) {

            throw new IllegalArgumentException(
                    "So luong vuot qua ton kho"
            );
        }

        if (cartItem == null) {

            cartItem =
                    new CartItem();

            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setSize(size);
        }

        cartItem.setQuantity(
                newQuantity
        );

        cartItemRepository.save(
                cartItem
        );

        return toCartResponseDTO(
                cart
        );
    }

    // ================================
    // CAP NHAT SIZE + SO LUONG
    // ================================
    public CartResponseDTO updateItem(
            String username,
            Long itemId,
            UpdateCartItemRequestDTO request
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        CartItem currentItem =
                cartItemRepository
                        .findByIdAndCartId(
                                itemId,
                                cart.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Khong tim thay san pham trong gio hang"
                                        )
                        );

        Product product =
                currentItem.getProduct();

        validateProduct(product);

        /*
         * Neu frontend chi gui quantity
         * ma khong gui size:
         * -> giu nguyen size hien tai.
         */
        String newSize;

        if (request.getSize() == null) {

            newSize =
                    currentItem.getSize();

        } else {

            newSize =
                    normalizeSize(
                            request.getSize()
                    );
        }

        validateSize(
                product,
                newSize
        );

        // ================================
        // KIEM TRA TONG TON KHO
        // ================================
        int currentTotal =
                getTotalProductQuantity(
                        cart.getId(),
                        product.getId()
                );

        int newTotal =
                currentTotal
                        - currentItem.getQuantity()
                        + request.getQuantity();

        if (newTotal
                > product.getStockQuantity()) {

            throw new IllegalArgumentException(
                    "So luong vuot qua ton kho"
            );
        }

        /*
         * Tim xem trong gio da co
         * cung product + size moi hay chua.
         */
        CartItem targetItem =
                findItemByProductAndSize(
                        cart.getId(),
                        product.getId(),
                        newSize
                );

        // ================================
        // DOI SANG SIZE DA TON TAI
        // -> GOP HAI DONG
        // ================================
        if (targetItem != null
                && !targetItem.getId()
                .equals(currentItem.getId())) {

            int mergedQuantity =
                    targetItem.getQuantity()
                            + request.getQuantity();

            /*
             * newTotal ben tren da tinh:
             *
             * tong hien tai
             * - quantity dong dang sua
             * + quantity moi
             *
             * nen da bao gom truong hop merge.
             */

            targetItem.setQuantity(
                    mergedQuantity
            );

            cartItemRepository.save(
                    targetItem
            );

            cartItemRepository.delete(
                    currentItem
            );

        } else {

            // ================================
            // KHONG BI TRUNG SIZE
            // ================================
            currentItem.setSize(
                    newSize
            );

            currentItem.setQuantity(
                    request.getQuantity()
            );

            cartItemRepository.save(
                    currentItem
            );
        }

        return toCartResponseDTO(
                cart
        );
    }

    // ================================
    // XOA 1 ITEM
    // ================================
    public CartResponseDTO removeItem(
            String username,
            Long itemId
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        CartItem cartItem =
                cartItemRepository
                        .findByIdAndCartId(
                                itemId,
                                cart.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Khong tim thay san pham trong gio hang"
                                        )
                        );

        cartItemRepository.delete(
                cartItem
        );

        return toCartResponseDTO(
                cart
        );
    }

    // ================================
    // XOA TOAN BO GIO
    // ================================
    public CartResponseDTO clearCart(
            String username
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        cartItemRepository
                .deleteAllByCartId(
                        cart.getId()
                );

        return toCartResponseDTO(
                cart
        );
    }

    // ================================
    // TIM ITEM THEO PRODUCT + SIZE
    // ================================
    private CartItem findItemByProductAndSize(
            Long cartId,
            Long productId,
            String size
    ) {

        if (size == null) {

            return cartItemRepository
                    .findByCartIdAndProductIdAndSizeIsNull(
                            cartId,
                            productId
                    )
                    .orElse(null);
        }

        return cartItemRepository
                .findByCartIdAndProductIdAndSize(
                        cartId,
                        productId,
                        size
                )
                .orElse(null);
    }

    // ================================
    // TONG QUANTITY CUA 1 PRODUCT
    // TRONG CART
    // ================================
    private int getTotalProductQuantity(
            Long cartId,
            Long productId
    ) {

        return cartItemRepository
                .findByCartId(cartId)
                .stream()
                .filter(
                        item ->
                                item.getProduct()
                                        .getId()
                                        .equals(productId)
                )
                .mapToInt(
                        CartItem::getQuantity
                )
                .sum();
    }

    // ================================
    // KIEM TRA PRODUCT
    // ================================
    private void validateProduct(
            Product product
    ) {

        if (!"ACTIVE".equalsIgnoreCase(
                product.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "San pham hien khong hoat dong"
            );
        }

        if (product.getStockQuantity() == null
                || product.getStockQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "San pham da het hang"
            );
        }
    }

    // ================================
    // CHUAN HOA SIZE
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
    // CHUAN HOA TEXT
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
    // KIEM TRA SIZE
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

        // Giay / quan ao bat buoc size
        if ((isShoes || isClothing)
                && size == null) {

            throw new IllegalArgumentException(
                    "Vui long chon size"
            );
        }

        // Bong / phu kien khong can size
        if (!isShoes
                && !isClothing
                && size != null) {

            throw new IllegalArgumentException(
                    "San pham nay khong can chon size"
            );
        }

        // SIZE GIAY
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

        // SIZE QUAN AO
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
    // TIM USER
    // ================================
    private User getUser(
            String username
    ) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(
                        () ->
                                new NoSuchElementException(
                                        "Khong tim thay nguoi dung"
                                )
                );
    }

    // ================================
    // LAY HOAC TAO CART
    // ================================
    private Cart getOrCreateCart(
            User user
    ) {

        return cartRepository
                .findByUserId(
                        user.getId()
                )
                .orElseGet(
                        () -> {

                            Cart cart =
                                    new Cart();

                            cart.setUser(
                                    user
                            );

                            return cartRepository
                                    .save(
                                            cart
                                    );
                        }
                );
    }

    // ================================
    // CART -> DTO
    // ================================
    private CartResponseDTO toCartResponseDTO(
            Cart cart
    ) {

        List<CartItem> cartItems =
                cartItemRepository
                        .findByCartId(
                                cart.getId()
                        );

        List<CartItemResponseDTO> items =
                cartItems.stream()
                        .map(
                                this::toItemDTO
                        )
                        .toList();

        BigDecimal totalAmount =
                items.stream()
                        .map(
                                CartItemResponseDTO
                                        ::getSubtotal
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new CartResponseDTO(
                cart.getId(),
                cart.getUser().getId(),
                items,
                totalAmount
        );
    }

    // ================================
    // ITEM -> DTO
    // ================================
    private CartItemResponseDTO toItemDTO(
            CartItem item
    ) {

        Product product =
                item.getProduct();

        BigDecimal subtotal =
                product.getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        );

        return new CartItemResponseDTO(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                item.getSize(),
                product.getPrice(),
                item.getQuantity(),
                subtotal
        );
    }
}