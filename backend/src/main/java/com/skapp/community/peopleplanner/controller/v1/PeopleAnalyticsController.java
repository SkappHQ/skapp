package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmploymentBreakdownFilterDto;
import com.skapp.community.peopleplanner.payload.request.PeopleAnalyticsFilterDto;
import com.skapp.community.peopleplanner.payload.request.PeopleAnalyticsPeopleFilterDto;
import com.skapp.community.peopleplanner.service.PeopleAnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/people/analytics")
@Tag(name = "People Analytics Controller", description = "Operations related to people module analytics")
public class PeopleAnalyticsController {

	@NonNull
	private final PeopleAnalyticsService peopleAnalyticsService;

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	@GetMapping("/dashboard-summary")
	public ResponseEntity<ResponseEntityDto> dashboardSummary(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto) {
		ResponseEntityDto response = peopleAnalyticsService.getDashBoardSummary(peopleAnalyticsFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	@GetMapping("/gender-distribution")
	public ResponseEntity<ResponseEntityDto> genderDistribution(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto) {
		ResponseEntityDto response = peopleAnalyticsService.getGenderDistribution(peopleAnalyticsFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	@GetMapping("/employment-breakdown")
	public ResponseEntity<ResponseEntityDto> employmentBreakdown(
			EmploymentBreakdownFilterDto employmentBreakdownFilterDto) {
		ResponseEntityDto response = peopleAnalyticsService.getEmploymentBreakdown(employmentBreakdownFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	@GetMapping("/job-family-overview")
	public ResponseEntity<ResponseEntityDto> jobFamilyOverview(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto) {
		ResponseEntityDto response = peopleAnalyticsService.getJobFamilyOverview(peopleAnalyticsFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@GetMapping("/people")
	public ResponseEntity<ResponseEntityDto> peopleSection(
			PeopleAnalyticsPeopleFilterDto peopleAnalyticsPeopleFilterDto) {
		ResponseEntityDto response = peopleAnalyticsService.getPeopleSection(peopleAnalyticsPeopleFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
