package vn.edu.vuabongda.product.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.vuabongda.category.entity.Category;
import vn.edu.vuabongda.category.repository.CategoryRepository;
import vn.edu.vuabongda.product.dto.ProductRequestDTO;
import vn.edu.vuabongda.product.dto.ProductResponseDTO;
import vn.edu.vuabongda.product.entity.Product;
import vn.edu.vuabongda.product.repository.ProductRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // =========================
    // CREATE
    // =========================
    public ProductResponseDTO create(ProductRequestDTO dto) {

        Category category = categoryRepository
                .findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay danh muc id = "
                                        + dto.getCategoryId()
                        )
                );

        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setBrand(dto.getBrand());
        product.setStatus("ACTIVE");
        product.setCategory(category);

        Product saved = productRepository.save(product);

        return toDTO(saved);
    }

    // =========================
    // SEARCH + PAGINATION + SORT
    // =========================
    public Page<ProductResponseDTO> search(
            String keyword,
            Pageable pageable
    ) {

        Page<Product> products;

        if (keyword == null || keyword.isBlank()) {

            products = productRepository.findAll(pageable);

        } else {

            products =
                    productRepository.findByNameContainingIgnoreCase(
                            keyword.trim(),
                            pageable
                    );
        }

        return products.map(this::toDTO);
    }

    // =========================
    // GET BY ID
    // =========================
    public ProductResponseDTO getById(Long id) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay san pham id = " + id
                        )
                );

        return toDTO(product);
    }

    // =========================
    // UPDATE
    // =========================
    public ProductResponseDTO update(
            Long id,
            ProductRequestDTO dto
    ) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay san pham id = " + id
                        )
                );

        Category category = categoryRepository
                .findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay danh muc id = "
                                        + dto.getCategoryId()
                        )
                );

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setBrand(dto.getBrand());
        product.setCategory(category);

        Product saved = productRepository.save(product);

        return toDTO(saved);
    }

    // =========================
    // DELETE
    // =========================
    public void delete(Long id) {

        if (!productRepository.existsById(id)) {
            throw new NoSuchElementException(
                    "Khong tim thay san pham id = " + id
            );
        }

        productRepository.deleteById(id);
    }

    // =========================
    // UPLOAD IMAGE
    // =========================
    public ProductResponseDTO uploadImage(
            Long id,
            MultipartFile file
    ) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay san pham id = " + id
                        )
                );

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "File anh khong duoc de trong"
            );
        }

        String originalFilename = file.getOriginalFilename();

        String extension = "";

        if (originalFilename != null
                && originalFilename.contains(".")) {

            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        String newFilename =
                UUID.randomUUID() + extension;

        Path uploadDirectory = Paths
                .get("uploads", "products")
                .toAbsolutePath()
                .normalize();

        try {

            Files.createDirectories(uploadDirectory);

            Path targetPath =
                    uploadDirectory.resolve(newFilename);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Khong the luu anh san pham",
                    e
            );
        }

        product.setImageUrl(
                "/uploads/products/" + newFilename
        );

        Product saved =
                productRepository.save(product);

        return toDTO(saved);
    }

    // =========================
    // ENTITY -> DTO
    // =========================
    private ProductResponseDTO toDTO(Product product) {

        return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getBrand(),
                product.getStatus(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}