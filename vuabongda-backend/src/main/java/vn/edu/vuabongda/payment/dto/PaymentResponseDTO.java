package vn.edu.vuabongda.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {

    private Long id;

    private Long orderId;

    private String paymentMethod;

    private BigDecimal amount;

    private String status;

    private String transactionCode;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}