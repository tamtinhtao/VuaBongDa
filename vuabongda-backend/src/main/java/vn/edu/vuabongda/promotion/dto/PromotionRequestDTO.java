package vn.edu.vuabongda.promotion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromotionRequestDTO {
    @NotBlank(message = "Ma khuyen mai khong duoc de trong")
    private String code;

    @NotBlank(message = "Ten khuyen mai khong duoc de trong")
    private String name;

    private String description;

    @NotBlank(message = "Loai giam gia khong duoc de trong")
    @Pattern(regexp = "PERCENT|FIXED", message = "Loai giam gia chi chap nhan PERCENT hoac FIXED")
    private String discountType;

    @NotNull(message = "Gia tri giam khong duoc de trong")
    @DecimalMin(value = "0.01", message = "Gia tri giam phai lon hon 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", message = "Gia tri don toi thieu khong hop le")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0.0", message = "Muc giam toi da khong hop le")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Thoi gian bat dau khong duoc de trong")
    private LocalDateTime startAt;

    @NotNull(message = "Thoi gian ket thuc khong duoc de trong")
    private LocalDateTime endAt;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "Trang thai khong hop le")
    private String status;
}