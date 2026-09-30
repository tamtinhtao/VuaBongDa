package vn.edu.vuabongda.promotion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionApplyResponseDTO {

    private Long promotionId;

    private String code;

    private String name;

    private String discountType;

    private BigDecimal discountValue;

    // Tong tien truoc khuyen mai
    private BigDecimal originalAmount;

    // So tien duoc giam
    private BigDecimal discountAmount;

    // Tong tien sau khi giam
    private BigDecimal finalAmount;
}