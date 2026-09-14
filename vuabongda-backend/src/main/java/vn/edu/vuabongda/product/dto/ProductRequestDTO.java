package vn.edu.vuabongda.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequestDTO {

    @NotBlank(message = "Ten san pham khong duoc de trong")
    private String name;

    private String description;

    @NotNull(message = "Gia san pham khong duoc de trong")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Gia san pham phai lon hon 0"
    )
    private BigDecimal price;

    @NotNull(message = "So luong ton kho khong duoc de trong")
    @Min(
            value = 0,
            message = "So luong ton kho khong duoc am"
    )
    private Integer stockQuantity;

    private String imageUrl;

    private String brand;

    @NotNull(message = "Danh muc khong duoc de trong")
    private Long categoryId;
}