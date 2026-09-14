package vn.edu.vuabongda.payment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.payment.dto.PaymentResponseDTO;
import vn.edu.vuabongda.payment.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order/{orderId}")
    public PaymentResponseDTO getPaymentByOrderId(
            Authentication authentication,
            @PathVariable Long orderId
    ) {

        return paymentService.getPaymentByOrderId(
                authentication.getName(),
                orderId
        );
    }
}