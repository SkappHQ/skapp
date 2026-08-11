package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.BirthdayNotificationConfigRequestDto;
import com.skapp.community.peopleplanner.service.PeopleConfigService;
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
@RequestMapping("/v1/people-config")
@Tag(name = "People Config Controller", description = "Operations related to people module config functionalities")
public class PeopleConfigController {

	private final PeopleConfigService peopleConfigService;

	@Operation(summary = "Get birthday notification configuration",
			description = "Returns the organization-wide configuration controlling birthday notifications.")
	@GetMapping(value = "/birthday-notifications")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getBirthdayNotificationConfigs() {
		ResponseEntityDto response = peopleConfigService.getBirthdayNotificationConfigs();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update birthday notification configuration",
			description = "Partially updates the organization-wide configuration controlling birthday notifications.")
	@PatchMapping(value = "/birthday-notifications")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateBirthdayNotificationConfigs(
			@RequestBody BirthdayNotificationConfigRequestDto requestDto) {
		ResponseEntityDto response = peopleConfigService.updateBirthdayNotificationConfigs(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
