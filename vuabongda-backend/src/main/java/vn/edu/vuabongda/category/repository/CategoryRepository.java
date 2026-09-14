package vn.edu.vuabongda.category.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.vuabongda.category.entity.Category;

import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);
}