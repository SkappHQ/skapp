package com.skapp.community.timeplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/attendance-config")
@Tag(name = "Attendance Config Controller", description = "Operations related to attendance config functionalities")
public class AttendanceConfigController {

	private final AttendanceConfigService attendanceConfigService;

	@Operation(summary = "Update Attendance Config",
			description = "This endpoint used to update default attendance config")
	@PreAuthorize("hasAnyRole('ATTENDANCE_ADMIN')")
	@PatchMapping
	public ResponseEntity<ResponseEntityDto> updateAttendanceConfig(
			@RequestBody AttendanceConfigRequestDto updateRequestDto) {
		ResponseEntityDto responseDto = attendanceConfigService.updateAttendanceConfig(updateRequestDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@Operation(summary = "Get All Attendance Configs", description = "This endpoint used to get all attendance configs")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getAllAttendanceConfigs() {
		ResponseEntityDto responseDto = attendanceConfigService.getAllAttendanceConfigs();
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

}
