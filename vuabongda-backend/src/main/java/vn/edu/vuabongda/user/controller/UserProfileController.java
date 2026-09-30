package vn.edu.vuabongda.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.user.dto.ChangePasswordRequestDTO;
import vn.edu.vuabongda.user.dto.UpdateProfileRequestDTO;
import vn.edu.vuabongda.user.dto.UserResponseDTO;
import vn.edu.vuabongda.user.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    // ================================
    // THONG TIN TAI KHOAN HIEN TAI
    // ================================
    @GetMapping("/me")
    public UserResponseDTO getMyProfile(
            Authentication authentication
    ) {

        Long userId =
                getCurrentUserId(
                        authentication
                );

        return userService
                .getMyProfile(
                        userId
                );
    }

    // ================================
    // CAP NHAT THONG TIN CA NHAN
    // ================================
    @PutMapping("/me")
    public UserResponseDTO updateMyProfile(
            Authentication authentication,
            @Valid
            @RequestBody
            UpdateProfileRequestDTO request
    ) {

        Long userId =
                getCurrentUserId(
                        authentication
                );

        return userService
                .updateMyProfile(
                        userId,
                        request
                );
    }

    // ================================
    // DOI MAT KHAU
    // ================================
    @PutMapping("/me/password")
    public void changePassword(
            Authentication authentication,
            @Valid
            @RequestBody
            ChangePasswordRequestDTO request
    ) {

        Long userId =
                getCurrentUserId(
                        authentication
                );

        userService
                .changePassword(
                        userId,
                        request
                );
    }

    // ================================
    // USER ID TU JWT
    // ================================
    private Long getCurrentUserId(
            Authentication authentication
    ) {

        if (
                authentication == null
                        ||
                        authentication.getCredentials()
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
                credentials instanceof Number
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