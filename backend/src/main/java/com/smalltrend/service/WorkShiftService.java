package com.smalltrend.service;

import com.smalltrend.dto.shift.WorkShiftRequest;
import com.smalltrend.dto.shift.WorkShiftResponse;
import com.smalltrend.entity.Role;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.repository.RoleRepository;
import com.smalltrend.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkShiftService {

    private final WorkShiftRepository workShiftRepository;
    private final RoleRepository roleRepository;

    public WorkShiftResponse createShift(WorkShiftRequest request) {
        String shiftCode = request.getShiftCode().trim();
        if (workShiftRepository.existsByShiftCodeIgnoreCase(shiftCode)) {
            throw new RuntimeException("Shift code already exists");
        }

        WorkShift shift = buildShiftEntity(new WorkShift(), request);
        shift.setShiftCode(shiftCode);
        WorkShift saved = workShiftRepository.save(shift);
        return WorkShiftResponse.fromEntity(saved);
    }

    public WorkShiftResponse updateShift(Integer id, WorkShiftRequest request) {
        WorkShift shift = workShiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));

        String shiftCode = request.getShiftCode().trim();
        if (workShiftRepository.existsByShiftCodeIgnoreCaseAndIdNot(shiftCode, id)) {
            throw new RuntimeException("Shift code already exists");
        }

        WorkShift updated = buildShiftEntity(shift, request);
        updated.setShiftCode(shiftCode);
        WorkShift saved = workShiftRepository.save(updated);
        return WorkShiftResponse.fromEntity(saved);
    }

    public WorkShiftResponse getShift(Integer id) {
        WorkShift shift = workShiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        return WorkShiftResponse.fromEntity(shift);
    }

    public List<WorkShiftResponse> listShifts(String query, String status) {
        List<WorkShift> shifts;
        if (query != null && !query.trim().isEmpty()) {
            String q = query.trim();
            shifts = workShiftRepository
                    .findByShiftNameContainingIgnoreCaseOrShiftCodeContainingIgnoreCase(q, q);
        } else if (status != null && !status.trim().isEmpty()) {
            shifts = workShiftRepository.findByStatusIgnoreCase(status.trim());
        } else {
            shifts = workShiftRepository.findAll(Sort.by("shiftName").ascending());
        }

        return shifts.stream()
                .map(WorkShiftResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void deleteShift(Integer id) {
        if (!workShiftRepository.existsById(id)) {
            throw new RuntimeException("Shift not found");
        }
        workShiftRepository.deleteById(id);
    }

    private WorkShift buildShiftEntity(WorkShift shift, WorkShiftRequest request) {
        Role supervisorRole = null;
        if (request.getSupervisorRoleId() != null) {
            supervisorRole = roleRepository.findById(request.getSupervisorRoleId())
                    .orElseThrow(() -> new RuntimeException("Supervisor role not found"));
        }

        shift.setShiftName(request.getShiftName().trim());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setBreakStartTime(request.getBreakStartTime());
        shift.setBreakEndTime(request.getBreakEndTime());
        shift.setShiftType(normalize(request.getShiftType(), "REGULAR"));
        shift.setOvertimeMultiplier(defaultDecimal(request.getOvertimeMultiplier(), "1.00"));
        shift.setNightShiftBonus(defaultDecimal(request.getNightShiftBonus(), "0.00"));
        shift.setWeekendBonus(defaultDecimal(request.getWeekendBonus(), "0.00"));
        shift.setHolidayBonus(defaultDecimal(request.getHolidayBonus(), "0.00"));
        shift.setMinimumStaffRequired(request.getMinimumStaffRequired());
        shift.setMaximumStaffAllowed(request.getMaximumStaffAllowed());
        shift.setAllowEarlyClockIn(Boolean.TRUE.equals(request.getAllowEarlyClockIn()));
        shift.setAllowLateClockOut(Boolean.TRUE.equals(request.getAllowLateClockOut()));
        shift.setEarlyClockInMinutes(request.getEarlyClockInMinutes());
        shift.setLateClockOutMinutes(request.getLateClockOutMinutes());
        shift.setGracePeroidMinutes(request.getGracePeriodMinutes());
        shift.setStatus(normalize(request.getStatus(), "ACTIVE"));
        shift.setRequiresApproval(Boolean.TRUE.equals(request.getRequiresApproval()));
        shift.setSupervisorRole(supervisorRole);
        shift.setDescription(request.getDescription());

        return shift;
    }

    private String normalize(String value, String defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        return value.trim().toUpperCase();
    }

    private BigDecimal defaultDecimal(BigDecimal value, String fallback) {
        return Optional.ofNullable(value).orElse(new BigDecimal(fallback));
    }
}
