package vn.edu.vuabongda.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateOrderRequestDTO {

    @NotBlank(
            message = "Ten nguoi nhan khong duoc de trong"
    )
    private String recipientName;

    @NotBlank(
            message = "So dien thoai khong duoc de trong"
    )
    private String phone;

    @NotBlank(
            message = "Dia chi giao hang khong duoc de trong"
    )
    private String shippingAddress;

    @NotBlank(
            message = "Phuong thuc thanh toan khong duoc de trong"
    )
    @Pattern(
            regexp = "COD|BANK_TRANSFER",
            message = "Phuong thuc thanh toan chi chap nhan COD hoac BANK_TRANSFER"
    )
    private String paymentMethod;
}