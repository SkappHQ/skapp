package com.skapp.community.okrplanner.controller.v1;

import com.skapp.community.okrplanner.payload.request.TeamObjectiveRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.service.TeamObjectiveService;

import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/team-objectives")
public class TeamObjectivesController {

	private final TeamObjectiveService teamObjectiveService;

	@Operation(summary = "Get Team objectives",
			description = "Retrieve team objectives based on team ID and effective time period.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getTeamObjectives(@RequestParam Long teamId,
			@RequestParam Long effectiveTimePeriod) {

		ResponseEntityDto response = teamObjectiveService.findTeamObjectivesByTeamAndEffectiveTimePeriod(teamId,
				effectiveTimePeriod);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Team objective by ID", description = "Retrieve team objective details using ID.")
	@PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@GetMapping("/{id}")
	public ResponseEntity<ResponseEntityDto> getTeamObjectiveById(@PathVariable Long id) {
		ResponseEntityDto response = teamObjectiveService.findTeamObjectiveById(id);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create Team Objective",
			description = "Create a new team objective with the provided details.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createTeamObjective(
			@RequestBody @Valid TeamObjectiveRequestDto requestDto) {
		ResponseEntityDto response = teamObjectiveService.createTeamObjective(requestDto);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

}
