package com.smalltrend.entity.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Custom JPA converter for TicketType enum.
 * Handles empty strings and unknown values gracefully by returning null
 * instead of throwing IllegalArgumentException.
 */
@Converter(autoApply = false)
public class TicketTypeConverter implements AttributeConverter<TicketType, String> {

    @Override
    public String convertToDatabaseColumn(TicketType attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public TicketType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return TicketType.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
