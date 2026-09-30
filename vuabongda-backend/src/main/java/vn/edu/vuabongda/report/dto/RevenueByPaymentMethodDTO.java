package vn.edu.vuabongda.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueByPaymentMethodDTO {

    private String paymentMethod;

    private Long totalOrders;

    private Long totalCustomers;

    private BigDecimal totalRevenue;
}