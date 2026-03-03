package com.smalltrend.exception;

public class UserException extends RuntimeException {

    public enum Code {
        USERNAME_EXISTS,
        EMAIL_EXISTS,
        PHONE_EXISTS,
        USER_NOT_FOUND,
        ROLE_NOT_FOUND
    }

    private final Code code;

    public UserException(Code code, String message) {
        super(message);
        this.code = code;
    }

    public Code getCode() {
        return code;
    }

    public static UserException usernameExists() {
        return new UserException(Code.USERNAME_EXISTS, "Tên đăng nhập đã tồn tại");
    }

    public static UserException emailExists() {
        return new UserException(Code.EMAIL_EXISTS, "Email đã được đăng ký");
    }

    public static UserException emailUsedByOther() {
        return new UserException(Code.EMAIL_EXISTS, "Email đã được sử dụng bởi tài khoản khác");
    }

    public static UserException phoneExists() {
        return new UserException(Code.PHONE_EXISTS, "Số điện thoại đã được đăng ký");
    }

    public static UserException phoneUsedByOther() {
        return new UserException(Code.PHONE_EXISTS, "Số điện thoại đã được sử dụng bởi tài khoản khác");
    }

    public static UserException userNotFound(Integer id) {
        return new UserException(Code.USER_NOT_FOUND, "Không tìm thấy người dùng với ID: " + id);
    }

    public static UserException roleNotFound() {
        return new UserException(Code.ROLE_NOT_FOUND, "Không tìm thấy vai trò");
    }

    public static UserException defaultRoleNotFound() {
        return new UserException(Code.ROLE_NOT_FOUND, "Không tìm thấy vai trò mặc định");
    }
}
