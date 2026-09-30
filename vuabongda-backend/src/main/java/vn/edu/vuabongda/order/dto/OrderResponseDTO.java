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

    // ID don hang
    private Long id;

    // ID nguoi dung
    private Long userId;

    // Thong tin nguoi nhan
    private String recipientName;

    private String phone;

    private String shippingAddress;

    // ================================
    // PROMOTION / AMOUNT
    // ================================

    // Tong tien truoc khuyen mai
    private BigDecimal originalAmount;

    // So tien duoc giam
    private BigDecimal discountAmount;

    // Ma khuyen mai da su dung
    private String promotionCode;

    // Tong tien cuoi cung phai thanh toan
    private BigDecimal totalAmount;

    // Trang thai don hang
    private String status;

    // Thoi gian tao
    private LocalDateTime createdAt;

    // Danh sach san pham
    private List<OrderItemResponseDTO> items;
}