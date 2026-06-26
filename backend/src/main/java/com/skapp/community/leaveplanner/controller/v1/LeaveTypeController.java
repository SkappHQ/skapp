package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypeFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypePatchRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypeRequestDto;
import com.skapp.community.leaveplanner.service.LeaveTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.NonNull;
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
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/types")
@Tag(name = "Leave Type Controller", description = "Operations related to managing leave types")
public class LeaveTypeController {

	@NonNull
	private final LeaveTypeService leaveTypeService;

	@Operation(summary = "Add a new leave type", description = "Allows administrators to add a new leave type.")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> addLeaveType(@Valid @RequestBody LeaveTypeRequestDto leaveTypeRequestDto) {
		ResponseEntityDto response = leaveTypeService.addLeaveType(leaveTypeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all leave types", description = "Fetch all leave types available in the system.")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN','ROLE_LEAVE_MANAGER','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getLeaveTypes(@Valid LeaveTypeFilterDto leaveTypeFilterDto) {
		ResponseEntityDto response = leaveTypeService.getLeaveTypes(leaveTypeFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a leave type by ID", description = "Fetch a leave type by its unique ID.")
	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getLeaveTypeById(@PathVariable Long id) {
		ResponseEntityDto leaveRequests = leaveTypeService.getLeaveTypeById(id);
		return new ResponseEntity<>(leaveRequests, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateLeaveTypeById(@PathVariable Long id,
			@Valid @RequestBody LeaveTypePatchRequestDto leaveTypePatchRequestDto) {
		ResponseEntityDto leaveRequests = leaveTypeService.updateLeaveType(id, leaveTypePatchRequestDto);
		return new ResponseEntity<>(leaveRequests, HttpStatus.OK);
	}

}
