package com.smalltrend.validation;

import com.smalltrend.exception.CrmException;
import com.smalltrend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Validator cho Customer – tập trung toàn bộ logic kiểm tra nghiệp vụ.
 * Theo cùng pattern với ShiftValidator.
 */
@Component
@RequiredArgsConstructor
public class CustomerValidator {

    private final CustomerRepository customerRepository;

    /**
     * Regex SĐT hợp lệ: tuỳ chọn dấu '+' ở đầu, sau đó 9-11 chữ số.
     * Ví dụ hợp lệ: 0901234567, +84901234567, 0123456789
     */
    private static final String PHONE_REGEX = "^\\+?[0-9]{9,11}$";

    // ── Validate khi TẠO MỚI ────────────────────────────────────────────────

    /**
     * Kiểm tra đầy đủ khi thêm khách hàng mới.
     * Ném CrmException nếu phát hiện lỗi.
     *
     * @param name  Tên khách hàng
     * @param phone Số điện thoại (chưa normalize)
     */
    public void validateCreate(String name, String phone) {
        validateName(name);
        validatePhoneFormat(phone);
        validatePhoneNotDuplicate(phone, null);   // null = không cần bỏ qua ID nào
    }

    // ── Validate khi CẬP NHẬT ───────────────────────────────────────────────

    /**
     * Kiểm tra đầy đủ khi cập nhật khách hàng.
     * Cho phép giữ nguyên SĐT của chính record đang sửa.
     *
     * @param name        Tên mới
     * @param phone       SĐT mới
     * @param currentId   ID của khách hàng đang được sửa
     * @param loyaltyPoints Điểm loyalty (nullable)
     */
    public void validateUpdate(String name, String phone, Integer currentId, Integer loyaltyPoints) {
        validateName(name);
        validatePhoneFormat(phone);
        validatePhoneNotDuplicate(phone, currentId);
        validateLoyaltyPoints(loyaltyPoints);
    }

    // ── Rule methods ─────────────────────────────────────────────────────────

    /** Tên không được null / rỗng, không quá 100 ký tự */
    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new CrmException(CrmException.Code.INVALID_INPUT,
                    "Tên khách hàng không được để trống");
        }
        if (name.trim().length() > 100) {
            throw new CrmException(CrmException.Code.INVALID_INPUT,
                    "Tên khách hàng không được vượt quá 100 ký tự");
        }
    }

    /** SĐT không được rỗng và phải khớp regex */
    private void validatePhoneFormat(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new CrmException(CrmException.Code.INVALID_INPUT,
                    "Số điện thoại không được để trống");
        }
        String normalized = normalize(phone);
        if (!normalized.matches(PHONE_REGEX)) {
            throw new CrmException(CrmException.Code.INVALID_INPUT,
                    "Số điện thoại không hợp lệ (chỉ gồm 9-11 chữ số, có thể bắt đầu bằng +)");
        }
    }

    /**
     * Kiểm tra SĐT đã tồn tại trong DB chưa.
     *
     * @param phone     SĐT cần kiểm tra
     * @param excludeId ID của record được phép trùng (khi update). Truyền null khi tạo mới.
     */
    private void validatePhoneNotDuplicate(String phone, Integer excludeId) {
        String normalized = normalize(phone);
        customerRepository.findByPhoneIgnoreSpaces(normalized).ifPresent(existing -> {
            // Khi update: bỏ qua nếu SĐT thuộc chính record đang sửa
            if (excludeId == null || !existing.getId().equals(excludeId)) {
                throw CrmException.duplicatePhone(normalized);
            }
        });
    }

    /** Điểm loyalty không được âm */
    private void validateLoyaltyPoints(Integer loyaltyPoints) {
        if (loyaltyPoints != null && loyaltyPoints < 0) {
            throw new CrmException(CrmException.Code.INVALID_INPUT,
                    "Điểm loyalty không được âm");
        }
    }

    // ── Util ─────────────────────────────────────────────────────────────────

    /** Bỏ toàn bộ khoảng trắng trong SĐT */
    public static String normalize(String phone) {
        return phone != null ? phone.replaceAll("\\s+", "") : "";
    }
}
