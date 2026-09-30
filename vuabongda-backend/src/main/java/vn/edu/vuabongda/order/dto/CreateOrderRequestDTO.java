package vn.edu.vuabongda.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequestDTO {

    @NotBlank(
            message = "Ten nguoi nhan khong duoc de trong"
    )
    @Size(
            max = 100,
            message = "Ten nguoi nhan toi da 100 ky tu"
    )
    private String recipientName;

    @NotBlank(
            message = "So dien thoai khong duoc de trong"
    )
    @Pattern(
            regexp = "^(0\\d{9}|\\+84\\d{9})$",
            message = "So dien thoai khong hop le"
    )
    private String phone;

    @NotBlank(
            message = "Dia chi giao hang khong duoc de trong"
    )
    @Size(
            max = 500,
            message = "Dia chi giao hang toi da 500 ky tu"
    )
    private String shippingAddress;

    @NotBlank(
            message = "Phuong thuc thanh toan khong duoc de trong"
    )
    @Pattern(
            regexp = "^(COD|BANK_TRANSFER)$",
            message = "Phuong thuc thanh toan chi chap nhan COD hoac BANK_TRANSFER"
    )
    private String paymentMethod;

    // CART / BUY_NOW
    @Pattern(
            regexp = "^(CART|BUY_NOW)$",
            message = "Che do dat hang chi chap nhan CART hoac BUY_NOW"
    )
    private String mode = "CART";

    // CART MODE
    private List<Long> cartItemIds;

    // BUY NOW MODE
    private Long productId;

    @Min(
            value = 1,
            message = "So luong phai lon hon 0"
    )
    private Integer quantity;

    @Size(
            max = 20,
            message = "Size khong hop le"
    )
    private String size;

    // PROMOTION
    @Size(
            max = 50,
            message = "Ma khuyen mai khong hop le"
    )
    private String promotionCode;
}