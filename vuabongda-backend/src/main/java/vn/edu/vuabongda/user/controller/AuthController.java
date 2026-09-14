package vn.edu.vuabongda.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.user.dto.RegisterRequestDTO;
import vn.edu.vuabongda.user.dto.UserResponseDTO;
import vn.edu.vuabongda.user.service.UserService;

import vn.edu.vuabongda.user.dto.LoginRequestDTO;
import vn.edu.vuabongda.user.dto.LoginResponseDTO;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO register(
            @Valid @RequestBody RegisterRequestDTO dto
    ) {
        return userService.register(dto);
    }
    @PostMapping("/login")
    public LoginResponseDTO login(
            @Valid @RequestBody LoginRequestDTO dto
    ) {
        return userService.login(dto);
    }
}