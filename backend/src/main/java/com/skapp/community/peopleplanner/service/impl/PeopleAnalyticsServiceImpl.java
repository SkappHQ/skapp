package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmploymentBreakdownFilterDto;
import com.skapp.community.peopleplanner.payload.request.PeopleAnalyticsFilterDto;
import com.skapp.community.peopleplanner.payload.request.PeopleAnalyticsPeopleFilterDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeHireResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeTurnoverRateResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmploymentAllocationResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmploymentBreakdownResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmploymentTypesResponseDto;
import com.skapp.community.peopleplanner.payload.response.GenderDistributionResponseDto;
import com.skapp.community.peopleplanner.payload.response.JobFamilyOverviewDto;
import com.skapp.community.peopleplanner.payload.response.JobFamilyOverviewResponseDto;
import com.skapp.community.peopleplanner.payload.response.JobTitleOverviewDto;
import com.skapp.community.peopleplanner.payload.response.PeopleDashboardSummaryResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.PeopleAnalyticsService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.type.Gender;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PeopleAnalyticsServiceImpl implements PeopleAnalyticsService {

	@NonNull
	private final EmployeeDao employeeDao;

	@NonNull
	private final TeamDao teamDao;

	@NonNull
	private final JobFamilyDao jobFamilyDao;

	@NonNull
	private final PeopleMapper peopleMapper;

	@Override
	public ResponseEntityDto getDashBoardSummary(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto) {
		log.info("getPeopleModuleAnalytics: execution started");

		PeopleDashboardSummaryResponseDto peopleDashboardSummaryResponseDto = new PeopleDashboardSummaryResponseDto();
		peopleDashboardSummaryResponseDto
			.setTotalEmployees(getActiveEmployeesByTeams(peopleAnalyticsFilterDto.getTeams()));
		peopleDashboardSummaryResponseDto
			.setPendingEmployees(getPendingEmployeesByTeams(peopleAnalyticsFilterDto.getTeams()));
		peopleDashboardSummaryResponseDto
			.setAverageEmployeeAge(getAverageEmployeeByTeams(peopleAnalyticsFilterDto.getTeams()));
		peopleDashboardSummaryResponseDto
			.setEmployeeHireResponseDto(getEmployeeHireResponseDto(peopleAnalyticsFilterDto.getTeams()));
		peopleDashboardSummaryResponseDto.setEmployeeTurnoverRateResponseDto(
				getEmployeeTurnoverRateResponseDto(peopleAnalyticsFilterDto.getTeams()));

		log.info("getPeopleModuleAnalytics: execution ended");
		return new ResponseEntityDto(false, peopleDashboardSummaryResponseDto);
	}

	@Override
	public ResponseEntityDto getGenderDistribution(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto) {
		log.info("getGenderDistribution: execution started");

		Long totalActiveEmployees = getActiveEmployeesByTeams(peopleAnalyticsFilterDto.getTeams());
		Long totalActiveMaleEmployees = employeeDao.countByIsActiveAndTeamsAndGender(true,
				peopleAnalyticsFilterDto.getTeams(), Gender.MALE);
		Long totalActiveFemaleEmployees = employeeDao.countByIsActiveAndTeamsAndGender(true,
				peopleAnalyticsFilterDto.getTeams(), Gender.FEMALE);
		Long totalActiveOtherEmployees = employeeDao.countByIsActiveAndTeamsAndGender(true,
				peopleAnalyticsFilterDto.getTeams(), Gender.OTHER);

		GenderDistributionResponseDto genderDistributionResponseDto = new GenderDistributionResponseDto();
		genderDistributionResponseDto.setTotalActiveEmployees(totalActiveEmployees);
		genderDistributionResponseDto.setTotalActiveMaleEmployees(totalActiveMaleEmployees);
		genderDistributionResponseDto.setTotalActiveFemaleEmployees(totalActiveFemaleEmployees);
		genderDistributionResponseDto.setTotalActiveOtherEmployees(totalActiveOtherEmployees);

		log.info("getGenderDistribution: execution ended");
		return new ResponseEntityDto(false, genderDistributionResponseDto);
	}

	@Override
	public ResponseEntityDto getEmploymentBreakdown(EmploymentBreakdownFilterDto employmentBreakdownFilterDto) {
		log.info("getEmploymentBreakdown: execution started");

		EmploymentBreakdownResponseDto employmentBreakdownResponseDto = new EmploymentBreakdownResponseDto();

		EmploymentTypesResponseDto employmentTypesResponseDto = new EmploymentTypesResponseDto();
		employmentTypesResponseDto.setIntern(employeeDao.countByEmploymentTypeAndEmploymentAllocationAndTeams(
				EmploymentType.INTERN, null, employmentBreakdownFilterDto.getTeams()));
		employmentTypesResponseDto.setContract(employeeDao.countByEmploymentTypeAndEmploymentAllocationAndTeams(
				EmploymentType.CONTRACT, null, employmentBreakdownFilterDto.getTeams()));
		employmentTypesResponseDto.setPermanent(employeeDao.countByEmploymentTypeAndEmploymentAllocationAndTeams(
				EmploymentType.PERMANENT, null, employmentBreakdownFilterDto.getTeams()));

		employmentBreakdownResponseDto.setEmploymentTypesResponseDto(employmentTypesResponseDto);

		EmploymentAllocationResponseDto employmentAllocationResponseDto = new EmploymentAllocationResponseDto();
		employmentAllocationResponseDto.setFullTime(employeeDao.countByEmploymentTypeAndEmploymentAllocationAndTeams(
				null, EmploymentAllocation.FULL_TIME, employmentBreakdownFilterDto.getTeams()));
		employmentAllocationResponseDto.setPartTime(employeeDao.countByEmploymentTypeAndEmploymentAllocationAndTeams(
				null, EmploymentAllocation.PART_TIME, employmentBreakdownFilterDto.getTeams()));

		employmentBreakdownResponseDto.setEmploymentAllocationResponseDto(employmentAllocationResponseDto);

		log.info("getEmploymentBreakdown: execution ended");
		return new ResponseEntityDto(false, employmentBreakdownResponseDto);
	}

	@Override
	public ResponseEntityDto getJobFamilyOverview(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto) {
		log.info("getJobFamilyOverview: execution started");

		List<JobFamilyOverviewDto> jobFamilyOverviewDtos = jobFamilyDao
			.getJobFamilyOverview(peopleAnalyticsFilterDto.getTeams());

		jobFamilyOverviewDtos.forEach(jobFamily -> {
			Long jobFamilyId = jobFamily.getJobFamilyId();
			List<JobTitleOverviewDto> jobTitleOverviews = jobFamilyDao.getJobTitlesByJobFamily(jobFamilyId);
			jobFamily.setJobTitleOverview(jobTitleOverviews);
		});

		JobFamilyOverviewResponseDto jobFamilyOverviewResponseDto = new JobFamilyOverviewResponseDto();
		jobFamilyOverviewResponseDto.setJobFamilyOverviewDtos(jobFamilyOverviewDtos);

		log.info("getJobFamilyOverview: execution ended");
		return new ResponseEntityDto(false, jobFamilyOverviewResponseDto);
	}

	@Override
	public ResponseEntityDto getPeopleSection(PeopleAnalyticsPeopleFilterDto peopleAnalyticsPeopleFilterDto) {
		log.info("getPeopleSection: execution started");

		Long teamId = peopleAnalyticsPeopleFilterDto.getTeamId();
		if (teamId != null) {
			Optional<Team> optionalTeam = teamDao.findById(teamId);
			if (optionalTeam.isEmpty()) {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
			}
		}

		Boolean isActive = peopleAnalyticsPeopleFilterDto.getIsActive();
		if (isActive == null) {
			isActive = true;
		}

		List<Employee> employees = employeeDao
			.findByNameAndIsActiveAndTeam(peopleAnalyticsPeopleFilterDto.getEmployeeName(), isActive, teamId);

		List<EmployeeResponseDto> employeeResponseDtos = peopleMapper.employeeListToEmployeeResponseDtoList(employees);

		log.info("getPeopleSection: execution ended");
		return new ResponseEntityDto(false, employeeResponseDtos);
	}

	private Long getActiveEmployeesByTeams(List<Long> teamIds) {
		return employeeDao.countByIsActiveAndTeams(teamIds, AccountStatus.ACTIVE);
	}

	private Long getPendingEmployeesByTeams(List<Long> teamIds) {
		return employeeDao.countByIsActiveAndTeams(teamIds, AccountStatus.PENDING);
	}

	private EmployeeHireResponseDto getEmployeeHireResponseDto(List<Long> teamIds) {
		EmployeeHireResponseDto employeeHireResponseDto = new EmployeeHireResponseDto();

		Long newHires = employeeDao.countByIsActiveAndTeamsAndCreatedAt(true, teamIds, DateTimeUtils.getCurrentYear());
		Long existsThisYear = employeeDao.countByIsActiveAndTeamsAndCreatedAt(false, teamIds,
				DateTimeUtils.getCurrentYear());

		employeeHireResponseDto.setNewHires(newHires);
		employeeHireResponseDto.setExistsThisYear(existsThisYear);

		return employeeHireResponseDto;
	}

	private Double getAverageEmployeeByTeams(List<Long> teamIds) {
		return employeeDao.findAverageAgeOfActiveEmployeesByTeamIds(teamIds);
	}

	private EmployeeTurnoverRateResponseDto getEmployeeTurnoverRateResponseDto(List<Long> teamIds) {
		if (teamIds != null && teamIds.isEmpty()) {
			EmployeeTurnoverRateResponseDto emptyResponse = new EmployeeTurnoverRateResponseDto();
			emptyResponse.setTurnoverRate(0.0);
			emptyResponse.setTurnOverRateChange(0.0);
			return emptyResponse;
		}

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		LocalDate thirtyDaysBeforeCurrentDate = currentDate.minusDays(30);

		Long numberOfTerminatedEmployeesInLastThirtyDays = employeeDao
			.countTerminatedEmployeesByStartDateAndEndDateAndTeams(thirtyDaysBeforeCurrentDate, currentDate, teamIds);
		Long employeeCountAtTheStartOfTheThirtyDays = employeeDao
			.countByCreateDateRangeAndTeams(thirtyDaysBeforeCurrentDate, teamIds);
		Long employeeCount = employeeDao.countByCreateDateRangeAndTeams(currentDate, teamIds);

		double averageNumberOfEmployeesOverTheLastThirtyDays = (employeeCount + employeeCountAtTheStartOfTheThirtyDays)
				/ 2.0;
		double turnoverRate = 0;
		if (averageNumberOfEmployeesOverTheLastThirtyDays != 0) {
			turnoverRate = (numberOfTerminatedEmployeesInLastThirtyDays / averageNumberOfEmployeesOverTheLastThirtyDays)
					* 100;
		}

		Long numberOfTerminatedEmployeesFromSixtyToThirtyDaysAgo = employeeDao
			.countTerminatedEmployeesByStartDateAndEndDateAndTeams(thirtyDaysBeforeCurrentDate.minusDays(30),
					thirtyDaysBeforeCurrentDate, teamIds);

		Long employeeCountAtSixtyDaysAgo = employeeDao
			.countByCreateDateRangeAndTeams(thirtyDaysBeforeCurrentDate.minusDays(30), teamIds);
		Long employeeCountAtThirtyDaysAgo = employeeDao.countByCreateDateRangeAndTeams(thirtyDaysBeforeCurrentDate,
				teamIds);

		double averageNumberOfEmployeesOverPreviousThirtyDays = (employeeCountAtSixtyDaysAgo
				+ employeeCountAtThirtyDaysAgo) / 2.0;
		double turnoverRateThirtyDaysAgo = 0;
		if (averageNumberOfEmployeesOverPreviousThirtyDays != 0) {
			turnoverRateThirtyDaysAgo = (numberOfTerminatedEmployeesFromSixtyToThirtyDaysAgo
					/ averageNumberOfEmployeesOverPreviousThirtyDays) * 100;
		}

		double changeInTurnoverRate = 0;
		if (turnoverRateThirtyDaysAgo != 0) {
			changeInTurnoverRate = ((turnoverRate - turnoverRateThirtyDaysAgo) / turnoverRateThirtyDaysAgo) * 100;
		}

		EmployeeTurnoverRateResponseDto employeeTurnoverRateResponseDto = new EmployeeTurnoverRateResponseDto();
		employeeTurnoverRateResponseDto.setTurnoverRate(turnoverRate);
		employeeTurnoverRateResponseDto.setTurnOverRateChange(changeInTurnoverRate);
		return employeeTurnoverRateResponseDto;
	}

}
