package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobFamilyRequestDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobTitleRequestDto;
import com.skapp.community.peopleplanner.payload.request.UpdateJobFamilyRequestDto;
import com.skapp.community.peopleplanner.service.JobService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.NonNull;
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

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/job")
@Tag(name = "Job Controller", description = "Endpoints for job family and title management")
public class JobController {

	@NonNull
	private final JobService jobService;

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(value = "family", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAllJobFamilies() {
		ResponseEntityDto response = jobService.getAllJobFamilies();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	@GetMapping(value = "family/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getJobFamilyById(@PathVariable Long id) {
		ResponseEntityDto response = jobService.getJobFamilyById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	@PostMapping(value = "family", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> addJobFamily(@RequestBody @Valid JobFamilyDto jobFamilyDto) {
		ResponseEntityDto response = jobService.addJobFamily(jobFamilyDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PatchMapping(value = "family/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateJobFamily(@PathVariable Long id,
			@RequestBody @Valid UpdateJobFamilyRequestDto updateJobFamilyRequestDto) {
		ResponseEntityDto response = jobService.updateJobFamily(id, updateJobFamilyRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PatchMapping(value = "family/transfer/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> transferJobFamily(@PathVariable Long id,
			@RequestBody @Valid List<TransferJobFamilyRequestDto> transferJobFamilyRequestDto) {
		ResponseEntityDto response = jobService.transferJobFamily(id, transferJobFamilyRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@DeleteMapping(value = "family/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteJobFamily(@PathVariable Long id) {
		ResponseEntityDto response = jobService.deleteJobFamily(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@GetMapping(value = "title/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getJobTitleById(@PathVariable Long id) {
		ResponseEntityDto response = jobService.getJobTitleById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PatchMapping(value = "title/transfer/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> transferJobTitle(@PathVariable Long id,
			@RequestBody @Valid List<TransferJobTitleRequestDto> transferJobTitleRequestDto) {
		ResponseEntityDto response = jobService.transferJobTitle(id, transferJobTitleRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@DeleteMapping(value = "title/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteJobTitle(@PathVariable Long id) {
		ResponseEntityDto response = jobService.deleteJobTitle(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
