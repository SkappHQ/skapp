package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.model.BillableRate;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import com.skapp.enterprise.invoice.payload.request.invoice.TeamMemberBillableRateUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.response.ProjectUsersResponseDto;
import com.skapp.enterprise.invoice.repository.BillableRateDao;
import com.skapp.enterprise.invoice.service.BillableRateService;
import com.skapp.enterprise.invoice.type.BillableFrequency;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillableRateServiceImpl implements BillableRateService {

	private final BillableRateDao billableRateDao;

	private final EmployeeDao employeeDao;

	@Override
	public List<BillableRate> createProjectMemberBillableRateData(Project customerProject,
			List<ProjectUsersResponseDto> projectUsersResponseDto, ProjectMemberFilterDto projectMemberFilterDto) {

		List<BillableRate> existingMemberBillableRateData = billableRateDao
			.findByProject_IdAndIsActive(customerProject.getId(), true);

		HashMap<String, List<ProjectUsersResponseDto>> categorizedMemberData = categorizeMembersByStatus(
				projectUsersResponseDto, existingMemberBillableRateData);

		if (categorizedMemberData.containsKey(InvoiceCommonConstant.TEAM_MEMBER_ADDITION)) {
			billableRateDao.saveAll(createBillableRateEntities(customerProject,
					categorizedMemberData.get(InvoiceCommonConstant.TEAM_MEMBER_ADDITION)));
		}

		List<Long> inactiveMemberIds = findInactiveMembers(projectUsersResponseDto, existingMemberBillableRateData);

		if (!inactiveMemberIds.isEmpty()) {
			markBillableRatesInactive(inactiveMemberIds);
		}

		return billableRateDao.findAllProjectTeamMembers(projectMemberFilterDto);
	}

	@Override
	public List<BillableRate> updateTeamMemberBillableRates(Project project,
			List<TeamMemberBillableRateUpdateRequestDto> teamMemberBillableRateUpdateRequestDtos) {

		List<BillableRate> updatedBillableRates = new ArrayList<>();

		List<BillableRate> existingBillableRates = billableRateDao.findByProject_IdAndIsActive(project.getId(), true);

		teamMemberBillableRateUpdateRequestDtos.forEach(updateRequest -> {
			existingBillableRates.stream()
				.filter(existingRate -> Objects.equals(existingRate.getId(), updateRequest.getId()))
				.findFirst()
				.ifPresent(existingRate -> {
					if (updateRequest.getBillableRate() != null) {
						existingRate.setBillableRate(updateRequest.getBillableRate());
					}

					if (updateRequest.getBillableFrequency() != null) {
						existingRate.setBillableFrequency(updateRequest.getBillableFrequency());
					}

					updatedBillableRates.add(existingRate);
				});
		});

		return billableRateDao.saveAll(updatedBillableRates);
	}

	private HashMap<String, List<ProjectUsersResponseDto>> categorizeMembersByStatus(
			List<ProjectUsersResponseDto> projectUsersResponseDtos, List<BillableRate> memberBillableRateData) {

		HashMap<String, List<ProjectUsersResponseDto>> categorizedMembers = new HashMap<>();

		// Map employee IDs from BillableRate for quick lookup
		Set<Long> existingEmployeeIds = memberBillableRateData.stream()
			.map(rate -> rate.getEmployee().getEmployeeId())
			.collect(Collectors.toSet());

		// Categorize as Existing or ADD
		List<ProjectUsersResponseDto> existingTeamMembers = projectUsersResponseDtos.stream()
			.filter(dto -> existingEmployeeIds.contains(dto.getUserId()))
			.toList();

		List<ProjectUsersResponseDto> addedTeamMembers = projectUsersResponseDtos.stream()
			.filter(dto -> !existingEmployeeIds.contains(dto.getUserId()))
			.toList();

		categorizedMembers.put(InvoiceCommonConstant.TEAM_MEMBER_EXISTING, existingTeamMembers);
		categorizedMembers.put(InvoiceCommonConstant.TEAM_MEMBER_ADDITION, addedTeamMembers);

		return categorizedMembers;
	}

	private List<BillableRate> createBillableRateEntities(Project customerProject,
			List<ProjectUsersResponseDto> projectUsers) {

		List<Long> userIds = projectUsers.stream().map(ProjectUsersResponseDto::getUserId).toList();

		List<Employee> employeeList = employeeDao.findAllById(userIds);

		return employeeList.stream()
			.flatMap(employee -> projectUsers.stream()
				.filter(user -> user.getUserId().equals(employee.getEmployeeId()))
				.map(filteredUser -> {
					BillableRate billableRate = new BillableRate();
					billableRate.setProject(customerProject);
					billableRate.setEmployee(employee);
					billableRate.setBillableRate(InvoiceCommonConstant.DEFAULT_BILLABLE_RATE);
					billableRate.setBillableFrequency(BillableFrequency.PER_DAY);
					billableRate.setIsActive(true);
					return billableRate;
				}))
			.toList();

	}

	private List<Long> findInactiveMembers(List<ProjectUsersResponseDto> projectUsersResponseDtos,
			List<BillableRate> memberBillableRateData) {

		// Identify removed team members
		Set<Long> projectUserIds = projectUsersResponseDtos.stream()
			.map(ProjectUsersResponseDto::getUserId)
			.collect(Collectors.toSet());

		return memberBillableRateData.stream()
			.filter(rate -> !projectUserIds.contains(rate.getEmployee().getEmployeeId()))
			.map(BillableRate::getId)
			.toList();
	}

	private void markBillableRatesInactive(List<Long> billableRateIds) {
		List<BillableRate> billableRates = billableRateDao.findAllById(billableRateIds);
		if (billableRates.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_BILLABLE_RATE_NOT_FOUND);
		}
		billableRates.forEach(rate -> rate.setIsActive(false));
		billableRateDao.saveAll(billableRates);
	}

}
