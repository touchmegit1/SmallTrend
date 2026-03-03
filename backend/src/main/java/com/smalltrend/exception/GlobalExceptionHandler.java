package com.smalltrend.exception;

import com.smalltrend.dto.common.MessageResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler Xử lý exception toàn cục cho ứng dụng
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserException.class)
    public ResponseEntity<?> handleUserException(UserException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex.getCode() == UserException.Code.USER_NOT_FOUND) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex.getCode() == UserException.Code.USERNAME_EXISTS
                || ex.getCode() == UserException.Code.EMAIL_EXISTS
                || ex.getCode() == UserException.Code.PHONE_EXISTS) {
            status = HttpStatus.CONFLICT;
        }

        return ResponseEntity.status(status)
                .body(new MessageResponse(ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        if (msg != null && (msg.contains("foreign key constraint") || msg.contains("a foreign key constraint fails"))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse(
                            "Lỗi: Không thể xóa vì danh mục hoặc thương hiệu này đang có sản phẩm áp dụng!"));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponse("Lỗi: Dữ liệu bị trùng hoặc vi phạm ràng buộc hệ thống."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // Return first error message for simplicity
        if (!errors.isEmpty()) {
            String firstError = errors.values().iterator().next();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(firstError));
        }

        return ResponseEntity.badRequest()
                .body(new MessageResponse("Validation failed"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Access denied: " + ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Internal Server Error: " + e.getMessage()));
    }
}
