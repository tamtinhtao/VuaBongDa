package vn.edu.vuabongda.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.vuabongda.order.entity.OrderItem;

import java.util.List;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);
}