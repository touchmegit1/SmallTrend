package com.smalltrend.service;

import com.smalltrend.entity.PayrollRecord;
import com.smalltrend.entity.SalaryConfig;
import com.smalltrend.entity.User;
import com.smalltrend.entity.enums.PayrollStatus;
import com.smalltrend.repository.PayrollRecordRepository;
import com.smalltrend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollService {

    @Autowired
    private PayrollRecordRepository payrollRepository;

    @Autowired
    private UserRepository userRepository;

    public List<PayrollRecord> findAll() {
        return payrollRepository.findAll();
    }

    public Optional<PayrollRecord> findById(Long id) {
        return payrollRepository.findById(id);
    }

    public List<PayrollRecord> findByUserId(Integer userId) {
        return payrollRepository.findByUserId(userId);
    }

    public List<PayrollRecord> findByStatus(PayrollStatus status) {
        return payrollRepository.findByStatus(status);
    }

    public PayrollRecord save(PayrollRecord payrollRecord) {
        return payrollRepository.save(payrollRecord);
    }

    public PayrollRecord calculatePayroll(Integer userId, LocalDate periodStart, LocalDate periodEnd,
            BigDecimal regularHours, BigDecimal overtimeHours) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        User user = userOpt.get();
        SalaryConfig salaryConfig = user.getSalaryConfig();

        if (salaryConfig == null) {
            throw new RuntimeException("Salary configuration not found for user: " + userId);
        }

        // Check if payroll already exists for this period
        Optional<PayrollRecord> existingPayroll = payrollRepository
                .findByUserAndPayPeriod(userId, periodStart, periodEnd);

        if (existingPayroll.isPresent() && existingPayroll.get().getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Payroll already exists for this period and cannot be recalculated");
        }

        PayrollRecord payroll = existingPayroll.orElse(PayrollRecord.builder().build());

        // Set basic info
        payroll.setUser(user);
        payroll.setPayPeriodStart(periodStart);
        payroll.setPayPeriodEnd(periodEnd);
        payroll.setBaseSalary(salaryConfig.getBaseSalary());
        payroll.setRegularHours(regularHours);
        payroll.setOvertimeHours(overtimeHours);

        // Calculate rates
        BigDecimal hourlyRate = salaryConfig.getHourlyRate();
        if (hourlyRate == null) {
            // Calculate hourly rate from base salary (assuming 160 hours per month)
            hourlyRate = salaryConfig.getBaseSalary().divide(BigDecimal.valueOf(160), 2, RoundingMode.HALF_UP);
        }
        payroll.setHourlyRate(hourlyRate);

        BigDecimal overtimeRate = hourlyRate.multiply(salaryConfig.getOvertimeRateMultiplier());
        payroll.setOvertimeRate(overtimeRate);

        // Calculate pay components
        BigDecimal regularPay = hourlyRate.multiply(regularHours);
        BigDecimal overtimePay = overtimeRate.multiply(overtimeHours);
        BigDecimal allowances = salaryConfig.getAllowances();

        payroll.setRegularPay(regularPay);
        payroll.setOvertimePay(overtimePay);
        payroll.setAllowances(allowances);

        // Calculate gross pay
        BigDecimal grossPay = regularPay.add(overtimePay).add(allowances);
        payroll.setGrossPay(grossPay);

        // Calculate deductions (simplified)
        BigDecimal taxRate = BigDecimal.valueOf(0.10); // 10% tax
        BigDecimal socialInsuranceRate = BigDecimal.valueOf(0.08); // 8% social insurance

        BigDecimal taxAmount = grossPay.multiply(taxRate);
        BigDecimal socialInsurance = grossPay.multiply(socialInsuranceRate);
        BigDecimal totalDeductions = taxAmount.add(socialInsurance);

        payroll.setTaxAmount(taxAmount);
        payroll.setSocialInsurance(socialInsurance);
        payroll.setDeductions(totalDeductions);

        // Calculate net pay
        BigDecimal netPay = grossPay.subtract(totalDeductions);
        payroll.setNetPay(netPay);

        payroll.setStatus(PayrollStatus.CALCULATED);

        return payrollRepository.save(payroll);
    }

    public PayrollRecord approvePayroll(Long payrollId) {
        Optional<PayrollRecord> payrollOpt = payrollRepository.findById(payrollId);
        if (!payrollOpt.isPresent()) {
            throw new RuntimeException("Payroll not found with id: " + payrollId);
        }

        PayrollRecord payroll = payrollOpt.get();

        if (payroll.getStatus() != PayrollStatus.CALCULATED) {
            throw new RuntimeException("Payroll must be in CALCULATED status to approve");
        }

        payroll.setStatus(PayrollStatus.APPROVED);
        return payrollRepository.save(payroll);
    }

    public PayrollRecord payPayroll(Long payrollId, String paymentMethod) {
        Optional<PayrollRecord> payrollOpt = payrollRepository.findById(payrollId);
        if (!payrollOpt.isPresent()) {
            throw new RuntimeException("Payroll not found with id: " + payrollId);
        }

        PayrollRecord payroll = payrollOpt.get();

        if (payroll.getStatus() != PayrollStatus.APPROVED) {
            throw new RuntimeException("Payroll must be approved before payment");
        }

        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaymentDate(LocalDate.now());
        payroll.setPaymentMethod(paymentMethod);

        return payrollRepository.save(payroll);
    }

    public void delete(Long id) {
        Optional<PayrollRecord> payroll = payrollRepository.findById(id);
        if (payroll.isPresent() && payroll.get().getStatus() == PayrollStatus.PAID) {
            throw new RuntimeException("Cannot delete paid payroll records");
        }
        payrollRepository.deleteById(id);
    }

    // Wrapper methods for controller compatibility
    public List<PayrollRecord> getAllPayrollRecords() {
        return findAll();
    }

    public Optional<PayrollRecord> getPayrollById(Long id) {
        return findById(id);
    }

    public List<PayrollRecord> getPayrollByUserId(Long userId) {
        return findByUserId(userId.intValue());
    }

    public List<PayrollRecord> getPayrollByPeriod(LocalDate startDate, LocalDate endDate) {
        return payrollRepository.findByPayPeriodBetween(startDate, endDate);
    }

    public List<PayrollRecord> getPayrollByStatus(PayrollStatus status) {
        return findByStatus(status);
    }

    public PayrollRecord createPayroll(PayrollRecord payroll) {
        return save(payroll);
    }

    public PayrollRecord generatePayrollForUser(Long userId, LocalDate periodStart, LocalDate periodEnd,
            BigDecimal regularHours, BigDecimal overtimeHours) {
        if (regularHours == null) {
            regularHours = BigDecimal.valueOf(160); // Default full-time hours

                }if (overtimeHours == null) {
            overtimeHours = BigDecimal.ZERO;
        }

        return calculatePayroll(userId.intValue(), periodStart, periodEnd, regularHours, overtimeHours);
    }

    public PayrollRecord updatePayroll(PayrollRecord payroll) {
        return save(payroll);
    }

    public PayrollRecord updatePayrollStatus(Long id, PayrollStatus status) {
        Optional<PayrollRecord> payrollOpt = findById(id);
        if (!payrollOpt.isPresent()) {
            throw new RuntimeException("Payroll not found with id: " + id);
        }

        PayrollRecord payroll = payrollOpt.get();
        payroll.setStatus(status);
        return save(payroll);
    }

    public PayrollRecord processPayment(Long id, String paymentMethod) {
        return payPayroll(id, paymentMethod);
    }

    public void deletePayroll(Long id) {
        delete(id);
    }

    public Map<String, Object> getMonthlySummary(Long userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<PayrollRecord> records = payrollRepository.findByUserIdAndDateRange(userId.intValue(), startDate, endDate);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRecords", records.size());
        summary.put("totalGrossPay", records.stream()
                .map(PayrollRecord::getGrossPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalNetPay", records.stream()
                .map(PayrollRecord::getNetPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalTax", records.stream()
                .map(PayrollRecord::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("records", records);

        return summary;
    }

    public List<PayrollRecord> batchGeneratePayroll(LocalDate periodStart, LocalDate periodEnd) {
        List<User> activeUsers = userRepository.findByStatus("ACTIVE");

        return activeUsers.stream()
                .filter(user -> user.getSalaryConfig() != null)
                .map(user -> {
                    try {
                        return generatePayrollForUser(user.getId().longValue(), periodStart, periodEnd,
                                BigDecimal.valueOf(160), BigDecimal.ZERO);
                    } catch (Exception e) {
                        // Skip users with errors
                        return null;
                    }
                })
                .filter(record -> record != null)
                .collect(Collectors.toList());
    }
}
