package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.LeaveApprovalConfigDto;
import com.skapp.community.leaveplanner.service.LeaveApprovalConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/approval-config")
@Tag(name = "Leave Approval Config Controller", description = "Operations related to the leave approval settings")
public class LeaveApprovalConfigController {

	private final LeaveApprovalConfigService leaveApprovalConfigService;

	@Operation(summary = "Get leave approval configuration",
			description = "Returns whether multi-level leave approval is enabled for the organization")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getLeaveApprovalConfig() {
		ResponseEntityDto response = leaveApprovalConfigService.getLeaveApprovalConfig();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update leave approval configuration",
			description = "Turns multi-level leave approval on or off for the organization. Applies to requests submitted afterwards")
	@PatchMapping
	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateLeaveApprovalConfig(
			@Valid @RequestBody LeaveApprovalConfigDto leaveApprovalConfigDto) {
		ResponseEntityDto response = leaveApprovalConfigService.updateLeaveApprovalConfig(leaveApprovalConfigDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
