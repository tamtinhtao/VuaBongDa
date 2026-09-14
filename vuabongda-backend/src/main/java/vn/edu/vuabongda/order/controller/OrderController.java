package vn.edu.vuabongda.order.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.order.dto.CreateOrderRequestDTO;
import vn.edu.vuabongda.order.dto.OrderResponseDTO;
import vn.edu.vuabongda.order.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ================================
    // DAT HANG
    // ================================
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponseDTO createOrder(
            Authentication authentication,
            @Valid
            @RequestBody CreateOrderRequestDTO request
    ) {

        return orderService.createOrder(
                authentication.getName(),
                request
        );
    }

    // ================================
    // DANH SACH DON CUA TOI
    // ================================
    @GetMapping
    public List<OrderResponseDTO> getMyOrders(
            Authentication authentication
    ) {

        return orderService.getMyOrders(
                authentication.getName()
        );
    }

    // ================================
    // CHI TIET DON CUA TOI
    // ================================
    @GetMapping("/{orderId}")
    public OrderResponseDTO getMyOrderById(
            Authentication authentication,
            @PathVariable Long orderId
    ) {

        return orderService.getMyOrderById(
                authentication.getName(),
                orderId
        );
    }
}