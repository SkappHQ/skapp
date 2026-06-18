package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/people/skills")
@Tag(name = "Skill Controller", description = "Endpoints for skill management")
public class SkillController {

	private final SkillService skillService;

	@Operation(summary = "Get all custom skills", description = "Retrieves all custom skills.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAllSkills() {
		ResponseEntityDto response = skillService.getAllSkills();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
