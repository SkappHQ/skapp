package com.skapp.enterprise.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.leaveplanner.payload.response.EpLeaveInsightContextResponseDto;
import com.skapp.enterprise.leaveplanner.service.EpLeaveInsightInternalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/leave")
@Tag(name = "Leave Insight Internal API",
		description = "Internal endpoints for leave insight context used by the PM service")
public class EpLeaveInsightInternalController {

	private final EpLeaveInsightInternalService epLeaveInsightInternalService;

	@GetMapping(value = "/insight-context", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	@Operation(summary = "Get leave insight context",
			description = "Returns pre-computed leave data for a set of employees within the warning window. The response is always wrapped in a ResponseEntityDto. When no relevant leave signals exist, the results field contains a single null element — the caller should treat this as a no-op and skip the AI model call.")
	public ResponseEntity<ResponseEntityDto> getLeaveInsightContext(
			@RequestParam(required = false) List<Long> employeeIds, @RequestParam int warningWindowDays,
			@RequestParam int capacityDropThresholdPct) {
		EpLeaveInsightContextResponseDto context = epLeaveInsightInternalService.getLeaveInsightContext(employeeIds,
				warningWindowDays, capacityDropThresholdPct);
		return new ResponseEntity<>(new ResponseEntityDto(false, context), HttpStatus.OK);
	}

}
