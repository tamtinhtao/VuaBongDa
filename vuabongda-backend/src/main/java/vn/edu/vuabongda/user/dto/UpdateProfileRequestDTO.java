package vn.edu.vuabongda.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequestDTO {

    @NotBlank(message = "Ho ten khong duoc de trong")
    @Size(max = 100, message = "Ho ten toi da 100 ky tu")
    private String fullName;

    @Size(max = 20, message = "So dien thoai toi da 20 ky tu")
    private String phone;
}