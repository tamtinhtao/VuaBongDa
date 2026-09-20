package vn.edu.vuabongda.promotion.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.vuabongda.promotion.dto.PromotionRequestDTO;
import vn.edu.vuabongda.promotion.dto.PromotionResponseDTO;
import vn.edu.vuabongda.promotion.entity.Promotion;
import vn.edu.vuabongda.promotion.repository.PromotionRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionResponseDTO create(PromotionRequestDTO dto) {
        validateBusinessRules(dto, null);

        Promotion promotion = new Promotion();
        mapDtoToEntity(dto, promotion);

        Promotion saved = promotionRepository.save(promotion);
        return mapEntityToResponseDTO(saved);
    }

    public List<PromotionResponseDTO> getAll() {
        return promotionRepository.findAll().stream()
                .map(this::mapEntityToResponseDTO)
                .collect(Collectors.toList());
    }

    public PromotionResponseDTO getById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay Promotion voi ID: " + id));
        return mapEntityToResponseDTO(promotion);
    }

    public PromotionResponseDTO getByCode(String code) {
        Promotion promotion = promotionRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Khong tim thay Promotion voi Code: " + code));
        return mapEntityToResponseDTO(promotion);
    }

    public PromotionResponseDTO update(Long id, PromotionRequestDTO dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay Promotion voi ID: " + id));

        validateBusinessRules(dto, id);

        mapDtoToEntity(dto, promotion);
        Promotion updated = promotionRepository.save(promotion);
        return mapEntityToResponseDTO(updated);
    }

    public void delete(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Khong tim thay Promotion voi ID: " + id);
        }
        promotionRepository.deleteById(id);
    }

    private void validateBusinessRules(PromotionRequestDTO dto, Long currentId) {
        promotionRepository.findByCodeIgnoreCase(dto.getCode()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new IllegalArgumentException("Ma khuyen mai da ton tai!");
            }
        });

        if (dto.getEndAt() != null && dto.getStartAt() != null && !dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new IllegalArgumentException("Thoi gian ket thuc phai sau thoi gian bat dau!");
        }

        if ("PERCENT".equalsIgnoreCase(dto.getDiscountType())
                && dto.getDiscountValue() != null
                && dto.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Phan tram giam gia khong duoc lon hon 100!");
        }
    }

    private void mapDtoToEntity(PromotionRequestDTO dto, Promotion entity) {
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDiscountType(dto.getDiscountType());
        entity.setDiscountValue(dto.getDiscountValue());
        entity.setMinOrderAmount(dto.getMinOrderAmount());
        entity.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        entity.setStartAt(dto.getStartAt());
        entity.setEndAt(dto.getEndAt());
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
    }

    private PromotionResponseDTO mapEntityToResponseDTO(Promotion entity) {
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