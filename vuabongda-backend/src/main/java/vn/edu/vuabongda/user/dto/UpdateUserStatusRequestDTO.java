package vn.edu.vuabongda.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserStatusRequestDTO {

    @NotBlank(message = "Trang thai khong duoc de trong")
    private String status;
}