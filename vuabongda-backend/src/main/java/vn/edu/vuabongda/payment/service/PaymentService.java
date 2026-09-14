package vn.edu.vuabongda.payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.vuabongda.order.entity.Order;
import vn.edu.vuabongda.payment.dto.PaymentResponseDTO;
import vn.edu.vuabongda.payment.entity.Payment;
import vn.edu.vuabongda.payment.repository.PaymentRepository;

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

        if (paymentRepository.existsByOrderId(
                order.getId()
        )) {

            throw new IllegalArgumentException(
                    "Don hang da co thong tin thanh toan"
            );
        }

        Payment payment = new Payment();

        payment.setOrder(order);

        payment.setPaymentMethod(
                paymentMethod
        );

        payment.setAmount(
                order.getTotalAmount()
        );

        payment.setStatus("PENDING");

        Payment savedPayment =
                paymentRepository.save(payment);

        return toDTO(savedPayment);
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
                paymentRepository.findByOrderId(
                                orderId
                        )
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Khong tim thay thong tin thanh toan"
                                )
                        );

        if (!payment.getOrder()
                .getUser()
                .getUsername()
                .equals(username)) {

            throw new NoSuchElementException(
                    "Khong tim thay thong tin thanh toan"
            );
        }

        return toDTO(payment);
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