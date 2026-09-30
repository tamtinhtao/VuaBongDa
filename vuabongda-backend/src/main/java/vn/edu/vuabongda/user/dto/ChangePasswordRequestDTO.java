package vn.edu.vuabongda.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequestDTO {

    @NotBlank(message = "Mat khau hien tai khong duoc de trong")
    private String currentPassword;

    @NotBlank(message = "Mat khau moi khong duoc de trong")
    @Size(
            min = 6,
            message = "Mat khau moi phai co it nhat 6 ky tu"
    )
    private String newPassword;

    @NotBlank(message = "Xac nhan mat khau khong duoc de trong")
    private String confirmPassword;
}