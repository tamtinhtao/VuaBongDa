package vn.edu.vuabongda.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.vuabongda.payment.entity.Payment;

import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);
}