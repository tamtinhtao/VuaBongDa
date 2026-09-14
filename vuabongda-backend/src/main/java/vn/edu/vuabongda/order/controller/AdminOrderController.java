package vn.edu.vuabongda.order.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.order.dto.OrderResponseDTO;
import vn.edu.vuabongda.order.dto.UpdateOrderStatusRequestDTO;
import vn.edu.vuabongda.order.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    // ================================
    // ADMIN - LAY TAT CA DON HANG
    // ================================
    @GetMapping
    public List<OrderResponseDTO> getAllOrders() {

        return orderService.getAllOrders();
    }

    // ================================
    // ADMIN - XEM CHI TIET DON HANG
    // ================================
    @GetMapping("/{orderId}")
    public OrderResponseDTO getOrderById(
            @PathVariable Long orderId
    ) {

        return orderService.getOrderById(orderId);
    }

    // ================================
    // ADMIN - CAP NHAT TRANG THAI
    // ================================
    @PutMapping("/{orderId}/status")
    public OrderResponseDTO updateOrderStatus(
            @PathVariable Long orderId,
            @Valid
            @RequestBody UpdateOrderStatusRequestDTO request
    ) {

        return orderService.updateOrderStatus(
                orderId,
                request
        );
    }
}