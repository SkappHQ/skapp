package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.response.EpJobResponseDto;
import com.skapp.enterprise.common.service.EpJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/jobs")
public class EpJobController {

	private final EpJobService epJobService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<EpJobResponseDto>> getJobs() {
		return new ResponseEntity<>(epJobService.getJobs(), HttpStatus.OK);
	}

}
