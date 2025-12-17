package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.response.EpUserAuthPicResponseDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.people.service.EpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/users")
public class EpUserController {

	private final EpUserService epUserService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<EpUserResponseDto>> getUsers(
			@RequestParam(value = "employeeIds", required = false) List<Long> employeeIds) {
		List<EpUserResponseDto> response = epUserService.getAllUsersOrByIds(employeeIds);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/auth-pics")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<EpUserAuthPicResponseDto>> getUserAuthPics(
			@RequestParam(value = "employeeIds", required = false) List<Long> employeeIds) {
		List<EpUserAuthPicResponseDto> response = epUserService.getAllUserAuthPicsOrByIds(employeeIds);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
