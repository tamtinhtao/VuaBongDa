package vn.edu.vuabongda.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.vuabongda.order.entity.Order;

import java.util.List;
import java.util.Optional;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<Order> findByIdAndUserId(
            Long id,
            Long userId
    );

    List<Order> findAllByOrderByCreatedAtDesc();
}