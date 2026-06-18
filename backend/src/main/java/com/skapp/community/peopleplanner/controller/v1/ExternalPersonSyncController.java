package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.service.ExternalPersonSyncService;
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

    private static final String HEADER_RESOURCE_STATE = "X-Goog-Resource-State";
    private static final String HEADER_RESOURCE_URI = "X-Goog-Resource-Uri";
    private static final String HEADER_CHANNEL_TOKEN = "X-Goog-Channel-Token";
    private static final String SYNC_STARTED_MESSAGE = "Sync started";

    private final ExternalPersonSyncService externalPersonSyncService;

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
        return new ResponseEntity<>(new ResponseEntityDto(false, SYNC_STARTED_MESSAGE), HttpStatus.ACCEPTED);
    }

    @Operation(
            summary = "Google Workspace push notification webhook",
            description = "Receives push notifications from the Google Directory API when the " +
                    "Workspace directory changes. This endpoint is public and verified via " +
                    "X-Goog-Channel-Token."
    )
    @PostMapping(value = "/google-webhook")
    public ResponseEntity<Void> handleGoogleWebhook(
            @RequestHeader(value = HEADER_RESOURCE_STATE, required = false) String resourceState,
            @RequestHeader(value = HEADER_RESOURCE_URI, required = false) String resourceUri,
            @RequestHeader(value = HEADER_CHANNEL_TOKEN, required = false) String token) {

        if (!externalPersonSyncService.isValidChannelToken(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        externalPersonSyncService.processWatchNotification(resourceState, resourceUri);
        return ResponseEntity.ok().build();
    }
}