package vn.edu.vuabongda.promotion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PromotionApplyRequestDTO {

    @NotBlank(
            message = "Ma khuyen mai khong duoc de trong"
    )
    private String code;

    @NotNull(
            message = "Tong tien don hang khong duoc de trong"
    )
    @DecimalMin(
            value = "0.01",
            message = "Tong tien don hang phai lon hon 0"
    )
    private BigDecimal originalAmount;
}