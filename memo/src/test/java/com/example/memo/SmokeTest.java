package com.example.memo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SmokeTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    @Test
    void contextLoads() {
        assertThat(port).isPositive();
    }

    @Test
    void memoEndpoint_removed_returns404() {
        ResponseEntity<String> resp = rest.getForEntity("/api/v1/memo", String.class);
        assertThat(resp.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void memoHtml_removed_returns410() {
        ResponseEntity<String> resp = rest.getForEntity("/memo.html", String.class);
        assertThat(resp.getStatusCode().value()).isEqualTo(410);
    }

    @Test
    void sdvEndpoint_returnsOk() {
        ResponseEntity<String> resp = rest.getForEntity("/api/v1/sdv", String.class);
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).contains("sdv");
    }

    @Test
    void sdvPage_dynamic_servedWithAd() {
        ResponseEntity<String> page = rest.getForEntity("/sdv", String.class);
        assertThat(page.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(page.getBody()).contains("Software Defined Vehicle");
        assertThat(page.getBody()).contains("admax-ads");
        assertThat(page.getBody()).contains("945ac836d868082489bc5e309de2b366");
    }

    @Test
    void speechEndpoint_returnsOk() {
        ResponseEntity<String> resp = rest.getForEntity("/api/v1/speech", String.class);
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).contains("speech");
    }

    @Test
    void speechPage_dynamic_servedWithAd() {
        ResponseEntity<String> page = rest.getForEntity("/speech", String.class);
        assertThat(page.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(page.getBody()).contains("音声の研究メモ");
        assertThat(page.getBody()).contains("admax-ads");
        assertThat(page.getBody()).contains("945ac836d868082489bc5e309de2b366");
    }

    @Test
    void adsTxt_served() {
        ResponseEntity<String> resp = rest.getForEntity("/ads.txt", String.class);
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).startsWith("adm.shinobi.jp,227629,DIRECT");
    }

    @Test
    void healthEndpoint_returnsUp() {
        ResponseEntity<String> resp = rest.getForEntity("/api/v1/health", String.class);
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).contains("UP");
    }

    @Test
    void rootIndex_served() {
        ResponseEntity<String> resp = rest.getForEntity("/", String.class);
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        // Japanese localized content
        assertThat(resp.getBody()).contains("エンジニアリング知識ハブ");
        assertThat(resp.getBody()).contains("領域");
        // Basic ad markers (container and script id) to ensure ad snippet is present
        assertThat(resp.getBody()).contains("admax-ads");
        assertThat(resp.getBody()).contains("945ac836d868082489bc5e309de2b366");
        // Ensure memo page link or legacy reference is absent
        assertThat(resp.getBody()).doesNotContain("memo.html");
        assertThat(resp.getBody()).doesNotContain("Memo");
        // Ensure removed email not present
        assertThat(resp.getBody()).doesNotContain("k.noguchi2005@gmail.com");
    }
}
