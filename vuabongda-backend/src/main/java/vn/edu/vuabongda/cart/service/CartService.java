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
    public CartResponseDTO getCart(String username) {

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

        if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalArgumentException(
                    "San pham hien khong hoat dong"
            );
        }

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        product.getId()
                )
                .orElse(null);

        int newQuantity = request.getQuantity();

        if (cartItem != null) {
            newQuantity =
                    cartItem.getQuantity()
                            + request.getQuantity();
        }

        if (newQuantity > product.getStockQuantity()) {
            throw new IllegalArgumentException(
                    "So luong vuot qua ton kho"
            );
        }

        if (cartItem == null) {

            cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProduct(product);
        }

        cartItem.setQuantity(newQuantity);

        cartItemRepository.save(cartItem);

        return toCartResponseDTO(cart);
    }

    // ================================
    // CAP NHAT SO LUONG
    // ================================
    public CartResponseDTO updateItem(
            String username,
            Long itemId,
            UpdateCartItemRequestDTO request
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository
                .findByIdAndCartId(
                        itemId,
                        cart.getId()
                )
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Khong tim thay san pham trong gio hang"
                        )
                );

        Product product = cartItem.getProduct();

        if (request.getQuantity()
                > product.getStockQuantity()) {

            throw new IllegalArgumentException(
                    "So luong vuot qua ton kho"
            );
        }

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return toCartResponseDTO(cart);
    }

    // ================================
    // XOA 1 SAN PHAM
    // ================================
    public CartResponseDTO removeItem(
            String username,
            Long itemId
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository
                .findByIdAndCartId(
                        itemId,
                        cart.getId()
                )
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Khong tim thay san pham trong gio hang"
                        )
                );

        cartItemRepository.delete(cartItem);

        return toCartResponseDTO(cart);
    }

    // ================================
    // XOA TOAN BO GIO
    // ================================
    public CartResponseDTO clearCart(
            String username
    ) {

        User user = getUser(username);

        Cart cart = getOrCreateCart(user);

        cartItemRepository.deleteAllByCartId(
                cart.getId()
        );

        return toCartResponseDTO(cart);
    }

    // ================================
    // TIM USER
    // ================================
    private User getUser(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Khong tim thay nguoi dung"
                        )
                );
    }

    // ================================
    // LAY HOAC TAO CART
    // ================================
    private Cart getOrCreateCart(User user) {

        return cartRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart cart = new Cart();

                    cart.setUser(user);

                    return cartRepository.save(cart);
                });
    }

    // ================================
    // CHUYEN CART -> DTO
    // ================================
    private CartResponseDTO toCartResponseDTO(
            Cart cart
    ) {

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(
                        cart.getId()
                );

        List<CartItemResponseDTO> items =
                cartItems.stream()
                        .map(this::toItemDTO)
                        .toList();

        BigDecimal totalAmount =
                items.stream()
                        .map(
                                CartItemResponseDTO::getSubtotal
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

    private CartItemResponseDTO toItemDTO(
            CartItem item
    ) {

        Product product = item.getProduct();

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
                product.getPrice(),
                item.getQuantity(),
                subtotal
        );
    }
}