package vn.edu.vuabongda.category.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.vuabongda.category.dto.CategoryRequestDTO;
import vn.edu.vuabongda.category.dto.CategoryResponseDTO;
import vn.edu.vuabongda.category.entity.Category;
import vn.edu.vuabongda.category.repository.CategoryRepository;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // =========================
    // CREATE
    // =========================
    public CategoryResponseDTO create(CategoryRequestDTO dto) {

        if (categoryRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException(
                    "Ten danh muc da ton tai"
            );
        }

        Category category = new Category();

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setStatus("ACTIVE");

        Category saved =
                categoryRepository.save(category);

        return toDTO(saved);
    }

    // =========================
    // GET ALL
    // =========================
    public List<CategoryResponseDTO> getAll() {

        return categoryRepository
                .findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================
    public CategoryResponseDTO getById(Long id) {

        Category category =
                categoryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Khong tim thay danh muc id = " + id
                                )
                        );

        return toDTO(category);
    }

    // =========================
    // UPDATE
    // =========================
    public CategoryResponseDTO update(
            Long id,
            CategoryRequestDTO dto
    ) {

        Category category =
                categoryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Khong tim thay danh muc id = " + id
                                )
                        );

        categoryRepository
                .findByName(dto.getName())
                .ifPresent(existing -> {

                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException(
                                "Ten danh muc da ton tai"
                        );
                    }
                });

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        Category saved =
                categoryRepository.save(category);

        return toDTO(saved);
    }

    // =========================
    // DELETE
    // =========================
    public void delete(Long id) {

        if (!categoryRepository.existsById(id)) {
            throw new NoSuchElementException(
                    "Khong tim thay danh muc id = " + id
            );
        }

        categoryRepository.deleteById(id);
    }

    // =========================
    // ENTITY -> DTO
    // =========================
    private CategoryResponseDTO toDTO(
            Category category
    ) {

        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getStatus(),
                category.getCreatedAt()
        );
    }
}