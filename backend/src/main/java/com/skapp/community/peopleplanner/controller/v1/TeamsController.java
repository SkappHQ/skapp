package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.TeamPatchRequestDto;
import com.skapp.community.peopleplanner.payload.request.TeamRequestDto;
import com.skapp.community.peopleplanner.payload.request.TeamsRequestDto;
import com.skapp.community.peopleplanner.payload.request.TransferTeamMembersDto;
import com.skapp.community.peopleplanner.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/v1/teams")
@Tag(name = "Teams Controller", description = "Endpoints for team management")
public class TeamsController {

	@NonNull
	private final TeamService teamService;

	@Operation(summary = "Create a team",
			description = "This endpoint creates a team with a given name, supervisors and members")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> addNewTeam(@Valid @RequestBody TeamRequestDto teamDetailsDto) {
		ResponseEntityDto response = teamService.addNewTeam(teamDetailsDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get all teams",
			description = "This endpoint returns all the active teams alone with team member details")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAllTeamDetails() {
		ResponseEntityDto response = teamService.getAllTeamDetails();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve Manager's Active Teams",
			description = "This endpoint retrieves all active teams managed by the current manager, including the details of team members.")
	@GetMapping("/manager")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER', 'ROLE_ATTENDANCE_MANAGER', 'ROLE_LEAVE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getManagerTeams() {
		ResponseEntityDto response = teamService.getManagerTeams();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update team", description = "This endpoint updates team by team ID")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateTeam(@PathVariable Long id,
			@Valid @RequestBody TeamPatchRequestDto teamPatchRequestDto) {
		ResponseEntityDto response = teamService.updateTeam(id, teamPatchRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get team", description = "This endpoint returns team with the given team ID")
	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTeamByTeamId(@PathVariable Long id) {
		ResponseEntityDto response = teamService.getTeamByTeamId(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create teams", description = "This endpoint creates team with given names")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PostMapping(value = "/bulk", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> addTeams(@Valid @RequestBody TeamsRequestDto teamsRequestDto) {
		ResponseEntityDto response = teamService.addTeams(teamsRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PatchMapping(value = "team-transfer/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> transferMembersAndDeleteTeam(@PathVariable Long id,
			@Valid @RequestBody List<TransferTeamMembersDto> transferTeamMembersDtoList) {
		ResponseEntityDto response = teamService.transferMembersAndDeleteTeam(id, transferTeamMembersDtoList);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get teams for the current user",
			description = "This endpoint returns the teams related to the currently logged-in employee")
	@GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getTeamsForCurrentUser() {
		ResponseEntityDto response = teamService.getTeamsForCurrentUser();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
