package vn.edu.vuabongda.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long id;

    private Long userId;

    private String recipientName;

    private String phone;

    private String shippingAddress;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime createdAt;

    private List<OrderItemResponseDTO> items;
}