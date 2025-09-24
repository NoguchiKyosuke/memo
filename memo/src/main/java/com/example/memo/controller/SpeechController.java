package com.example.memo.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping(path = "/api/v1/speech", produces = MediaType.APPLICATION_JSON_VALUE)
public class SpeechController {

    @GetMapping
    public Map<String, Object> root() {
        return Map.of(
                "service", "speech",
                "status", "OK",
                "timestamp", Instant.now().toString()
        );
    }
}
