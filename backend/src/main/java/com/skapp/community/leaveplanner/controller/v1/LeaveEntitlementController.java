package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.BulkLeaveEntitlementDto;
import com.skapp.community.leaveplanner.payload.CarryForwardByLeaveTypesDto;
import com.skapp.community.leaveplanner.payload.CarryForwardLeaveTypesFilterDto;
import com.skapp.community.leaveplanner.payload.CustomEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.CustomLeaveEntitlementDto;
import com.skapp.community.leaveplanner.payload.CustomLeaveEntitlementPatchRequestDto;
import com.skapp.community.leaveplanner.payload.CustomLeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementPatchRequestDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.service.LeaveEntitlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/leave/entitlement")
public class LeaveEntitlementController {

	private final LeaveEntitlementService leaveEntitlementService;

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateLeaveEntitlement(@PathVariable Long id,
			@Valid @RequestBody LeaveEntitlementPatchRequestDto leaveEntitlementPatchRequestDto) {
		leaveEntitlementService.updateLeaveEntitlements(id, leaveEntitlementPatchRequestDto);
		return new ResponseEntity<>(new ResponseEntityDto("Data update Successfully", false), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@PatchMapping(value = "/custom/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateCustomLeaveEntitlement(@PathVariable Long id,
			@Valid @RequestBody CustomLeaveEntitlementPatchRequestDto customLeaveEntitlementPatchRequestDto) {
		leaveEntitlementService.updateCustomLeaveEntitlements(id, customLeaveEntitlementPatchRequestDto);
		return new ResponseEntity<>(new ResponseEntityDto("Data update Successfully", false), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	@DeleteMapping(value = "/custom/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteCustomLeaveEntitlements(@PathVariable Long id) {
		ResponseEntityDto response = leaveEntitlementService.deleteCustomLeaveEntitlements(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@DeleteMapping(value = "/default/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteDefaultLeaveEntitlements(@PathVariable Long id) {
		ResponseEntityDto response = leaveEntitlementService.deleteDefaultEntitlements(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@PostMapping(value = "/custom", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createCustomEntitlement(
			@RequestBody @Valid CustomLeaveEntitlementDto customEntitlementDto) {
		ResponseEntityDto response = leaveEntitlementService.createCustomEntitlementForEmployee(customEntitlementDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@PostMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> addEntitlements(
			@Valid @RequestBody LeaveEntitlementsDto leaveEntitlementsDto) {
		ResponseEntityDto response = leaveEntitlementService.addLeaveEntitlements(leaveEntitlementsDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getLeaveEntitlementByEntitlementId(@PathVariable Long id) {
		ResponseEntityDto response = leaveEntitlementService.getLeaveEntitlementById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/custom/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCustomLeaveEntitlementByEntitlementId(@PathVariable Long id) {
		ResponseEntityDto response = leaveEntitlementService.getCustomLeaveEntitlementById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@PostMapping(value = "/carry-forward", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> forceCarryForwardEntitlements(
			@RequestBody CarryForwardByLeaveTypesDto carryForwardByLeaveTypesDto) {
		ResponseEntityDto response = leaveEntitlementService.forceCarryForwardEntitlements(
				carryForwardByLeaveTypesDto.getLeaveTypes(), carryForwardByLeaveTypesDto.getCycleStartYear());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/carry-forward", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCarryForwardEntitlements(
			@Valid CarryForwardLeaveTypesFilterDto carryForwardLeaveTypesFilterDto) {
		ResponseEntityDto response = leaveEntitlementService
			.getCarryForwardEntitlements(carryForwardLeaveTypesFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/custom", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAllCustomLeaveEntitlements(
			CustomEntitlementsFilterDto customEntitlementsFilterDto) {
		ResponseEntityDto response = leaveEntitlementService.getAllCustomLeaveEntitlements(customEntitlementsFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN','ROLE_LEAVE_MANAGER')")
	@PostMapping(value = "/bulk", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> addNewLeaveEntitlements(
			@Valid @RequestBody BulkLeaveEntitlementDto bulkLeaveEntitlementDto) {
		ResponseEntityDto response = leaveEntitlementService.addBulkNewLeaveEntitlement(bulkLeaveEntitlementDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getLeaveEntitlementsByDate(
			@Valid CustomLeaveEntitlementsFilterDto customLeaveEntitlementsFilterDto) {
		ResponseEntityDto response = leaveEntitlementService
			.getLeaveEntitlementByDate(customLeaveEntitlementsFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/user/entitlements", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCurrentUserLeaveEntitlements(
			@Valid LeaveEntitlementsFilterDto leaveEntitlementsFilterDto) {
		ResponseEntityDto responseDto = leaveEntitlementService
			.getCurrentUserLeaveEntitlements(leaveEntitlementsFilterDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@GetMapping(value = "/balance/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getCurrentUserEntitlementBalanceByTypeId(@PathVariable Long id) {
		ResponseEntityDto responseDto = leaveEntitlementService.getCurrentUserLeaveEntitlementBalance(id);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

}
