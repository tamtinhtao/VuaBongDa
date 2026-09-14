package vn.edu.vuabongda.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.vuabongda.user.dto.RegisterRequestDTO;
import vn.edu.vuabongda.user.dto.UserResponseDTO;
import vn.edu.vuabongda.user.entity.User;
import vn.edu.vuabongda.user.repository.UserRepository;

import vn.edu.vuabongda.security.JwtUtil;
import vn.edu.vuabongda.user.dto.LoginRequestDTO;
import vn.edu.vuabongda.user.dto.LoginResponseDTO;
import org.springframework.security.authentication.BadCredentialsException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    public UserResponseDTO register(RegisterRequestDTO dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException(
                    "Username da ton tai"
            );
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException(
                    "Email da ton tai"
            );
        }

        User user = new User();

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        user.setPassword(
                passwordEncoder.encode(dto.getPassword())
        );

        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());

        // Người đăng ký thông thường luôn là CUSTOMER
        user.setRole("CUSTOMER");
        user.setStatus("ACTIVE");

        User saved = userRepository.save(user);

        return toDTO(saved);
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {

        User user = userRepository
                .findByUsername(dto.getUsername())
                .orElseThrow(
                        () -> new BadCredentialsException(
                                "Username hoac mat khau khong dung"
                        )
                );

        if (!"ACTIVE".equals(user.getStatus())) {

            throw new IllegalArgumentException(
                    "Tai khoan da bi khoa"
            );
        }

        if (!passwordEncoder.matches(
                dto.getPassword(),
                user.getPassword()
        )) {

            throw new BadCredentialsException(
                    "Username hoac mat khau khong dung"
            );
        }

        String token = jwtUtil.generateToken(
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
    private UserResponseDTO toDTO(User user) {

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