package vn.edu.vuabongda.promotion.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.vuabongda.promotion.dto.PromotionApplyResponseDTO;
import vn.edu.vuabongda.promotion.dto.PromotionRequestDTO;
import vn.edu.vuabongda.promotion.dto.PromotionResponseDTO;
import vn.edu.vuabongda.promotion.entity.Promotion;
import vn.edu.vuabongda.promotion.repository.PromotionRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    // ================================
    // CREATE
    // ================================
    public PromotionResponseDTO create(
            PromotionRequestDTO dto
    ) {

        validateBusinessRules(
                dto,
                null
        );

        Promotion promotion =
                new Promotion();

        mapDtoToEntity(
                dto,
                promotion
        );

        Promotion saved =
                promotionRepository.save(
                        promotion
                );

        return mapEntityToResponseDTO(
                saved
        );
    }

    // ================================
    // GET ALL
    // ================================
    public List<PromotionResponseDTO> getAll() {

        return promotionRepository
                .findAll()
                .stream()
                .map(
                        this::mapEntityToResponseDTO
                )
                .toList();
    }

    // ================================
    // GET BY ID
    // ================================
    public PromotionResponseDTO getById(
            Long id
    ) {

        Promotion promotion =
                promotionRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Khong tim thay ma khuyen mai"
                                        )
                        );

        return mapEntityToResponseDTO(
                promotion
        );
    }

    // ================================
    // GET BY CODE
    // ================================
    public PromotionResponseDTO getByCode(
            String code
    ) {

        Promotion promotion =
                findPromotionByCode(
                        code
                );

        return mapEntityToResponseDTO(
                promotion
        );
    }

    // ================================
    // UPDATE
    // ================================
    public PromotionResponseDTO update(
            Long id,
            PromotionRequestDTO dto
    ) {

        Promotion promotion =
                promotionRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Khong tim thay ma khuyen mai"
                                        )
                        );

        validateBusinessRules(
                dto,
                id
        );

        mapDtoToEntity(
                dto,
                promotion
        );

        Promotion updated =
                promotionRepository.save(
                        promotion
                );

        return mapEntityToResponseDTO(
                updated
        );
    }

    // ================================
    // DELETE
    // ================================
    public void delete(
            Long id
    ) {

        if (!promotionRepository
                .existsById(id)) {

            throw new IllegalArgumentException(
                    "Khong tim thay ma khuyen mai"
            );
        }

        promotionRepository
                .deleteById(id);
    }

    // ================================
    // AP DUNG KHUYEN MAI
    // ================================
    public PromotionApplyResponseDTO applyPromotion(
            String code,
            BigDecimal originalAmount
    ) {

        // Kiem tra tong don
        if (originalAmount == null
                || originalAmount.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new IllegalArgumentException(
                    "Tong tien don hang khong hop le"
            );
        }

        Promotion promotion =
                findPromotionByCode(
                        code
                );

        // Kiem tra promotion co dung duoc
        validatePromotionForOrder(
                promotion,
                originalAmount
        );

        BigDecimal discountAmount;

        // ================================
        // GIAM THEO %
        // ================================
        if ("PERCENT".equalsIgnoreCase(
                promotion.getDiscountType()
        )) {

            discountAmount =
                    originalAmount
                            .multiply(
                                    promotion
                                            .getDiscountValue()
                            )
                            .divide(
                                    new BigDecimal("100"),
                                    2,
                                    RoundingMode.HALF_UP
                            );

        } else if ("FIXED".equalsIgnoreCase(
                promotion.getDiscountType()
        )) {

            // ================================
            // GIAM SO TIEN CO DINH
            // ================================
            discountAmount =
                    promotion
                            .getDiscountValue();

        } else {

            throw new IllegalArgumentException(
                    "Loai khuyen mai khong hop le"
            );
        }

        // ================================
        // GIOI HAN GIAM TOI DA
        // ================================
        if (promotion
                .getMaxDiscountAmount()
                != null
                && promotion
                .getMaxDiscountAmount()
                .compareTo(
                        BigDecimal.ZERO
                ) > 0
                && discountAmount
                .compareTo(
                        promotion
                                .getMaxDiscountAmount()
                ) > 0) {

            discountAmount =
                    promotion
                            .getMaxDiscountAmount();
        }

        // ================================
        // KHONG CHO GIAM VUOT QUA DON
        // ================================
        if (discountAmount
                .compareTo(
                        originalAmount
                ) > 0) {

            discountAmount =
                    originalAmount;
        }

        discountAmount =
                discountAmount.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        BigDecimal finalAmount =
                originalAmount
                        .subtract(
                                discountAmount
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        return new PromotionApplyResponseDTO(
                promotion.getId(),
                promotion.getCode(),
                promotion.getName(),
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                originalAmount,
                discountAmount,
                finalAmount
        );
    }

    // ================================
    // VALIDATE PROMOTION KHI DAT HANG
    // ================================
    private void validatePromotionForOrder(
            Promotion promotion,
            BigDecimal orderAmount
    ) {

        // STATUS
        if (!"ACTIVE".equalsIgnoreCase(
                promotion.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "Ma khuyen mai hien khong hoat dong"
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        // CHUA BAT DAU
        if (promotion.getStartAt() != null
                && now.isBefore(
                promotion.getStartAt()
        )) {

            throw new IllegalArgumentException(
                    "Ma khuyen mai chua den thoi gian su dung"
            );
        }

        // HET HAN
        if (promotion.getEndAt() != null
                && now.isAfter(
                promotion.getEndAt()
        )) {

            throw new IllegalArgumentException(
                    "Ma khuyen mai da het han"
            );
        }

        // GIA TRI DON TOI THIEU
        if (promotion
                .getMinOrderAmount()
                != null
                && orderAmount.compareTo(
                promotion
                        .getMinOrderAmount()
        ) < 0) {

            throw new IllegalArgumentException(
                    "Don hang chua dat gia tri toi thieu "
                            + promotion.getMinOrderAmount()
            );
        }
    }

    // ================================
    // FIND BY CODE
    // ================================
    private Promotion findPromotionByCode(
            String code
    ) {

        if (code == null
                || code.isBlank()) {

            throw new IllegalArgumentException(
                    "Ma khuyen mai khong duoc de trong"
            );
        }

        String normalizedCode =
                code.trim()
                        .toUpperCase();

        return promotionRepository
                .findByCodeIgnoreCase(
                        normalizedCode
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Ma khuyen mai khong ton tai"
                                )
                );
    }

    // ================================
    // BUSINESS VALIDATION ADMIN
    // ================================
    private void validateBusinessRules(
            PromotionRequestDTO dto,
            Long currentId
    ) {

        String normalizedCode =
                dto.getCode()
                        .trim()
                        .toUpperCase();

        promotionRepository
                .findByCodeIgnoreCase(
                        normalizedCode
                )
                .ifPresent(
                        existing -> {

                            if (currentId == null
                                    || !existing
                                    .getId()
                                    .equals(
                                            currentId
                                    )) {

                                throw new IllegalArgumentException(
                                        "Ma khuyen mai da ton tai"
                                );
                            }
                        }
                );

        // ================================
        // TIME
        // ================================
        if (dto.getStartAt() != null
                && dto.getEndAt() != null
                && !dto.getEndAt()
                .isAfter(
                        dto.getStartAt()
                )) {

            throw new IllegalArgumentException(
                    "Thoi gian ket thuc phai sau thoi gian bat dau"
            );
        }

        // ================================
        // PERCENT <= 100
        // ================================
        if ("PERCENT".equalsIgnoreCase(
                dto.getDiscountType()
        )
                && dto.getDiscountValue()
                != null
                && dto.getDiscountValue()
                .compareTo(
                        new BigDecimal(
                                "100"
                        )
                ) > 0) {

            throw new IllegalArgumentException(
                    "Phan tram giam gia khong duoc lon hon 100"
            );
        }
    }

    // ================================
    // DTO -> ENTITY
    // ================================
    private void mapDtoToEntity(
            PromotionRequestDTO dto,
            Promotion entity
    ) {

        entity.setCode(
                dto.getCode()
                        .trim()
                        .toUpperCase()
        );

        entity.setName(
                dto.getName()
                        .trim()
        );

        entity.setDescription(
                dto.getDescription()
        );

        entity.setDiscountType(
                dto.getDiscountType()
                        .trim()
                        .toUpperCase()
        );

        entity.setDiscountValue(
                dto.getDiscountValue()
        );

        entity.setMinOrderAmount(
                dto.getMinOrderAmount()
        );

        entity.setMaxDiscountAmount(
                dto.getMaxDiscountAmount()
        );

        entity.setStartAt(
                dto.getStartAt()
        );

        entity.setEndAt(
                dto.getEndAt()
        );

        if (dto.getStatus() != null
                && !dto.getStatus()
                .isBlank()) {

            entity.setStatus(
                    dto.getStatus()
                            .trim()
                            .toUpperCase()
            );
        }
    }

    // ================================
    // ENTITY -> DTO
    // ================================
    private PromotionResponseDTO mapEntityToResponseDTO(
            Promotion entity
    ) {

        return new PromotionResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getDescription(),
                entity.getDiscountType(),
                entity.getDiscountValue(),
                entity.getMinOrderAmount(),
                entity.getMaxDiscountAmount(),
                entity.getStartAt(),
                entity.getEndAt(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}