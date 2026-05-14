package com.skapp.enterprise.timeplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.timeplanner.payload.request.EpAddTimeRecordDto;
import com.skapp.enterprise.timeplanner.service.EpTimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/time")
@Tag(name = "EP Time Controller", description = "Enterprise endpoints for time recordings with location tracking")
public class EpTimeController {

	private final EpTimeService epTimeService;

	@PostMapping(value = "/record", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ATTENDANCE_EMPLOYEE')")
	@Operation(summary = "Add time record with location",
			description = "Adds a time record and determines if the employee is inside or outside the geo-fence.")
	public ResponseEntity<ResponseEntityDto> addTimeRecordWithLocation(
			@Valid @RequestBody EpAddTimeRecordDto epAddTimeRecordDto) {
		ResponseEntityDto response = epTimeService.addTimeRecordWithLocation(epAddTimeRecordDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
