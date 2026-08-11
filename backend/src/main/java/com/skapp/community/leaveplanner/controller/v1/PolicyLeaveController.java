package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAvailabilityRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveCancelRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.service.PolicyLeaveReviewService;
import com.skapp.community.leaveplanner.service.PolicyLeaveService;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/policy-leave")
@Tag(name = "Policy Leave Controller",
		description = "Viewing leave policy balances and applying for leave against a specific policy")
public class PolicyLeaveController {

	private final PolicyLeaveService policyLeaveService;

	private final PolicyLeaveReviewService policyLeaveReviewService;

	@Operation(summary = "Get the current user's leave policy balances",
			description = "One card per assigned policy; policies sharing a leave type are never merged")
	@GetMapping("/balances")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getCurrentUserPolicyBalances(
			@RequestParam(required = false) Integer year) {
		ResponseEntityDto response = policyLeaveService.getCurrentUserPolicyBalances(year);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get the current user's policy leave requests",
			description = "Paged, sorted and filtered feed backing the My Requests table. "
					+ "A negative size returns every matching request unpaginated, which is how the "
					+ "apply leave calendar fetches the requests already raised for a year")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getCurrentUserPolicyLeaveRequests(
			@Valid PolicyLeaveRequestFilterDto policyLeaveRequestFilterDto) {
		ResponseEntityDto response = policyLeaveService.getCurrentUserPolicyLeaveRequests(policyLeaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check availability against a policy before submitting",
			description = "Real-time balance and date validation; reports the failure reason instead of erroring")
	@PostMapping("/availability")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> checkPolicyLeaveAvailability(
			@Valid @RequestBody PolicyLeaveAvailabilityRequestDto policyLeaveAvailabilityRequestDto) {
		ResponseEntityDto response = policyLeaveService.checkPolicyLeaveAvailability(policyLeaveAvailabilityRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get one of the current user's leave requests",
			description = "Includes the reviewer comment and any supporting documents")
	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getMyPolicyLeaveRequestById(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveReviewService.getMyPolicyLeaveRequestById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Cancel one of the current user's pending leave requests",
			description = "Only a PENDING request can be cancelled by the employee who raised it")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> updatePolicyLeaveRequestByEmployee(@PathVariable Long id,
			@Valid @RequestBody PolicyLeaveCancelRequestDto policyLeaveCancelRequestDto) {
		ResponseEntityDto response = policyLeaveReviewService.updatePolicyLeaveRequestByEmployee(id,
				policyLeaveCancelRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Nudge the managers reviewing one of the current user's pending requests",
			description = "Re-sends the pending review email and notification to every leave manager of the requester")
	@GetMapping("/{id}/nudge")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> nudgePolicyLeaveRequestManagers(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveReviewService.nudgePolicyLeaveRequestManagers(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check whether a request can be nudged again",
			description = "A request can only be nudged once every 24 hours")
	@GetMapping("/{id}/nudge/status")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getPolicyLeaveRequestNudgeStatus(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveReviewService.getPolicyLeaveRequestNudgeStatus(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Apply for leave against a specific leave policy",
			description = "Deducts only from the scoped policy; the balance is re-checked server side")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> applyPolicyLeaveRequest(
			@Valid @RequestBody PolicyLeaveRequestDto policyLeaveRequestDto) {
		ResponseEntityDto response = policyLeaveService.applyPolicyLeaveRequest(policyLeaveRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
