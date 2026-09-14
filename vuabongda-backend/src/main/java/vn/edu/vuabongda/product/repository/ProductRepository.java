package vn.edu.vuabongda.product.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.vuabongda.product.entity.Product;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );
}