package com.skapp.community.peopleplanner.mapper;

import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.EmployeeSignInResponseDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveEntitlementsDto;
import com.skapp.community.leaveplanner.payload.EmployeeSummarizedResponseDto;
import com.skapp.community.leaveplanner.payload.ManagerSummarizedTeamResponseDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveEntitlementReportExportDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeEducation;
import com.skapp.community.peopleplanner.model.EmployeeEmergency;
import com.skapp.community.peopleplanner.model.EmployeeFamily;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePeriod;
import com.skapp.community.peopleplanner.model.EmployeePersonalInfo;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeVisa;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobTitle;
import com.skapp.community.peopleplanner.model.ModuleRoleRestriction;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBulkDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDetailsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeEducationDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeEmergencyDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFamilyDto;
import com.skapp.community.peopleplanner.payload.request.EmployeePersonalInfoDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeProgressionsDto;
import com.skapp.community.peopleplanner.payload.request.EmploymentVisaDto;
import com.skapp.community.peopleplanner.payload.request.HolidayRequestDto;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.payload.request.ModuleRoleRestrictionRequestDto;
import com.skapp.community.peopleplanner.payload.request.TeamRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.emergency.EmployeeEmergencyContactDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsManagerDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentCareerProgressionDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentVisaDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalEducationalDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalFamilyDetailsDto;
import com.skapp.community.peopleplanner.payload.response.CreateEmployeeResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeAllDataExportResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeDataExportResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeDetailedResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeJobFamilyDto;
import com.skapp.community.peopleplanner.payload.response.EmployeePeriodResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeRoleResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import com.skapp.community.peopleplanner.payload.response.JobFamilyResponseDetailDto;
import com.skapp.community.peopleplanner.payload.response.JobFamilyResponseDto;
import com.skapp.community.peopleplanner.payload.response.JobTitleResponseDetailDto;
import com.skapp.community.peopleplanner.payload.response.ModuleRoleRestrictionResponseDto;
import com.skapp.community.peopleplanner.payload.response.TeamBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.response.TeamDetailResponseDto;
import com.skapp.community.peopleplanner.payload.response.TeamEmployeeResponseDto;
import com.skapp.community.peopleplanner.payload.response.TeamResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PeopleMapper {

	Employee createSuperAdminRequestDtoToEmployee(SuperAdminSignUpRequestDto superAdminSignUpRequestDto);

	EmployeeResponseDto employeeToEmployeeResponseDto(Employee employee);

	Team teamRequestDtoToTeam(TeamRequestDto teamRequestDto);

	TeamResponseDto teamToTeamResponseDto(Team team);

	List<TeamResponseDto> teamListToTeamResponseDtoList(List<Team> teams);

	Holiday holidayDtoToHoliday(HolidayRequestDto holidayRequestDto);

	HolidayResponseDto holidayToHolidayResponseDto(Holiday holiday);

	List<HolidayResponseDto> holidaysToHolidayResponseDtoList(List<Holiday> holidays);

	List<JobFamilyResponseDetailDto> jobFamilyListToJobFamilyResponseDetailDtoList(List<JobFamily> jobFamilies);

	JobFamilyResponseDetailDto jobFamilyToJobFamilyResponseDetailDto(JobFamily jobFamily);

	JobTitleResponseDetailDto jobTitleToJobTitleResponseDetailDto(JobTitle jobTitle);

	JobFamilyResponseDto jobFamilyToJobFamilyResponseDto(JobFamily jobFamily);

	JobFamily jobFamilyDtoToJobFamily(JobFamilyDto jobFamilyDto);

	JobFamilyDto jobFamilyToJobFamilyDto(JobFamily jobFamily);

	EmployeeProgression employeeProgressionDtoToEmployeeProgression(EmployeeProgressionsDto employeeProgressionsDto);

	EmployeePersonalInfo employeePersonalInfoDtoToEmployeePersonalInfo(EmployeePersonalInfoDto employeePersonalInfoDto);

	EmployeePersonalInfoDto employeePersonalInfoToEmployeePersonalInfoDto(EmployeePersonalInfo employeePersonalInfo);

	List<EmployeeEmergencyDto> employeeEmergencyToemployeeEmergencyDTo(List<EmployeeEmergency> employeeEmergency);

	@Mapping(target = "email", source = "user.email")
	@Mapping(target = "isActive", source = "user.isActive")
	@Mapping(target = "teamResponseDto", ignore = true)
	@Mapping(target = "jobFamily", ignore = true)
	@Mapping(target = "managers", ignore = true)
	EmployeeAllDataExportResponseDto employeeToEmployeeAllDataExportResponseDto(Employee employee);

	@Mapping(target = "email", source = "user.email")
	@Mapping(target = "isActive", source = "user.isActive")
	@Mapping(target = "managers", source = "employeeManagers")
	EmployeeDetailedResponseDto employeeToEmployeeDetailedResponseDto(Employee employee);

	EmployeePeriodResponseDto employeePeriodToEmployeePeriodResponseDto(EmployeePeriod employeePeriod);

	EmployeeEducation employeeEducationToEmployeeEducation(EmployeeEducationDto employeeEducationDto);

	EmployeeVisa employeeVisaDtoToEmployeeVisa(EmploymentVisaDto visa);

	EmployeeFamily employeeFamilyDtoToEmployeeFamily(EmployeeFamilyDto employeeFamilyDto);

	@Mapping(target = "email", source = "user.email")
	@Mapping(target = "isActive", source = "user.isActive")
	@Mapping(target = "teamResponseDto", ignore = true)
	@Mapping(target = "jobFamily", ignore = true)
	@Mapping(target = "managers", ignore = true)
	EmployeeDataExportResponseDto employeeToEmployeeDataExportResponseDto(Employee employee);

	List<EmployeeResponseDto> employeeListToEmployeeResponseDtoList(List<Employee> employee);

	EmployeeJobFamilyDto jobFamilyToEmployeeJobFamilyDto(JobFamily jobFamily);

	@Mapping(target = "isSuperAdmin", source = "isSuperAdmin")
	@Mapping(target = "okrRole", source = "okrRole")
	EmployeeRoleResponseDto employeeRoleToEmployeeRoleResponseDto(EmployeeRole employeeRole);

	@Mapping(target = "user.email", source = "employeeBulkDto.workEmail")
	@Mapping(target = "firstName", source = "employeeBulkDto.firstName")
	@Mapping(target = "employeeTeams", ignore = true)
	@Mapping(target = "joinDate", source = "employeeBulkDto.joinedDate")
	@Mapping(target = "jobFamily", ignore = true)
	@Mapping(target = "jobTitle", ignore = true)
	Employee employeeBulkDtoToEmployee(EmployeeBulkDto employeeBulkDto);

	@Mapping(target = "primaryManager", ignore = true)
	@Mapping(target = "secondaryManager", ignore = true)
	@Mapping(target = "teams", ignore = true)
	@Mapping(target = "joinDate", source = "employeeBulkDto.joinedDate")
	@Mapping(target = "employeeEmergency", ignore = true)
	@Mapping(target = "employeePersonalInfo.birthDate", dateFormat = "yyyy-MM-dd")
	EmployeeDetailsDto employeeBulkDtoToEmployeeDetailsDto(EmployeeBulkDto employeeBulkDto);

	EmployeeEmergency employeeEmergencyDtoToEmployeeEmergency(EmployeeEmergencyDto employeeEmergency);

	ModuleRoleRestriction roleRestrictionRequestDtoToRestrictRole(
			ModuleRoleRestrictionRequestDto moduleRoleRestrictionRequestDto);

	ModuleRoleRestrictionResponseDto restrictRoleToRestrictRoleResponseDto(ModuleRoleRestriction restrictedRole);

	List<EmployeeDetailedResponseDto> employeeListToEmployeeDetailedResponseDtoList(List<Employee> employees);

	EmployeeLeaveEntitlementsDto employeeLeaveEntitlementTeamJobRoleToEmployeeLeaveEntitlementsDto(
			EmployeeLeaveEntitlementReportExportDto etj);

	List<ManagerSummarizedTeamResponseDto> managerTeamsToManagerTeamCountTeamResponseDto(
			List<Team> managerLeadingTeams);

	@Mapping(target = "jobFamily", source = "jobFamily.name")
	@Mapping(target = "jobTitle", source = "jobTitle.name")
	EmployeeSignInResponseDto employeeToEmployeeSignInResponseDto(Employee employee);

	EmployeeBasicDetailsResponseDto employeeToEmployeeBasicDetailsResponseDto(Employee employee);

	List<HolidayBasicDetailsResponseDto> holidaysToHolidayBasicDetailsResponseDtos(List<Holiday> holidays);

	JobTitleDto jobTitleToJobTitleDto(JobTitle jobTitle);

	List<EmployeeSummarizedResponseDto> employeeListToEmployeeSummarizedResponseDto(List<Employee> employee);

	List<TeamDetailResponseDto> teamToTeamDetailResponseDto(List<Team> team);

	List<TeamBasicDetailsResponseDto> teamListToTeamBasicDetailsResponseDtoList(List<Team> teams);

	TeamBasicDetailsResponseDto teamToTeamBasicDetailsResponseDto(Team team);

	CreateEmployeeResponseDto employeeToCreateEmployeeResponseDto(Employee employee);

	@Mapping(source = "familyId", target = "familyId")
	@Mapping(source = "firstName", target = "firstName")
	@Mapping(source = "lastName", target = "lastName")
	@Mapping(source = "gender", target = "gender")
	@Mapping(source = "familyRelationship", target = "relationship")
	@Mapping(source = "birthDate", target = "dateOfBirth")
	@Mapping(source = "parentName", target = "parentName")
	EmployeePersonalFamilyDetailsDto employeeFamilyToFamilyDetailsDto(EmployeeFamily family);

	@Mapping(source = "educationId", target = "educationId")
	@Mapping(source = "institution", target = "institutionName")
	@Mapping(source = "degree", target = "degree")
	@Mapping(source = "specialization", target = "major")
	@Mapping(source = "startDate", target = "startDate")
	@Mapping(source = "endDate", target = "endDate")
	EmployeePersonalEducationalDetailsDto employeeEducationToEducationalDetailsDto(EmployeeEducation education);

	@Mapping(source = "name", target = "name")
	@Mapping(source = "emergencyRelationship", target = "relationship")
	EmployeeEmergencyContactDetailsDto employeeEmergencyToEmergencyContactDto(EmployeeEmergency emergency);

	@Mapping(source = "progressionId", target = "progressionId")
	@Mapping(source = "employmentType", target = "employmentType")
	@Mapping(source = "jobFamilyId", target = "jobFamilyId")
	@Mapping(source = "jobTitleId", target = "jobTitleId")
	@Mapping(source = "startDate", target = "startDate")
	@Mapping(source = "endDate", target = "endDate")
	@Mapping(source = "isCurrent", target = "isCurrentEmployment")
	EmployeeEmploymentCareerProgressionDetailsDto employeeProgressionToCareerProgressionDto(
			EmployeeProgression progression);

	@Mapping(source = "visaId", target = "visaId")
	@Mapping(source = "visaType", target = "visaType")
	@Mapping(source = "issuingCountry", target = "issuingCountry")
	@Mapping(source = "issuedDate", target = "issuedDate")
	@Mapping(source = "expirationDate", target = "expiryDate")
	EmployeeEmploymentVisaDetailsDto employeeVisaToVisaDetailsDto(EmployeeVisa visa);

	@Mapping(source = "manager.employeeId", target = "employeeId")
	@Mapping(source = "manager.firstName", target = "firstName")
	@Mapping(source = "manager.lastName", target = "lastName")
	@Mapping(source = "manager.authPic", target = "authPic")
	EmployeeEmploymentBasicDetailsManagerDetailsDto employeeManagerToManagerDetailsDto(EmployeeManager managerRel);

	@Mapping(source = "team.teamId", target = "team.teamId")
	@Mapping(source = "team.teamName", target = "team.teamName")
	@Mapping(source = "isSupervisor", target = "team.isSupervisor")
	TeamEmployeeResponseDto employeeTeamToEmployeeTeamDto(EmployeeTeam employeeTeam);

	// DTO to Entity mappings
	@Mapping(source = "familyId", target = "familyId")
	@Mapping(source = "firstName", target = "firstName")
	@Mapping(source = "lastName", target = "lastName")
	@Mapping(source = "gender", target = "gender")
	@Mapping(source = "relationship", target = "familyRelationship")
	@Mapping(source = "dateOfBirth", target = "birthDate")
	@Mapping(source = "parentName", target = "parentName")
	EmployeeFamily familyDetailsDtoToEmployeeFamily(EmployeePersonalFamilyDetailsDto dto);

	@Mapping(source = "educationId", target = "educationId")
	@Mapping(source = "institutionName", target = "institution")
	@Mapping(source = "degree", target = "degree")
	@Mapping(source = "major", target = "specialization")
	@Mapping(source = "startDate", target = "startDate")
	@Mapping(source = "endDate", target = "endDate")
	EmployeeEducation educationalDetailsDtoToEmployeeEducation(EmployeePersonalEducationalDetailsDto dto);

	@Mapping(source = "name", target = "name")
	@Mapping(source = "relationship", target = "emergencyRelationship")
	@Mapping(source = "contactNo", target = "contactNo")
	EmployeeEmergency emergencyContactDtoToEmployeeEmergency(EmployeeEmergencyContactDetailsDto dto);

	@Mapping(source = "progressionId", target = "progressionId")
	@Mapping(source = "employmentType", target = "employmentType")
	@Mapping(source = "jobFamilyId", target = "jobFamilyId")
	@Mapping(source = "jobTitleId", target = "jobTitleId")
	@Mapping(source = "startDate", target = "startDate")
	@Mapping(source = "endDate", target = "endDate")
	@Mapping(source = "isCurrentEmployment", target = "isCurrent")
	EmployeeProgression employeeProgressionDtoToEmployeeProgression(EmployeeEmploymentCareerProgressionDetailsDto dto);

	@Mapping(source = "visaId", target = "visaId")
	@Mapping(source = "visaType", target = "visaType")
	@Mapping(source = "issuingCountry", target = "issuingCountry")
	@Mapping(source = "issuedDate", target = "issuedDate")
	@Mapping(source = "expiryDate", target = "expirationDate")
	EmployeeVisa visaDetailsDtoToEmployeeVisa(EmployeeEmploymentVisaDetailsDto dto);

}
