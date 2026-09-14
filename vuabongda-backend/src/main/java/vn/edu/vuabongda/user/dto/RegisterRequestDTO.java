package vn.edu.vuabongda.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "Username khong duoc de trong")
    @Size(min = 4, max = 50, message = "Username phai tu 4 den 50 ky tu")
    private String username;

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong dung dinh dang")
    private String email;

    @NotBlank(message = "Mat khau khong duoc de trong")
    @Size(min = 6, message = "Mat khau phai co it nhat 6 ky tu")
    private String password;

    @NotBlank(message = "Ho ten khong duoc de trong")
    private String fullName;

    private String phone;
}