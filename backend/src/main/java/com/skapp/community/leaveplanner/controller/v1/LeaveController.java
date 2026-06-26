package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.ResourceAvailabilityCalendarFilter;
import com.skapp.community.leaveplanner.payload.request.LeavePatchRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestAvailabilityFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PendingLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.response.LeaveNotificationNudgeResponseDto;
import com.skapp.community.leaveplanner.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/leave")
@Tag(name = "Leave Controller", description = "Operations related to leave functionalities")
public class LeaveController {

	@NonNull
	private final LeaveService leaveService;

	@Operation(summary = "Apply for a new leave request",
			description = "Allows an employee to apply for a leave request.")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> applyLeaveRequest(@Valid @RequestBody LeaveRequestDto leaveRequestDto) {
		ResponseEntityDto response = leaveService.applyLeaveRequest(leaveRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get current user's leave requests",
			description = "Fetch all leave requests for the currently authenticated user.")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getCurrentUserLeaveRequests(
			@Valid LeaveRequestFilterDto leaveRequestFilterDto) {
		ResponseEntityDto response = leaveService.getCurrentUserLeaveRequests(leaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update an existing leave request",
			description = "Allows an employee to update an existing leave request.")
	@PatchMapping("{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> updateLeaveRequestByEmployee(@PathVariable Long id,
			@Valid @RequestBody LeavePatchRequestDto leavePatchRequestDto) {
		ResponseEntityDto response = leaveService.updateLeaveRequestByEmployee(leavePatchRequestDto, id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a leave request by ID", description = "Fetch a leave request by its unique ID.")
	@GetMapping("{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getLeaveRequestById(@PathVariable Long id) {
		ResponseEntityDto leaveRequests = leaveService.getLeaveRequestById(id);
		return new ResponseEntity<>(leaveRequests, HttpStatus.OK);
	}

	@Operation(summary = "Get a leave request by ID for manager",
			description = "Fetch a leave request by its ID for managers.")
	@GetMapping("/manager/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getManagerLeaveRequestById(@PathVariable Long id) {
		ResponseEntityDto leaveRequests = leaveService.getAssignedLeaveRequestById(id);
		return new ResponseEntity<>(leaveRequests, HttpStatus.OK);
	}

	@Operation(summary = "Delete a leave request by ID", description = "Delete a leave request by its unique ID.")
	@DeleteMapping("{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> deleteLeaveRequestById(@PathVariable Long id) {
		ResponseEntityDto response = leaveService.deleteLeaveRequestById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Manager assigned leaves",
			description = "Fetch all leave requests assigned to the currently authenticated user.")
	@GetMapping(value = "/requests", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getManagerAssignedLeaves(LeaveRequestFilterDto leaveRequestFilterDto) {
		ResponseEntityDto response = leaveService.getAssignedLeavesToManager(leaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Manager assigned leaves",
			description = "Fetch all leave requests assigned to the currently authenticated user.")
	@GetMapping(value = "/pending-requests", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getManagerAssignedPendingLeaves(
			PendingLeaveRequestFilterDto pendingLeaveRequestFilterDto) {
		ResponseEntityDto response = leaveService.getAssignedPendingLeavesToManager(pendingLeaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Resource Availability Calendar",
			description = "Fetch all leave requests assigned to the currently authenticated user.")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE', 'ROLE_PM_GUEST_EMPLOYEE')")
	@GetMapping("/resource-availability-calender")
	public ResponseEntity<ResponseEntityDto> getResourceAvailabilityCalendar(
			ResourceAvailabilityCalendarFilter resourceAvailabilityCalendarFilter) {
		ResponseEntityDto response = leaveService.getResourceAvailabilityCalendar(resourceAvailabilityCalendarFilter);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	@GetMapping(value = "/nudge/{leaveRequestId}")
	public ResponseEntity<ResponseEntityDto> nudgeManager(@Valid @PathVariable Long leaveRequestId) {
		return new ResponseEntity<>(leaveService.nudgeManagers(leaveRequestId), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	@GetMapping(value = "nudge/{leaveRequestId}/status", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getLeaveRequestIsNudge(@Valid @PathVariable Long leaveRequestId) {
		LeaveNotificationNudgeResponseDto nudgeResponseDto = leaveService.getLeaveRequestIsNudge(leaveRequestId);
		return new ResponseEntity<>(new ResponseEntityDto(false, nudgeResponseDto), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	@GetMapping("/availability")
	public ResponseEntity<ResponseEntityDto> getLeaveRequestAvailability(
			@Valid LeaveRequestAvailabilityFilterDto requestAvailabilityDto) {
		ResponseEntityDto response = leaveService.leaveRequestAvailability(requestAvailabilityDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
