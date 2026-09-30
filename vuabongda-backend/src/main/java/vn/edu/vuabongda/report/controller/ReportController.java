package vn.edu.vuabongda.report.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import vn.edu.vuabongda.report.dto.ReportResponseDTO;
import vn.edu.vuabongda.report.service.ReportService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // ========================================
    // REPORT
    // ========================================
    @GetMapping
    public ReportResponseDTO getReport(

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso =
                            DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso =
                            DateTimeFormat.ISO.DATE
            )
            LocalDate to,

            @RequestParam(
                    defaultValue = "DAY"
            )
            String groupBy
    ) {

        return reportService
                .getReport(
                        from,
                        to,
                        groupBy
                );
    }
}