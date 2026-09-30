package vn.edu.vuabongda.payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.vuabongda.order.entity.Order;
import vn.edu.vuabongda.payment.dto.PaymentResponseDTO;
import vn.edu.vuabongda.payment.entity.Payment;
import vn.edu.vuabongda.payment.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    // ================================
    // TAO PAYMENT CHO ORDER
    // ================================
    public PaymentResponseDTO createPayment(
            Order order,
            String paymentMethod
    ) {

        if (order == null || order.getId() == null) {

            throw new IllegalArgumentException(
                    "Don hang khong hop le"
            );
        }

        if (paymentRepository.existsByOrderId(
                order.getId()
        )) {

            throw new IllegalArgumentException(
                    "Don hang da co thong tin thanh toan"
            );
        }

        if (
                paymentMethod == null
                        ||
                        paymentMethod.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Phuong thuc thanh toan khong hop le"
            );
        }

        String normalizedMethod =
                paymentMethod
                        .trim()
                        .toUpperCase();

        List<String> validMethods =
                List.of(
                        "COD",
                        "BANK_TRANSFER"
                );

        if (
                !validMethods.contains(
                        normalizedMethod
                )
        ) {

            throw new IllegalArgumentException(
                    "Phuong thuc thanh toan chi chap nhan COD hoac BANK_TRANSFER"
            );
        }

        Payment payment =
                new Payment();

        payment.setOrder(
                order
        );

        payment.setPaymentMethod(
                normalizedMethod
        );

        /*
         * Quan trong:
         * So tien Payment lay tu Order da duoc
         * backend tinh sau khi ap dung promotion.
         *
         * Khong lay tong tien tu frontend.
         */
        payment.setAmount(
                order.getTotalAmount()
        );

        payment.setStatus(
                "PENDING"
        );

        Payment savedPayment =
                paymentRepository.save(
                        payment
                );

        return toDTO(
                savedPayment
        );
    }

    // ================================
    // XEM PAYMENT CUA DON HANG
    // ================================
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentByOrderId(
            String username,
            Long orderId
    ) {

        Payment payment =
                paymentRepository
                        .findByOrderId(
                                orderId
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay thong tin thanh toan"
                                )
                        );

        // Customer chi duoc xem
        // payment cua don hang cua minh
        if (
                !payment
                        .getOrder()
                        .getUser()
                        .getUsername()
                        .equals(username)
        ) {

            throw new NoSuchElementException(
                    "Khong tim thay thong tin thanh toan"
            );
        }

        return toDTO(
                payment
        );
    }

    // ================================
    // HUY PAYMENT KHI ORDER BI HUY
    // ================================
    public void cancelPayment(
            Long orderId
    ) {

        Payment payment =
                paymentRepository
                        .findByOrderId(
                                orderId
                        )
                        .orElse(null);

        /*
         * Ho tro ca cac order cu neu DB
         * chua co payment.
         */
        if (payment == null) {
            return;
        }

        if (
                "CANCELLED".equalsIgnoreCase(
                        payment.getStatus()
                )
        ) {
            return;
        }

        /*
         * He thong hien tai chua co nghiep vu
         * hoan tien.
         *
         * Neu sau nay co payment PAID truoc khi huy
         * thi phai xu ly REFUND rieng.
         */
        if (
                "PAID".equalsIgnoreCase(
                        payment.getStatus()
                )
        ) {

            throw new IllegalArgumentException(
                    "Don hang da thanh toan, can xu ly hoan tien truoc khi huy"
            );
        }

        payment.setStatus(
                "CANCELLED"
        );

        paymentRepository.save(
                payment
        );
    }

    // ================================
    // DANH DAU DA THANH TOAN
    // ================================
    public void markPaymentPaid(
            Long orderId
    ) {

        Payment payment =
                paymentRepository
                        .findByOrderId(
                                orderId
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay thong tin thanh toan"
                                )
                        );

        if (
                "PAID".equalsIgnoreCase(
                        payment.getStatus()
                )
        ) {
            return;
        }

        if (
                "CANCELLED".equalsIgnoreCase(
                        payment.getStatus()
                )
        ) {

            throw new IllegalArgumentException(
                    "Thanh toan cua don hang da bi huy"
            );
        }

        payment.setStatus(
                "PAID"
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        paymentRepository.save(
                payment
        );
    }

    // ================================
    // ENTITY -> DTO
    // ================================
    private PaymentResponseDTO toDTO(
            Payment payment
    ) {

        return new PaymentResponseDTO(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getPaymentMethod(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getTransactionCode(),
                payment.getPaidAt(),
                payment.getCreatedAt()
        );
    }
}