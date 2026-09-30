package vn.edu.vuabongda.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.vuabongda.user.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ================================
    // USER
    // ================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // ================================
    // THONG TIN NHAN HANG
    // ================================
    @Column(
            name = "recipient_name",
            nullable = false,
            length = 100
    )
    private String recipientName;

    @Column(
            nullable = false,
            length = 20
    )
    private String phone;

    @Column(
            name = "shipping_address",
            nullable = false,
            length = 500
    )
    private String shippingAddress;

    // ================================
    // TONG TIEN TRUOC KHUYEN MAI
    // ================================
    @Column(
            name = "original_amount",
            precision = 15,
            scale = 2
    )
    private BigDecimal originalAmount;

    // ================================
    // SO TIEN DUOC GIAM
    // ================================
    @Column(
            name = "discount_amount",
            precision = 15,
            scale = 2
    )
    private BigDecimal discountAmount;

    // ================================
    // MA KHUYEN MAI DA SU DUNG
    // ================================
    @Column(
            name = "promotion_code",
            length = 50
    )
    private String promotionCode;

    // ================================
    // TONG TIEN CUOI CUNG
    // ================================
    @Column(
            name = "total_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal totalAmount;

    // ================================
    // TRANG THAI DON
    // ================================
    @Column(
            nullable = false,
            length = 30
    )
    private String status = "PENDING";

    // ================================
    // THOI GIAN
    // ================================
    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    // ================================
    // BEFORE INSERT
    // ================================
    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;

        if (status == null
                || status.isBlank()) {

            status = "PENDING";
        }

        /*
         * Don khong dung promotion:
         *
         * originalAmount = totalAmount
         * discountAmount = 0
         */
        if (originalAmount == null
                && totalAmount != null) {

            originalAmount =
                    totalAmount;
        }

        if (discountAmount == null) {

            discountAmount =
                    BigDecimal.ZERO;
        }

        if (promotionCode != null
                && promotionCode.isBlank()) {

            promotionCode = null;
        }
    }

    // ================================
    // BEFORE UPDATE
    // ================================
    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}