package vn.edu.vuabongda.promotion.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.promotion.dto.PromotionApplyRequestDTO;
import vn.edu.vuabongda.promotion.dto.PromotionApplyResponseDTO;
import vn.edu.vuabongda.promotion.dto.PromotionRequestDTO;
import vn.edu.vuabongda.promotion.dto.PromotionResponseDTO;
import vn.edu.vuabongda.promotion.service.PromotionService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    // ================================
    // ADMIN - CREATE
    // ================================
    @PostMapping("/api/admin/promotions")
    public ResponseEntity<PromotionResponseDTO> create(
            @Valid
            @RequestBody PromotionRequestDTO dto
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        promotionService.create(dto)
                );
    }

    // ================================
    // ADMIN - GET ALL
    // ================================
    @GetMapping("/api/admin/promotions")
    public ResponseEntity<List<PromotionResponseDTO>> getAll() {

        return ResponseEntity.ok(
                promotionService.getAll()
        );
    }

    // ================================
    // ADMIN - GET BY ID
    // ================================
    @GetMapping("/api/admin/promotions/{id}")
    public ResponseEntity<PromotionResponseDTO> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                promotionService.getById(id)
        );
    }

    // ================================
    // ADMIN - UPDATE
    // ================================
    @PutMapping("/api/admin/promotions/{id}")
    public ResponseEntity<PromotionResponseDTO> update(
            @PathVariable Long id,
            @Valid
            @RequestBody PromotionRequestDTO dto
    ) {

        return ResponseEntity.ok(
                promotionService.update(
                        id,
                        dto
                )
        );
    }

    // ================================
    // ADMIN - DELETE
    // ================================
    @DeleteMapping("/api/admin/promotions/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        promotionService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // ================================
    // CUSTOMER - GET BY CODE
    // ================================
    @GetMapping("/api/promotions/code/{code}")
    public ResponseEntity<PromotionResponseDTO> getByCode(
            @PathVariable String code
    ) {

        return ResponseEntity.ok(
                promotionService.getByCode(code)
        );
    }

    // ================================
    // CUSTOMER - APPLY PROMOTION
    // ================================
    @PostMapping("/api/promotions/apply")
    public ResponseEntity<PromotionApplyResponseDTO> applyPromotion(
            @Valid
            @RequestBody PromotionApplyRequestDTO dto
    ) {

        return ResponseEntity.ok(
                promotionService.applyPromotion(
                        dto.getCode(),
                        dto.getOriginalAmount()
                )
        );
    }
}