package vn.edu.vuabongda.cart.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.cart.dto.AddToCartRequestDTO;
import vn.edu.vuabongda.cart.dto.CartResponseDTO;
import vn.edu.vuabongda.cart.dto.UpdateCartItemRequestDTO;
import vn.edu.vuabongda.cart.service.CartService;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // ================================
    // XEM GIO HANG
    // ================================
    @GetMapping
    public CartResponseDTO getCart(
            Authentication authentication
    ) {

        return cartService.getCart(
                authentication.getName()
        );
    }

    // ================================
    // THEM SAN PHAM
    // ================================
    @PostMapping("/items")
    @ResponseStatus(HttpStatus.OK)
    public CartResponseDTO addItem(
            Authentication authentication,
            @Valid
            @RequestBody AddToCartRequestDTO request
    ) {

        return cartService.addItem(
                authentication.getName(),
                request
        );
    }

    // ================================
    // SUA SO LUONG
    // ================================
    @PutMapping("/items/{itemId}")
    public CartResponseDTO updateItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid
            @RequestBody UpdateCartItemRequestDTO request
    ) {

        return cartService.updateItem(
                authentication.getName(),
                itemId,
                request
        );
    }

    // ================================
    // XOA SAN PHAM
    // ================================
    @DeleteMapping("/items/{itemId}")
    public CartResponseDTO removeItem(
            Authentication authentication,
            @PathVariable Long itemId
    ) {

        return cartService.removeItem(
                authentication.getName(),
                itemId
        );
    }

    // ================================
    // XOA TOAN BO GIO
    // ================================
    @DeleteMapping("/clear")
    public CartResponseDTO clearCart(
            Authentication authentication
    ) {

        return cartService.clearCart(
                authentication.getName()
        );
    }
}