package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InternalProjectCreationRequestDto;
import com.skapp.enterprise.invoice.service.InternalProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/invoice/project")
public class InternalProjectController {

	private final InternalProjectService internalProjectService;

	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> addProjectToCustomer(
			@RequestBody InternalProjectCreationRequestDto internalProjectCreationRequestDto) {

		ResponseEntityDto response = internalProjectService.createProjectForCustomer(internalProjectCreationRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
