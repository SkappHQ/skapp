package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.LeaveCycleDetailsDto;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/leave-cycle")
public class LeaveCycleController {

	@NonNull
	private final LeaveCycleService leaveCycleService;

	@Operation(summary = "Get leave cycle configurations", description = "Fetch leave cycle configurations.")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getLeaveCycleConfigs() {
		LeaveCycleDetailsDto leaveCycleConfigs = leaveCycleService.getLeaveCycleConfigs();
		return new ResponseEntity<>(new ResponseEntityDto(false, leaveCycleConfigs), HttpStatus.OK);
	}

}
