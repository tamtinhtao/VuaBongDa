package vn.edu.vuabongda.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.user.dto.UpdateUserRoleRequestDTO;
import vn.edu.vuabongda.user.dto.UpdateUserStatusRequestDTO;
import vn.edu.vuabongda.user.dto.UserResponseDTO;
import vn.edu.vuabongda.user.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    // ================================
    // DANH SACH USER
    // ================================
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {

        return userService
                .getAllUsers();
    }

    // ================================
    // CHI TIET USER
    // ================================
    @GetMapping("/{userId}")
    public UserResponseDTO getUserById(
            @PathVariable Long userId
    ) {

        return userService
                .getUserById(
                        userId
                );
    }

    // ================================
    // KHOA / MO KHOA
    // ================================
    @PutMapping("/{userId}/status")
    public UserResponseDTO updateUserStatus(
            @PathVariable Long userId,
            @Valid
            @RequestBody
            UpdateUserStatusRequestDTO request,
            Authentication authentication
    ) {

        Long currentAdminId =
                getCurrentUserId(
                        authentication
                );

        return userService
                .updateUserStatus(
                        currentAdminId,
                        userId,
                        request.getStatus()
                );
    }

    // ================================
    // DOI ROLE
    // ================================
    @PutMapping("/{userId}/role")
    public UserResponseDTO updateUserRole(
            @PathVariable Long userId,
            @Valid
            @RequestBody
            UpdateUserRoleRequestDTO request,
            Authentication authentication
    ) {

        Long currentAdminId =
                getCurrentUserId(
                        authentication
                );

        return userService
                .updateUserRole(
                        currentAdminId,
                        userId,
                        request.getRole()
                );
    }

    // ================================
    // LAY ID USER DANG DANG NHAP
    // ================================
    private Long getCurrentUserId(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                        authentication
                                .getCredentials()
                                == null
        ) {

            throw new IllegalArgumentException(
                    "Khong xac dinh duoc tai khoan dang dang nhap"
            );
        }

        Object credentials =
                authentication
                        .getCredentials();

        if (
                credentials
                        instanceof Number
        ) {

            return ((Number) credentials)
                    .longValue();
        }

        try {

            return Long.valueOf(
                    credentials.toString()
            );

        } catch (
                NumberFormatException e
        ) {

            throw new IllegalArgumentException(
                    "Khong xac dinh duoc tai khoan dang dang nhap"
            );
        }
    }
}