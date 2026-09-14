package vn.edu.vuabongda.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateOrderStatusRequestDTO {

    @NotBlank(
            message = "Trang thai don hang khong duoc de trong"
    )
    @Pattern(
            regexp = "PENDING|CONFIRMED|SHIPPING|COMPLETED|CANCELLED",
            message = "Trang thai don hang khong hop le"
    )
    private String status;
}