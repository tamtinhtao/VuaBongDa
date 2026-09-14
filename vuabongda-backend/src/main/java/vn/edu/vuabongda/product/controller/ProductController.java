package vn.edu.vuabongda.product.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.product.dto.ProductRequestDTO;
import vn.edu.vuabongda.product.dto.ProductResponseDTO;
import vn.edu.vuabongda.product.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // CREATE
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponseDTO create(
            @Valid @RequestBody ProductRequestDTO dto
    ) {
        return productService.create(dto);
    }

    // GET ALL
    @GetMapping
    public Page<ProductResponseDTO> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {

        Sort sort;

        if ("asc".equalsIgnoreCase(direction)) {
            sort = Sort.by(sortBy).ascending();
        } else {
            sort = Sort.by(sortBy).descending();
        }

        Pageable pageable =
                PageRequest.of(page, size, sort);

        return productService.search(
                keyword,
                pageable
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ProductResponseDTO getById(
            @PathVariable Long id
    ) {
        return productService.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ProductResponseDTO update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO dto
    ) {
        return productService.update(id, dto);
    }

    // DELETE
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id
    ) {
        productService.delete(id);
    }
    @PostMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ProductResponseDTO uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return productService.uploadImage(id, file);
    }
}