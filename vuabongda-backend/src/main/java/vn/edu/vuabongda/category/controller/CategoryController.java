package vn.edu.vuabongda.category.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.category.dto.CategoryRequestDTO;
import vn.edu.vuabongda.category.dto.CategoryResponseDTO;
import vn.edu.vuabongda.category.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // CREATE
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponseDTO create(
            @Valid @RequestBody CategoryRequestDTO dto
    ) {
        return categoryService.create(dto);
    }

    // GET ALL
    @GetMapping
    public List<CategoryResponseDTO> getAll() {
        return categoryService.getAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public CategoryResponseDTO getById(
            @PathVariable Long id
    ) {
        return categoryService.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public CategoryResponseDTO update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequestDTO dto
    ) {
        return categoryService.update(id, dto);
    }

    // DELETE
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id
    ) {
        categoryService.delete(id);
    }
}