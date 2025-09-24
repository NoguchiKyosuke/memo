package com.example.memo.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping(path = "/api/v1/sdv", produces = MediaType.APPLICATION_JSON_VALUE)
public class SdvController {

    @GetMapping
    public Map<String, Object> root() {
        return Map.of(
                "service", "sdv",
                "status", "OK",
                "timestamp", Instant.now().toString()
        );
    }
}
