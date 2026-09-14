package vn.edu.vuabongda.cart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.vuabongda.cart.entity.Cart;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);
}