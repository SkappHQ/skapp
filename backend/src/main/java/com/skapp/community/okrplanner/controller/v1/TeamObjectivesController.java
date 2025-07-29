package com.skapp.community.okrplanner.controller.v1;

import com.skapp.community.okrplanner.payload.response.TeamObjectiveResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.service.TeamObjectiveService;
import com.skapp.community.okrplanner.model.TeamObjective;

import java.util.List;

import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/team-objectives")
public class TeamObjectivesController {

	private final TeamObjectiveService teamObjectiveService;

	// TODO: Change the role to ROLE_OKR_MANAGER when the role is created
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getTeamObjectives(@RequestParam Long teamId,
			@RequestParam Long effectiveTimePeriod) {

		ResponseEntityDto response = teamObjectiveService.findTeamObjectivesByTeamAndEffectiveTimePeriod(teamId,
				effectiveTimePeriod);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping("/{id}")
	public ResponseEntity<ResponseEntityDto> getTeamObjectiveById(@PathVariable Long id) {
		ResponseEntityDto response = teamObjectiveService.findTeamObjectiveById(id);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
