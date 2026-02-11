package com.smalltrend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smalltrend.entity.PayrollRecord;
import com.smalltrend.entity.enums.PayrollStatus;
import com.smalltrend.service.PayrollService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @GetMapping
    public ResponseEntity<List<PayrollRecord>> getAllPayrollRecords() {
        List<PayrollRecord> records = payrollService.getAllPayrollRecords();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollRecord> getPayrollRecord(@PathVariable Long id) {
        Optional<PayrollRecord> record = payrollService.getPayrollById(id);
        return record.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PayrollRecord>> getPayrollRecordsByUser(@PathVariable Long userId) {
        List<PayrollRecord> records = payrollService.getPayrollByUserId(userId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/period")
    public ResponseEntity<List<PayrollRecord>> getPayrollRecordsByPeriod(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<PayrollRecord> records = payrollService.getPayrollByPeriod(startDate, endDate);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PayrollRecord>> getPayrollRecordsByStatus(@PathVariable PayrollStatus status) {
        List<PayrollRecord> records = payrollService.getPayrollByStatus(status);
        return ResponseEntity.ok(records);
    }

    @PostMapping
    public ResponseEntity<PayrollRecord> createPayrollRecord(@Valid @RequestBody PayrollRecord payroll) {
        PayrollRecord savedRecord = payrollService.createPayroll(payroll);
        return ResponseEntity.ok(savedRecord);
    }

    @PostMapping("/generate")
    public ResponseEntity<PayrollRecord> generatePayroll(
            @RequestParam Long userId,
            @RequestParam LocalDate periodStart,
            @RequestParam LocalDate periodEnd,
            @RequestParam(required = false) BigDecimal regularHours,
            @RequestParam(required = false) BigDecimal overtimeHours) {

        PayrollRecord payroll = payrollService.generatePayrollForUser(
                userId, periodStart, periodEnd, regularHours, overtimeHours);
        return ResponseEntity.ok(payroll);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PayrollRecord> updatePayrollRecord(
            @PathVariable Integer id,
            @Valid @RequestBody PayrollRecord payroll) {
        payroll.setId(id);
        PayrollRecord updatedRecord = payrollService.updatePayroll(payroll);
        return ResponseEntity.ok(updatedRecord);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PayrollRecord> updatePayrollStatus(
            @PathVariable Long id,
            @RequestBody PayrollStatus status) {
        try {
            PayrollRecord updatedRecord = payrollService.updatePayrollStatus(id, status);
            return ResponseEntity.ok(updatedRecord);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/process-payment")
    public ResponseEntity<PayrollRecord> processPayment(
            @PathVariable Long id,
            @RequestBody String paymentMethod) {
        try {
            PayrollRecord processedRecord = payrollService.processPayment(id, paymentMethod);
            return ResponseEntity.ok(processedRecord);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayrollRecord(@PathVariable Long id) {
        payrollService.deletePayroll(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary/{userId}/{year}/{month}")
    public ResponseEntity<Map<String, Object>> getMonthlySummary(
            @PathVariable Long userId,
            @PathVariable int year,
            @PathVariable int month) {
        Map<String, Object> summary = payrollService.getMonthlySummary(userId, year, month);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/batch-generate")
    public ResponseEntity<List<PayrollRecord>> batchGeneratePayroll(
            @RequestParam LocalDate periodStart,
            @RequestParam LocalDate periodEnd) {
        List<PayrollRecord> records = payrollService.batchGeneratePayroll(periodStart, periodEnd);
        return ResponseEntity.ok(records);
    }
}
