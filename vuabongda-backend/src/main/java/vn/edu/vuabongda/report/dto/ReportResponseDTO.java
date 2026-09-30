package vn.edu.vuabongda.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDTO {

    private LocalDate from;

    private LocalDate to;

    private String groupBy;

    private ReportSummaryDTO summary;

    private List<RevenueByTimeDTO> revenueByTime;

    private List<RevenueByCategoryDTO> revenueByCategory;

    private List<RevenueByPaymentMethodDTO> revenueByPaymentMethod;
}