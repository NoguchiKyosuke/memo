package com.example.memo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.time.Instant;
import java.util.List;

@Controller
public class SiteController {

    @ModelAttribute
    void global(Model model) {
        model.addAttribute("generatedAt", Instant.now());
        model.addAttribute("services", List.of("sdv", "speech"));
    }

    @GetMapping("/")
    public String index(Model model) {
        return "index"; // templates/index.html (Thymeleaf)
    }

    @GetMapping({"/sdv", "/sdv/"})
    public String sdvPage() { return "sdv"; }

    @GetMapping({"/speech", "/speech/"})
    public String speechPage() { return "speech"; }
    
}
