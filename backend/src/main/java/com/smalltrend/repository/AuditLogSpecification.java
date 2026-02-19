package com.smalltrend.repository;

import com.smalltrend.dto.auditlog.AuditLogFilterRequest;
import com.smalltrend.entity.AuditLog;
import com.smalltrend.entity.User;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AuditLogSpecification {

    public static Specification<AuditLog> filterBy(AuditLogFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Join with User table to access user information
            Join<AuditLog, User> userJoin = root.join("user", JoinType.LEFT);

            // Date range filter
            if (filter.getFromDateTime() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("createdAt"), filter.getFromDateTime()
                ));
            }

            if (filter.getToDateTime() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("createdAt"), filter.getToDateTime()
                ));
            }

            // Result filter
            if (filter.getResult() != null && !filter.getResult().equalsIgnoreCase("ALL")) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.upper(root.get("result")),
                    filter.getResult().toUpperCase()
                ));
            }

            // User search (email, username, or userId)
            if (filter.getUserSearch() != null && !filter.getUserSearch().trim().isEmpty()) {
                String searchPattern = "%" + filter.getUserSearch().toLowerCase() + "%";

                Predicate emailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(userJoin.get("email")), searchPattern
                );
                Predicate namePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(userJoin.get("fullName")), searchPattern
                );

                // Try to parse as integer for userId search
                try {
                    Integer userId = Integer.parseInt(filter.getUserSearch());
                    Predicate idPredicate = criteriaBuilder.equal(userJoin.get("id"), userId);
                    predicates.add(criteriaBuilder.or(emailPredicate, namePredicate, idPredicate));
                } catch (NumberFormatException e) {
                    predicates.add(criteriaBuilder.or(emailPredicate, namePredicate));
                }
            }

            // Action filter
            if (filter.getAction() != null && !filter.getAction().equalsIgnoreCase("ALL")) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.upper(root.get("action")),
                    filter.getAction().toUpperCase()
                ));
            }

            // Target/Resource filter
            if (filter.getTarget() != null && !filter.getTarget().trim().isEmpty()) {
                String targetPattern = "%" + filter.getTarget().toLowerCase() + "%";

                Predicate entityNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("entityName")), targetPattern
                );

                // Also search in entityId if the target looks like it might contain an ID
                predicates.add(entityNamePredicate);
            }

            // IP Address filter
            if (filter.getIpAddress() != null && !filter.getIpAddress().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    root.get("ipAddress"),
                    "%" + filter.getIpAddress() + "%"
                ));
            }

            // Trace ID filter
            if (filter.getTraceId() != null && !filter.getTraceId().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    root.get("traceId"),
                    "%" + filter.getTraceId() + "%"
                ));
            }

            // Source filter
            if (filter.getSource() != null && !filter.getSource().trim().isEmpty()
                    && !filter.getSource().equalsIgnoreCase("ALL")) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.upper(root.get("source")),
                    filter.getSource().toUpperCase()
                ));
            }

            // Avoid duplicate results from joins
            query.distinct(true);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
