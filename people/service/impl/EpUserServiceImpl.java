package com.skapp.enterprise.people.service.impl;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.payload.request.AdditionalDetailsDto;
import com.skapp.enterprise.common.payload.request.AuthenticationDetailsDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.people.service.EpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Primary
@RequiredArgsConstructor
public class EpUserServiceImpl implements EpUserService {

	private final EmployeeDao employeeDao;

	@Override
	public Tier getCurrentUserTier() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || authentication.getDetails() == null)
			return Tier.FREE;

		if (!(authentication.getDetails() instanceof AuthenticationDetailsDto authenticationDetails))
			return Tier.FREE;

		AdditionalDetailsDto additionalDetails = authenticationDetails.getAdditionalDetails();

		if (additionalDetails == null || additionalDetails.getTier() == null)
			return Tier.FREE;

		try {
			return Tier.valueOf(additionalDetails.getTier());
		}
		catch (IllegalArgumentException e) {
			return Tier.FREE;
		}
	}

	@Override
	public TenantStatus getCurrentUserTenantStatus() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		AuthenticationDetailsDto authenticationDetails = (AuthenticationDetailsDto) authentication.getDetails();
		AdditionalDetailsDto additionalDetails = authenticationDetails.getAdditionalDetails();

		if (additionalDetails != null && additionalDetails.getTenantStatus() != null) {
			return TenantStatus.valueOf(additionalDetails.getTenantStatus());
		}

		return TenantStatus.ACTIVE;
	}

	@Override
	@Transactional(readOnly = true)
	public List<EpUserResponseDto> getUsersByIdsOrSearch(List<Long> userIds, String search) {
		Set<AccountStatus> activeStatuses = Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING);

		List<Employee> employees = employeeDao.findEmployees(userIds, search, activeStatuses);

		return employees.stream().map(this::mapEmployeeToUserDto).collect(Collectors.toList());
	}

	private EpUserResponseDto mapEmployeeToUserDto(Employee employee) {
		EpUserResponseDto dto = new EpUserResponseDto();
		dto.setUserId(employee.getEmployeeId().toString());
		dto.setFirstName(employee.getFirstName());
		dto.setLastName(employee.getLastName());

		if (employee.getUser() != null) {
			dto.setEmail(employee.getUser().getEmail());
			dto.setLoginMethod(employee.getUser().getLoginMethod());
		}

		dto.setAuthPic(employee.getAuthPic());
		return dto;
	}

}
