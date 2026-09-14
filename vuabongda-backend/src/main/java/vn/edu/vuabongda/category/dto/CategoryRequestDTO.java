package vn.edu.vuabongda.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequestDTO {

    @NotBlank(message = "Ten danh muc khong duoc de trong")
    private String name;

    private String description;
}