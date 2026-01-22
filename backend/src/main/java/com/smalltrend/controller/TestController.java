package com.smalltrend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test Controller
 * Controller để test API hoạt động
 */
@RestController
@RequestMapping("/api/public")
public class TestController {

    @GetMapping("/health")
    public String health() {
        return "SmallTrend Backend is running!";
    }
}