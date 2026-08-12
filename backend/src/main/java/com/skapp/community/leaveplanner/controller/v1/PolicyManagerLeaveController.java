package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveReviewRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyManagerLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.service.PolicyLeaveReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/policy-leave/managers")
@Tag(name = "Policy Leave Manager Controller",
		description = "Reviewing the leave requests raised against leave policies by the employees a manager supervises")
public class PolicyManagerLeaveController {

	private final PolicyLeaveReviewService policyLeaveReviewService;

	@Operation(summary = "Get the leave requests assigned to the current manager",
			description = "Paged, sorted and filtered feed backing the all leave requests table")
	@GetMapping("/requests")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getPolicyLeaveRequestsAssignedToManager(
			@Valid PolicyManagerLeaveRequestFilterDto policyManagerLeaveRequestFilterDto) {
		ResponseEntityDto response = policyLeaveReviewService
			.getPolicyLeaveRequestsAssignedToManager(policyManagerLeaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get the pending leave requests assigned to the current manager",
			description = "Unpaged feed backing the pending leave requests table and its quick actions. "
					+ "Capped at the 200 earliest starting requests")
	@GetMapping("/pending-requests")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getPendingPolicyLeaveRequestsAssignedToManager(
			@RequestParam(required = false) String searchKeyword) {
		ResponseEntityDto response = policyLeaveReviewService
			.getPendingPolicyLeaveRequestsAssignedToManager(searchKeyword);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a single leave request assigned to the current manager",
			description = "Includes the request description and any supporting documents")
	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getAssignedPolicyLeaveRequestById(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveReviewService.getAssignedPolicyLeaveRequestById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Approve, decline or revoke a leave request",
			description = "PENDING can move to APPROVED or DENIED, APPROVED can move to REVOKED")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> updatePolicyLeaveRequestByManager(@PathVariable Long id,
			@Valid @RequestBody PolicyLeaveReviewRequestDto policyLeaveReviewRequestDto) {
		ResponseEntityDto response = policyLeaveReviewService.updatePolicyLeaveRequestByManager(id,
				policyLeaveReviewRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
