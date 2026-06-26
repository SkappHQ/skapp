package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.peopleplanner.service.impl.GoogleWorkspaceOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/integrations/google")
@RequiredArgsConstructor
public class GoogleWorkspaceOAuthController {

    private final GoogleWorkspaceOAuthService oAuthService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Step 1 — Frontend calls this to get the Google authorisation URL,
     * then redirects the admin browser to it.
     */
    @GetMapping("/initiate")
    public ResponseEntity<Map<String, String>> initiateOAuth() {
        String url = oAuthService.buildAuthorizationUrl();
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * Step 2 — Google redirects back here after admin approves.
     * We exchange the code for tokens, save them, then redirect
     * the admin back to the Skapp settings page.
     */
    @GetMapping("/callback")
    public ResponseEntity<Void> handleCallback(
            @RequestParam String code,
            @RequestParam String state) {
        oAuthService.handleCallback(code, state);
        return ResponseEntity
                .status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl + "/settings/integrations?google=connected"))
                .build();
    }

    /**
     * Frontend polls this to display connected / disconnected state
     * and show which admin authorised the connection.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(oAuthService.getStatus());
    }

    /**
     * Admin clicks Disconnect — revokes token with Google and
     * removes the connection from the database.
     */
    @DeleteMapping("/disconnect")
    public ResponseEntity<Void> disconnect() {
        oAuthService.disconnect();
        return ResponseEntity.noContent().build();
    }

}