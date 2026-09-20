package vn.edu.vuabongda.promotion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.vuabongda.promotion.entity.Promotion;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
}