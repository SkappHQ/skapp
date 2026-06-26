package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.GoogleWorkspaceSyncStaging;
import com.skapp.community.peopleplanner.service.StagingReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/people/sync/staging")
@Tag(name = "Staging Review Controller", description = "Endpoints for reviewing and approving staged Google Workspace sync changes")
public class StagingReviewController {

    private final StagingReviewService stagingReviewService;

    @Operation(
            summary = "Get all pending staged records",
            description = "Returns all Google Workspace sync changes that are awaiting super admin review."
    )
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
    public ResponseEntity<ResponseEntityDto> getPendingRecords() {
        List<GoogleWorkspaceSyncStaging> records = stagingReviewService.getPendingRecords();
        return new ResponseEntity<>(new ResponseEntityDto(false, records), HttpStatus.OK);
    }

    @Operation(
            summary = "Approve staged records",
            description = "Applies the selected staged changes to the main Employee/User tables."
    )
    @PostMapping(value = "/approve", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
    public ResponseEntity<ResponseEntityDto> approve(@RequestBody Map<String, List<Long>> body) {
        List<Long> ids = body.get("ids");
        stagingReviewService.approve(ids);
        return new ResponseEntity<>(new ResponseEntityDto(false, "Changes approved successfully"), HttpStatus.OK);
    }

    @Operation(
            summary = "Reject staged records",
            description = "Discards the selected staged changes. Nothing is written to the main tables."
    )
    @PostMapping(value = "/reject", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
    public ResponseEntity<ResponseEntityDto> reject(@RequestBody Map<String, List<Long>> body) {
        List<Long> ids = body.get("ids");
        stagingReviewService.reject(ids);
        return new ResponseEntity<>(new ResponseEntityDto(false, "Changes rejected successfully"), HttpStatus.OK);
    }
}
