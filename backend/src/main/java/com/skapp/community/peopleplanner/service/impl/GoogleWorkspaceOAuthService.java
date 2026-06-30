package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.GoogleWorkspaceConnection;
import com.skapp.community.peopleplanner.repository.GoogleWorkspaceConnectionDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.skapp.community.peopleplanner.event.GoogleWorkspaceConnectedEvent;
import org.springframework.context.ApplicationEventPublisher;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleWorkspaceOAuthService {

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    private static final String AUTH_URL   = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL  = "https://oauth2.googleapis.com/token";
    private static final String REVOKE_URL = "https://oauth2.googleapis.com/revoke";

    private static final List<String> SCOPES = List.of(
            "https://www.googleapis.com/auth/admin.directory.user.readonly",
            "https://www.googleapis.com/auth/admin.directory.group.readonly",
            "https://www.googleapis.com/auth/admin.directory.group.member.readonly"
    );

    // CSRF state store — fine for single-instance; swap for Redis on multi-instance
    private final Map<String, Instant> pendingStates = new ConcurrentHashMap<>();

    private final GoogleWorkspaceConnectionDao connectionDao;
    private final UserService userService;
    private final RestTemplate restTemplate;
    private final ApplicationEventPublisher eventPublisher;

    // ── Role guard ───────────────────────────────────────────────────────────

    void assertAuthorised() {
        Set<String> roles = userService.getCurrentUserRoles();
        boolean allowed = roles.contains(AuthConstants.AUTH_ROLE + Role.SUPER_ADMIN)
                || roles.contains(AuthConstants.AUTH_ROLE + Role.PEOPLE_ADMIN);
        if (!allowed) {
            throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
        }
    }

    // ── Initiate ─────────────────────────────────────────────────────────────

    public String buildAuthorizationUrl() {
        assertAuthorised();

        String state = UUID.randomUUID().toString();
        pendingStates.put(state, Instant.now().plusSeconds(600)); // 10-min TTL

        String scopeParam = String.join(" ", SCOPES);

        return AUTH_URL
                + "?client_id=" + clientId
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope=" + URLEncoder.encode(scopeParam, StandardCharsets.UTF_8)
                + "&access_type=offline"   // gets us a refresh token
                + "&prompt=consent"        // always show consent — required to receive refresh token
                + "&state=" + state;
    }

    // ── Callback ─────────────────────────────────────────────────────────────

    public void handleCallback(String code, String state) {
        // 1. Validate CSRF state
        Instant expiry = pendingStates.put(state, Instant.now().plus(10, ChronoUnit.MINUTES)); // was probably shorter
        if (expiry == null || Instant.now().isAfter(expiry)) {
            throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
        }

        // 2. Exchange code → tokens
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id",     clientId);
        params.add("client_secret", clientSecret);
        params.add("code",          code);
        params.add("redirect_uri",  redirectUri);
        params.add("grant_type",    "authorization_code");

        ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_URL, params, Map.class);
        Map<String, Object> body = response.getBody();

        if (body == null || !body.containsKey("refresh_token")) {
            throw new IllegalStateException(
                    "No refresh_token in Google response. Ensure prompt=consent and access_type=offline.");
        }

        String accessToken  = (String) body.get("access_token");
        String refreshToken = (String) body.get("refresh_token");
        int    expiresIn    = (Integer) body.get("expires_in");

        // 3. Fetch the admin's email from Google
        String adminEmail = fetchAdminEmail(accessToken);

        // 4. Deactivate any existing connection, then save the new one
        connectionDao.findFirstByActiveTrue().ifPresent(existing -> {
            existing.setActive(false);
            connectionDao.save(existing);
        });

        GoogleWorkspaceConnection conn = new GoogleWorkspaceConnection();
        conn.setAccessToken(accessToken);   // TODO: encrypt before storing
        conn.setRefreshToken(refreshToken); // TODO: encrypt before storing
        conn.setTokenExpiry(Instant.now().plusSeconds(expiresIn));
        conn.setConnectedByEmail(adminEmail);
        conn.setConnectedAt(Instant.now());
        conn.setActive(true);
        connectionDao.save(conn);

        log.info("Google Workspace connected by {}", adminEmail);
        eventPublisher.publishEvent(new GoogleWorkspaceConnectedEvent(this, adminEmail));
    }

    // ── Token retrieval (called by your sync service) ────────────────────────

    public String getValidAccessToken() {
        GoogleWorkspaceConnection conn = connectionDao.findFirstByActiveTrue()
                .orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS));

        // Return existing token if still valid (60s buffer)
        if (conn.getTokenExpiry() != null
                && Instant.now().isBefore(conn.getTokenExpiry().minusSeconds(60))) {
            return conn.getAccessToken(); // TODO: decrypt
        }

        // Use refresh token to get a new access token
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id",     clientId);
        params.add("client_secret", clientSecret);
        params.add("refresh_token", conn.getRefreshToken()); // TODO: decrypt
        params.add("grant_type",    "refresh_token");

        ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_URL, params, Map.class);
        Map<String, Object> body = response.getBody();

        if (body == null || !body.containsKey("access_token")) {
            throw new IllegalStateException("Failed to refresh Google access token.");
        }

        String newAccessToken = (String) body.get("access_token");
        int    expiresIn      = (Integer) body.get("expires_in");

        conn.setAccessToken(newAccessToken); // TODO: encrypt
        conn.setTokenExpiry(Instant.now().plusSeconds(expiresIn));
        connectionDao.save(conn);

        return newAccessToken;
    }

    // ── Status ───────────────────────────────────────────────────────────────

    public Map<String, Object> getStatus() {
        assertAuthorised();
        return connectionDao.findFirstByActiveTrue()
                .<Map<String, Object>>map(c -> Map.of(
                        "connected",        true,
                        "connectedByEmail", c.getConnectedByEmail(),
                        "connectedAt",      c.getConnectedAt().toString()
                ))
                .orElse(Map.of("connected", false));
    }

    // ── Disconnect ───────────────────────────────────────────────────────────

    public void disconnect() {
        assertAuthorised();
        connectionDao.findFirstByActiveTrue().ifPresent(conn -> {
            try {
                restTemplate.postForEntity(
                        REVOKE_URL + "?token=" + conn.getRefreshToken(), // TODO: decrypt
                        null, Void.class);
            }
            catch (Exception e) {
                log.warn("Token revocation failed (may already be revoked): {}", e.getMessage());
            }
            connectionDao.delete(conn);
            log.info("Google Workspace disconnected.");
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String fetchAdminEmail(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            ResponseEntity<Map> resp = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class);
            return (String) resp.getBody().get("email");
        }
        catch (Exception e) {
            log.warn("Could not fetch admin email from Google: {}", e.getMessage());
            return "unknown";
        }
    }

}