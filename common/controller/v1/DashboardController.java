package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.response.DashboardNotificationCountDto;
import com.skapp.enterprise.common.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/dashboard")
@Slf4j
public class DashboardController {

	private final DashboardService dashboardService;

	@GetMapping("/pending-count")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_EMPLOYEE','ROLE_ATTENDANCE_EMPLOYEE', 'ROLE_ESIGN_EMPLOYEE')")
	public ResponseEntity<DashboardNotificationCountDto> getPendingSummary() {
		log.info("Request received to get pending items summary");
		DashboardNotificationCountDto response = dashboardService.getDashboardNotificationCounts();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
