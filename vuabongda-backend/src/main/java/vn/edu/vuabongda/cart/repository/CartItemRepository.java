package vn.edu.vuabongda.cart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.vuabongda.cart.entity.CartItem;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(Long cartId);

    Optional<CartItem> findByCartIdAndProductIdAndSize(
            Long cartId,
            Long productId,
            String size
    );

    Optional<CartItem> findByCartIdAndProductIdAndSizeIsNull(
            Long cartId,
            Long productId
    );

    Optional<CartItem> findByIdAndCartId(
            Long id,
            Long cartId
    );

    void deleteAllByCartId(Long cartId);
}