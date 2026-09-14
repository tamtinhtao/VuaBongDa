package vn.edu.vuabongda.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCartItemRequestDTO {

    @NotNull(message = "So luong khong duoc de trong")
    @Min(value = 1, message = "So luong phai lon hon 0")
    private Integer quantity;
}