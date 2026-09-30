package vn.edu.vuabongda.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserRoleRequestDTO {

    @NotBlank(message = "Vai tro khong duoc de trong")
    private String role;
}