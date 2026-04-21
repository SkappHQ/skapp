package com.skapp.community.peopleplanner.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeEmergency;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePeriod;
import com.skapp.community.peopleplanner.model.EmployeePersonalInfo;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.response.EmployeeTeamDto;
import com.skapp.community.peopleplanner.payload.response.export.EmergencyContactExportDto;
import com.skapp.community.peopleplanner.payload.response.export.EmployeeDataExportDto;
import com.skapp.community.peopleplanner.payload.response.export.EmployeeExtraInfoExportDto;
import com.skapp.community.peopleplanner.payload.response.export.EmployeePersonalInfoExportDto;
import com.skapp.community.peopleplanner.payload.response.export.EmployeeSocialMediaExportDto;
import com.skapp.community.peopleplanner.payload.response.export.JobFamilyExportDto;
import com.skapp.community.peopleplanner.payload.response.export.JobTitleExportDto;
import com.skapp.community.peopleplanner.payload.response.export.ManagerExportDto;
import com.skapp.community.peopleplanner.payload.response.export.ProbationPeriodExportDto;
import com.skapp.community.peopleplanner.payload.response.export.TeamExportDto;
import com.skapp.community.peopleplanner.repository.EmployeePeriodDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeExportMapperService {

	private final EmployeePeriodDao employeePeriodDao;

	private static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

	public List<EmployeeDataExportDto> mapToExportDtos(List<Employee> employees, List<EmployeeTeamDto> teamList,
			List<Long> employeeIds) {
		log.info("Mapping {} employees to export DTOs", employees.size());

		List<EmployeeDataExportDto> exportDtos = new ArrayList<>();

		for (Employee employee : employees) {
			EmployeeDataExportDto dto = new EmployeeDataExportDto();

			// Basic fields
			dto.setEmployeeId(employee.getEmployeeId() != null ? employee.getEmployeeId().toString() : null);
			dto.setEmployeeNumber(employee.getIdentificationNo());
			dto.setFirstName(employee.getFirstName());
			dto.setMiddleName(employee.getMiddleName());
			dto.setLastName(employee.getLastName());
			dto.setEmail(employee.getUser() != null ? employee.getUser().getEmail() : null);
			dto.setGender(employee.getGender() != null ? employee.getGender().toString() : null);
			dto.setPersonalEmail(employee.getPersonalEmail());
			dto.setPhone(employee.getPhone());
			dto.setDesignation(employee.getDesignation());
			dto.setIdentificationNo(employee.getPersonalInfo() != null ? employee.getPersonalInfo().getNin() : null);
			dto.setAddressLine1(employee.getAddressLine1());
			dto.setAddressLine2(employee.getAddressLine2());
			dto.setCountry(employee.getCountry());
			dto.setIsActive(employee.getUser() != null ? employee.getUser().getIsActive() : false);
			dto.setTimeZone(employee.getTimeZone());
			dto.setWorkHourCapacity(employee.getWorkHourCapacity());
			dto.setJoinDate(formatLocalDate(employee.getJoinDate()));
			dto.setEmploymentType(
					employee.getEmploymentType() != null ? employee.getEmploymentType().toString() : null);
			dto.setEmploymentAllocation(
					employee.getEmploymentAllocation() != null ? employee.getEmploymentAllocation().toString() : null);
			dto.setEeoJobCategory(employee.getEeo() != null ? employee.getEeo().toString() : null);

			// Job Title
			if (employee.getJobTitle() != null) {
				JobTitleExportDto jobTitleDto = new JobTitleExportDto();
				jobTitleDto.setJobTitleId(employee.getJobTitle().getJobTitleId());
				jobTitleDto.setName(employee.getJobTitle().getName());
				dto.setJobTitle(jobTitleDto);
			}

			// Job Family
			if (employee.getJobFamily() != null) {
				JobFamilyExportDto jobFamilyDto = new JobFamilyExportDto();
				jobFamilyDto.setTitle(employee.getJobFamily().getName()); // Using name as
																			// title
				jobFamilyDto.setName(employee.getJobFamily().getName());
				dto.setJobFamily(jobFamilyDto);
			}

			// Personal Info
			dto.setEmployeePersonalInfoDto(mapPersonalInfo(employee.getPersonalInfo()));

			// Teams
			List<Team> teams = teamList.stream()
				.filter(e -> e.getEmployeeId().equals(employee.getEmployeeId()))
				.map(EmployeeTeamDto::getTeam)
				.toList();
			dto.setTeamResponseDto(mapTeams(teams));

			// Primary Supervisor
			Optional<EmployeeManager> primaryManager = employee.getEmployeeManagers()
				.stream()
				.filter(EmployeeManager::getIsPrimaryManager)
				.findFirst();

			if (primaryManager.isPresent() && primaryManager.get().getManager() != null) {
				ManagerExportDto managerDto = new ManagerExportDto();
				managerDto.setEmail(primaryManager.get().getManager().getUser() != null
						? primaryManager.get().getManager().getUser().getEmail() : null);
				dto.setPrimarySupervisor(managerDto);
			}

			// Probation Period
			Optional<EmployeePeriod> period = employeePeriodDao
				.findEmployeePeriodByEmployee_EmployeeIdAndIsActiveTrue(employee.getEmployeeId());
			dto.setProbationPeriod(period.map(this::mapProbationPeriod).orElse(null));

			// Emergency Contacts
			dto.setEmployeeEmergencyDto(mapEmergencyContacts(employee.getEmployeeEmergencies()));

			exportDtos.add(dto);
		}

		log.info("Successfully mapped {} employees to export DTOs", exportDtos.size());
		return exportDtos;
	}

	private EmployeePersonalInfoExportDto mapPersonalInfo(EmployeePersonalInfo personalInfo) {
		if (personalInfo == null) {
			return null;
		}

		EmployeePersonalInfoExportDto dto = new EmployeePersonalInfoExportDto();
		dto.setBirthDate(formatLocalDate(personalInfo.getBirthDate()));
		dto.setBloodGroup(personalInfo.getBloodGroup() != null ? personalInfo.getBloodGroup().toString() : null);
		dto.setNationality(personalInfo.getNationality());
		dto.setMaritalStatus(
				personalInfo.getMaritalStatus() != null ? personalInfo.getMaritalStatus().toString() : null);
		dto.setCity(personalInfo.getCity());
		dto.setState(personalInfo.getState());
		dto.setPostalCode(personalInfo.getPostalCode());
		dto.setEthnicity(personalInfo.getEthnicity() != null ? personalInfo.getEthnicity().toString() : null);
		dto.setNin(personalInfo.getNin());
		dto.setPassportNo(personalInfo.getPassportNo());
		dto.setSsn(personalInfo.getSsn());

		// Social Media Details
		dto.setSocialMediaDetails(mapSocialMedia(personalInfo.getSocialMediaDetails()));

		// Extra Info
		dto.setExtraInfo(mapExtraInfo(personalInfo.getExtraInfo()));

		return dto;
	}

	private EmployeeSocialMediaExportDto mapSocialMedia(JsonNode socialMediaDetails) {
		if (socialMediaDetails == null) {
			return null;
		}

		EmployeeSocialMediaExportDto dto = new EmployeeSocialMediaExportDto();
		dto.setFacebook(getJsonField(socialMediaDetails, "facebook"));
		dto.setInstagram(getJsonField(socialMediaDetails, "instagram"));
		dto.setLinkedIn(getJsonField(socialMediaDetails, "linkedIn"));
		dto.setX(getJsonField(socialMediaDetails, "x"));

		return dto;
	}

	private EmployeeExtraInfoExportDto mapExtraInfo(JsonNode extraInfo) {
		if (extraInfo == null) {
			return null;
		}

		EmployeeExtraInfoExportDto dto = new EmployeeExtraInfoExportDto();
		dto.setAllergies(getJsonField(extraInfo, "allergies"));
		dto.setDietaryRestrictions(getJsonField(extraInfo, "dietaryRestrictions"));

		String tShirtSize = getJsonField(extraInfo, "tShirtSize");
		if (tShirtSize == null) {
			tShirtSize = getJsonField(extraInfo, "tshirtSize");
		}
		dto.setTShirtSize(tShirtSize);

		return dto;
	}

	private List<TeamExportDto> mapTeams(List<Team> teams) {
		if (teams == null || teams.isEmpty()) {
			return null;
		}

		return teams.stream().map(team -> {
			TeamExportDto dto = new TeamExportDto();
			dto.setTeamId(team.getTeamId());
			dto.setTeamName(team.getTeamName());
			return dto;
		}).collect(Collectors.toList());
	}

	private ProbationPeriodExportDto mapProbationPeriod(EmployeePeriod employeePeriod) {
		if (employeePeriod == null) {
			return null;
		}

		ProbationPeriodExportDto dto = new ProbationPeriodExportDto();
		dto.setStartDate(formatLocalDate(employeePeriod.getStartDate()));
		dto.setEndDate(formatLocalDate(employeePeriod.getEndDate()));

		return dto;
	}

	private List<EmergencyContactExportDto> mapEmergencyContacts(List<EmployeeEmergency> emergencyContacts) {
		if (emergencyContacts == null || emergencyContacts.isEmpty()) {
			return null;
		}

		return emergencyContacts.stream().map(contact -> {
			EmergencyContactExportDto dto = new EmergencyContactExportDto();
			dto.setName(contact.getName());
			dto.setEmergencyRelationship(
					contact.getEmergencyRelationship() != null ? contact.getEmergencyRelationship().toString() : null);
			dto.setContactNo(contact.getContactNo());
			dto.setIsPrimary(contact.getIsPrimary());
			return dto;
		}).collect(Collectors.toList());
	}

	private String getJsonField(JsonNode node, String fieldName) {
		if (node == null) {
			return null;
		}
		JsonNode fieldNode = node.get(fieldName);
		return fieldNode != null && !fieldNode.isNull() ? fieldNode.asText() : null;
	}

	private String formatLocalDate(LocalDate date) {
		return date != null ? date.format(ISO_DATE_FORMATTER) : null;
	}

}
