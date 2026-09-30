package vn.edu.vuabongda.product.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.vuabongda.product.entity.Product;

import java.util.Optional;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    // ========================================
    // KHOA PRODUCT KHI DAT HANG
    // ========================================
    // SELECT ... FOR UPDATE
    //
    // Trong luc transaction dang tao don,
    // transaction khac phai cho neu cung
    // muon cap nhat ton kho cua product nay.
    // ========================================
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM Product p
            WHERE p.id = :productId
            """)
    Optional<Product> findByIdForUpdate(
            @Param("productId")
            Long productId
    );
}