package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Yêu cầu đổi ca / Shift Swap Request
 */
@Entity
@Table(name = "shift_swap_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftSwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String requestCode; // SWAP-REQ-001

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester; // Người đề nghị đổi ca

    @ManyToOne
    @JoinColumn(name = "original_shift_id", nullable = false)
    private WorkShift originalShift; // Ca gốc muốn đổi

    @Column(nullable = false)
    private LocalDate originalShiftDate; // Ngày ca gốc

    @ManyToOne
    @JoinColumn(name = "target_user_id")
    private User targetUser; // Người muốn đổi với (có thể null nếu public)

    @ManyToOne
    @JoinColumn(name = "target_shift_id")
    private WorkShift targetShift; // Ca muốn nhận (có thể null)

    @Column
    private LocalDate targetShiftDate;

    @Column(nullable = false, length = 20)
    private String swapType; // DIRECT_SWAP, OFFER_TO_ALL, FIND_REPLACEMENT, GIVE_AWAY

    @Column(length = 500)
    private String reason; // Lý do đổi ca

    @Column(length = 20)
    private String status; // PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED

    @ManyToOne
    @JoinColumn(name = "accepted_by")
    private User acceptedBy; // Người chấp nhận đổi ca

    @Column
    private LocalDateTime acceptedAt;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy; // Manager phê duyệt

    @Column
    private LocalDateTime approvedAt;

    @Column(length = 500)
    private String rejectionReason;

    @Column
    private LocalDateTime expiryTime; // Hết hạn yêu cầu

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
        // Mặc định hết hạn sau 48 giờ
        if (expiryTime == null) {
            expiryTime = LocalDateTime.now().plusHours(48);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
