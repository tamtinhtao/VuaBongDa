package vn.edu.vuabongda.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal subtotal;
}