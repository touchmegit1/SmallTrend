package com.smalltrend.exception;

public class LocationException extends RuntimeException {

    public enum Code {
        LOCATION_NOT_FOUND,
        LOCATION_CONFLICT,
        LOCATION_INVALID_REQUEST
    }

    private final Code code;

    public LocationException(Code code, String message) {
        super(message);
        this.code = code;
    }

    public Code getCode() {
        return code;
    }

    public static LocationException notFound(Integer id) {
        return new LocationException(Code.LOCATION_NOT_FOUND, "Location not found: " + id);
    }

    public static LocationException conflict(String message) {
        return new LocationException(Code.LOCATION_CONFLICT, message);
    }

    public static LocationException invalidRequest(String message) {
        return new LocationException(Code.LOCATION_INVALID_REQUEST, message);
    }
}
