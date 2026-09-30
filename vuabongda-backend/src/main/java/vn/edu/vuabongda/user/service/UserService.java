package vn.edu.vuabongda.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.vuabongda.security.JwtUtil;
import vn.edu.vuabongda.user.dto.LoginRequestDTO;
import vn.edu.vuabongda.user.dto.LoginResponseDTO;
import vn.edu.vuabongda.user.dto.RegisterRequestDTO;
import vn.edu.vuabongda.user.dto.UserResponseDTO;
import vn.edu.vuabongda.user.entity.User;
import vn.edu.vuabongda.user.repository.UserRepository;
import vn.edu.vuabongda.user.dto.ChangePasswordRequestDTO;
import vn.edu.vuabongda.user.dto.UpdateProfileRequestDTO;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ================================
    // REGISTER
    // ================================
    public UserResponseDTO register(
            RegisterRequestDTO dto
    ) {

        if (
                userRepository
                        .existsByUsername(
                                dto.getUsername()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Username da ton tai"
            );
        }

        if (
                userRepository
                        .existsByEmail(
                                dto.getEmail()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Email da ton tai"
            );
        }

        User user = new User();

        user.setUsername(
                dto.getUsername()
        );

        user.setEmail(
                dto.getEmail()
        );

        user.setPassword(
                passwordEncoder
                        .encode(
                                dto.getPassword()
                        )
        );

        user.setFullName(
                dto.getFullName()
        );

        user.setPhone(
                dto.getPhone()
        );

        // User dang ky
        // luon la CUSTOMER
        user.setRole(
                "CUSTOMER"
        );

        user.setStatus(
                "ACTIVE"
        );

        User saved =
                userRepository
                        .save(user);

        return toDTO(saved);
    }

    // ================================
    // LOGIN
    // ================================
    public LoginResponseDTO login(
            LoginRequestDTO dto
    ) {

        User user =
                userRepository
                        .findByUsername(
                                dto.getUsername()
                        )
                        .orElseThrow(
                                () ->
                                        new BadCredentialsException(
                                                "Username hoac mat khau khong dung"
                                        )
                        );

        // Tai khoan bi khoa
        if (
                !"ACTIVE".equals(
                        user.getStatus()
                )
        ) {

            throw new IllegalArgumentException(
                    "Tai khoan da bi khoa"
            );
        }

        if (
                !passwordEncoder
                        .matches(
                                dto.getPassword(),
                                user.getPassword()
                        )
        ) {

            throw new BadCredentialsException(
                    "Username hoac mat khau khong dung"
            );
        }

        String token =
                jwtUtil.generateToken(
                        user.getId(),
                        user.getUsername(),
                        user.getRole()
                );

        return new LoginResponseDTO(
                user.getId(),
                token,
                user.getUsername(),
                user.getRole()
        );
    }

    // ================================
    // ADMIN - GET ALL USERS
    // ================================
    public List<UserResponseDTO>
    getAllUsers() {

        return userRepository
                .findAll()
                .stream()
                .sorted(
                        (a, b) ->
                                Long.compare(
                                        b.getId(),
                                        a.getId()
                                )
                )
                .map(this::toDTO)
                .toList();
    }

    // ================================
    // ADMIN - GET USER
    // ================================
    public UserResponseDTO getUserById(
            Long userId
    ) {

        return toDTO(
                findUser(
                        userId
                )
        );
    }

    // ================================
// PROFILE - GET CURRENT USER
// ================================
    public UserResponseDTO getMyProfile(
            Long userId
    ) {

        User user =
                findUser(userId);

        return toDTO(user);
    }

    // ================================
// PROFILE - UPDATE
// ================================
    public UserResponseDTO updateMyProfile(
            Long userId,
            UpdateProfileRequestDTO request
    ) {

        User user =
                findUser(userId);

        String fullName =
                request.getFullName()
                        .trim();

        if (fullName.isBlank()) {

            throw new IllegalArgumentException(
                    "Ho ten khong duoc de trong"
            );
        }

        user.setFullName(
                fullName
        );

        String phone =
                request.getPhone();

        if (
                phone == null
                        ||
                        phone.isBlank()
        ) {

            user.setPhone(null);

        } else {

            user.setPhone(
                    phone.trim()
            );
        }

        User saved =
                userRepository.save(user);

        return toDTO(saved);
    }

    // ================================
// PROFILE - CHANGE PASSWORD
// ================================
    public void changePassword(
            Long userId,
            ChangePasswordRequestDTO request
    ) {

        User user =
                findUser(userId);

        if (
                !passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                )
        ) {

            throw new IllegalArgumentException(
                    "Mat khau hien tai khong dung"
            );
        }

        if (
                !request.getNewPassword()
                        .equals(
                                request.getConfirmPassword()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Xac nhan mat khau moi khong khop"
            );
        }

        if (
                passwordEncoder.matches(
                        request.getNewPassword(),
                        user.getPassword()
                )
        ) {

            throw new IllegalArgumentException(
                    "Mat khau moi phai khac mat khau hien tai"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
    }
    // ================================
    // ADMIN - UPDATE STATUS
    // ================================
    public UserResponseDTO updateUserStatus(
            Long currentAdminId,
            Long targetUserId,
            String status
    ) {

        User targetUser =
                findUser(
                        targetUserId
                );

        if (
                status == null ||
                        status.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Trang thai khong hop le"
            );
        }

        String normalizedStatus =
                status
                        .trim()
                        .toUpperCase();

        if (
                !"ACTIVE".equals(
                        normalizedStatus
                ) &&
                        !"INACTIVE".equals(
                                normalizedStatus
                        )
        ) {

            throw new IllegalArgumentException(
                    "Trang thai chi co the la ACTIVE hoac INACTIVE"
            );
        }

        // ================================
        // ADMIN KHONG DUOC TU KHOA
        // ================================
        if (
                currentAdminId.equals(
                        targetUserId
                ) &&
                        "INACTIVE".equals(
                                normalizedStatus
                        )
        ) {

            throw new IllegalArgumentException(
                    "Admin khong the tu khoa tai khoan cua minh"
            );
        }

        targetUser.setStatus(
                normalizedStatus
        );

        User saved =
                userRepository
                        .save(
                                targetUser
                        );

        return toDTO(saved);
    }

    // ================================
    // ADMIN - UPDATE ROLE
    // ================================
    public UserResponseDTO updateUserRole(
            Long currentAdminId,
            Long targetUserId,
            String role
    ) {

        User targetUser =
                findUser(
                        targetUserId
                );

        if (
                role == null ||
                        role.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Vai tro khong hop le"
            );
        }

        String normalizedRole =
                role
                        .trim()
                        .toUpperCase();

        if (
                !"CUSTOMER".equals(
                        normalizedRole
                ) &&
                        !"ADMIN".equals(
                                normalizedRole
                        )
        ) {

            throw new IllegalArgumentException(
                    "Vai tro chi co the la CUSTOMER hoac ADMIN"
            );
        }

        // ================================
        // ADMIN KHONG DUOC TU HA ROLE
        // ================================
        if (
                currentAdminId.equals(
                        targetUserId
                ) &&
                        "CUSTOMER".equals(
                                normalizedRole
                        )
        ) {

            throw new IllegalArgumentException(
                    "Admin khong the tu ha quyen cua minh"
            );
        }

        targetUser.setRole(
                normalizedRole
        );

        User saved =
                userRepository
                        .save(
                                targetUser
                        );

        return toDTO(saved);
    }

    // ================================
    // FIND USER
    // ================================
    private User findUser(
            Long userId
    ) {

        return userRepository
                .findById(userId)
                .orElseThrow(
                        () ->
                                new NoSuchElementException(
                                        "Khong tim thay tai khoan"
                                )
                );
    }

    // ================================
    // ENTITY -> DTO
    // ================================
    private UserResponseDTO toDTO(
            User user
    ) {

        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}