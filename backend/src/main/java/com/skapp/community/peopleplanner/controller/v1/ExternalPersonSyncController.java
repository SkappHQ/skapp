package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.service.ExternalPersonalSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/people/sync")
@Tag(name = "External Sync Controller", description = "Endpoints for syncing persons from external providers")
public class ExternalPersonSyncController {

    private final ExternalPersonalSyncService externalPersonSyncService;

    @Operation(
            summary = "Bulk sync persons from Google Workspace",
            description = "Triggers an async sync of all users from Google Workspace into skapp. " +
                    "Returns immediately. Caller receives an email when sync is complete."
    )
    @PostMapping(value = "/external-bulk-person-sync", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
    public ResponseEntity<ResponseEntityDto> bulkSync(
            @AuthenticationPrincipal UserDetails userDetails) {
        externalPersonSyncService.bulkSync(userDetails.getUsername());
        return new ResponseEntity<>(new ResponseEntityDto(false, "Sync started"), HttpStatus.ACCEPTED);
    }

    @Operation(
            summary = "Google Workspace push notification webhook",
            description = "Receives push notifications from the Google Directory API when a user " +
                    "is added, updated, or deleted in Google Workspace. This endpoint is public " +
                    "and verified via X-Goog-Channel-Token."
    )
    @PostMapping(value = "/google-webhook")
    public ResponseEntity<Void> handleGoogleWebhook(
            @RequestHeader(value = "X-Goog-Resource-State", required = false) String resourceState,
            @RequestHeader(value = "X-Goog-Resource-Uri", required = false) String resourceUri,
            @RequestHeader(value = "X-Goog-Channel-Token", required = false) String token) {

        if (!externalPersonSyncService.isValidChannelToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        externalPersonSyncService.processWatchNotification(resourceState, resourceUri);
        return ResponseEntity.ok().build();
    }
}