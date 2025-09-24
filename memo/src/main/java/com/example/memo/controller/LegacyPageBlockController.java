package com.example.memo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Explicitly returns 410 (Gone) for legacy static pages that were removed.
 * This prevents old bookmarked URLs (e.g., /memo.html) from resolving to any
 * unintended resource if a static file is reintroduced later.
 */
@RestController
public class LegacyPageBlockController {

    @GetMapping(value = {"/memo.html"}, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> memoGone() {
        String body = "<!DOCTYPE html><html lang='ja'><head><meta charset='UTF-8'><title>410 Gone</title><style>body{font-family:Inter,system-ui,sans-serif;background:#111;color:#eee;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}main{max-width:640px;padding:2rem}h1{font-size:2.2rem;margin-top:0}p{line-height:1.5}code{background:#222;padding:2px 4px;border-radius:4px;font-size:0.9em}</style></head><body><main><h1>410 Gone</h1><p>このページ <code>/memo.html</code> は廃止されました。ブックマークを更新してください。</p><p><a href='/' style='color:#4dabf7'>ホームへ戻る</a></p></main></body></html>";
        return ResponseEntity.status(HttpStatus.GONE).body(body);
    }
}
