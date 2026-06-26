package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestManagerUpdateDto;
import com.skapp.community.leaveplanner.service.LeaveService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/leave/managers")
@Tag(name = "Leave Manager Controller", description = "Operations related to leave functionalities related to managers")
public class ManagerLeaveController {

	private final LeaveService leaveService;

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateLeaveRequest(@PathVariable Long id,
			@Valid @RequestBody LeaveRequestManagerUpdateDto leaveRequestDto) {
		ResponseEntityDto response = leaveService.updateLeaveRequestByManager(id, leaveRequestDto, true);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
