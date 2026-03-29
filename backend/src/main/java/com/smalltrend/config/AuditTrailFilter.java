package com.smalltrend.config;

import com.smalltrend.service.AuditLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditTrailFilter extends OncePerRequestFilter {

    private final AuditLogService auditLogService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startedAt = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            if (!shouldAudit(request)) {
                return;
            }

            try {
                String username = resolveUsername();
                String path = request.getRequestURI();
                String method = request.getMethod();
                int status = response.getStatus();
                String result = resolveResult(status);
                String details = String.format("%s %s -> %d (%d ms)", method, path, status,
                        System.currentTimeMillis() - startedAt);

                auditLogService.recordEvent(
                        username,
                        method + " " + path,
                        resolveEntityName(path),
                        resolveEntityId(path),
                        result,
                        resolveIpAddress(request),
                        resolveTraceId(request),
                        resolveSource(request),
                        details,
                        null);
            } catch (Exception e) {
                log.debug("Failed to write API audit log: {}", e.getMessage());
            }
        }
    }

    private boolean shouldAudit(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null || !path.startsWith("/api/")) {
            return false;
        }

        if (path.startsWith("/api/audit-logs")) {
            return false;
        }

        return !path.equals("/api/auth/validate")
                && !path.equals("/api/auth/login")
                && !path.equals("/api/auth/logout")
                && !path.equals("/api/auth/refresh");
    }

    private String resolveUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "anonymous";
        }
        return authentication.getName();
    }

    private String resolveResult(int status) {
        if (status >= 200 && status < 300) {
            return "OK";
        }
        if (status == 401 || status == 403) {
            return "DENIED";
        }
        return "FAIL";
    }

    private String resolveEntityName(String path) {
        String cleanPath = path.startsWith("/api/") ? path.substring(5) : path;
        String[] parts = cleanPath.split("/");
        if (parts.length == 0 || parts[0].isBlank()) {
            return "API";
        }

        if (parts.length > 1 && !parts[1].isBlank() && !isNumeric(parts[1])) {
            return (parts[0] + "_" + parts[1]).toUpperCase();
        }

        return parts[0].toUpperCase();
    }

    private Integer resolveEntityId(String path) {
        String[] parts = path.split("/");
        for (int i = parts.length - 1; i >= 0; i--) {
            if (isNumeric(parts[i])) {
                try {
                    return Integer.parseInt(parts[i]);
                } catch (NumberFormatException ex) {
                    return null;
                }
            }
        }
        return null;
    }

    private boolean isNumeric(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        for (int i = 0; i < value.length(); i++) {
            if (!Character.isDigit(value.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private String resolveIpAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String resolveTraceId(HttpServletRequest request) {
        String traceId = request.getHeader("X-Trace-Id");
        if (traceId != null && !traceId.isBlank()) {
            return traceId;
        }

        String requestId = request.getHeader("X-Request-Id");
        if (requestId != null && !requestId.isBlank()) {
            return requestId;
        }

        return null;
    }

    private String resolveSource(HttpServletRequest request) {
        String source = request.getHeader("X-Client-Source");
        if (source != null && !source.isBlank()) {
            return source;
        }
        return "WEB";
    }
}
