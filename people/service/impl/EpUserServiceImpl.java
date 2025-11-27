package com.skapp.enterprise.people.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.payload.request.AdditionalDetailsDto;
import com.skapp.enterprise.common.payload.request.AuthenticationDetailsDto;
import com.skapp.enterprise.common.payload.response.EpUserAuthPicResponseDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.common.type.AmazonS3ActionType;
import com.skapp.enterprise.common.type.EpCacheKeys;
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
import java.util.function.Function;

@Service
@Primary
@RequiredArgsConstructor
public class EpUserServiceImpl implements EpUserService {

	private final EmployeeDao employeeDao;

	private final CacheService cacheService;

	private final ObjectMapper objectMapper;

	private final AmazonS3Service amazonS3Service;

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
		Set<AccountStatus> activeStatuses = Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING,
				AccountStatus.TERMINATED);

		List<Employee> employees = employeeDao.findEmployees(userIds, search, activeStatuses);

		List<EpUserResponseDto> mappedUsers = employees.stream().map(this::mapEmployeeToUserDto).toList();

		try {
			String usersJson = objectMapper.writeValueAsString(mappedUsers);
			EpCacheKeys cacheKey = EpCacheKeys.TENANT_ALL_USERS_CACHE_KEY;
			cacheService.put(cacheKey.getKey(), usersJson, cacheKey.getTtl(), cacheKey.getTimeUnit());
		}
		catch (JsonProcessingException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED);
		}

		return mappedUsers;
	}

	@Override
	public List<Employee> getUsersByIds(List<Long> employeeIds) {
		Set<AccountStatus> activeStatuses = Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING,
				AccountStatus.TERMINATED);

		return employeeDao.findEmployees(employeeIds, null, activeStatuses);

	}

	@Override
	public List<EpUserAuthPicResponseDto> getUserAuthPicsByIdsOrSearch(List<Long> userIds, String search) {
		Set<AccountStatus> activeStatuses = Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING);

		List<Employee> employees = employeeDao.findEmployees(userIds, search, activeStatuses);

		if (employees.isEmpty()) {
			return List.of();
		}

		List<EpUserAuthPicResponseDto> mappedUserAuthPics;

		LoginMethod loginMethod = employees.getFirst().getUser().getLoginMethod();
		Function<Employee, EpUserAuthPicResponseDto> mapper = (loginMethod == LoginMethod.CREDENTIALS)
				? this::mapEmployeeToUserAuthPicDtoWithSignedUrl : this::mapEmployeeToUserAuthPicDto;

		mappedUserAuthPics = employees.stream().map(mapper).toList();

		try {
			String usersJson = objectMapper.writeValueAsString(mappedUserAuthPics);
			EpCacheKeys cacheKey = EpCacheKeys.TENANT_ALL_USERS_AUTH_PICS_CACHE_KEY;
			cacheService.put(cacheKey.getKey(), usersJson, cacheKey.getTtl(), cacheKey.getTimeUnit());
		}
		catch (JsonProcessingException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED);
		}

		return mappedUserAuthPics;
	}

	@Override
	public EpUserResponseDto mapEmployeeToUserDto(Employee employee) {
		EpUserResponseDto dto = new EpUserResponseDto();
		dto.setUserId(employee.getEmployeeId().toString());
		dto.setFirstName(employee.getFirstName());
		dto.setLastName(employee.getLastName());
		dto.setAccountStatus(employee.getAccountStatus());

		if (employee.getUser() != null) {
			dto.setEmail(employee.getUser().getEmail());
			dto.setLoginMethod(employee.getUser().getLoginMethod());
			dto.setIsGuest(employee.getUser().getIsGuest());
		}

		dto.setAuthPic(employee.getAuthPic());
		return dto;
	}

	private EpUserAuthPicResponseDto mapEmployeeToUserAuthPicDto(Employee employee) {
		EpUserAuthPicResponseDto dto = new EpUserAuthPicResponseDto();
		dto.setUserId(employee.getEmployeeId().toString());
		dto.setAuthPic(employee.getAuthPic());
		return dto;
	}

	private EpUserAuthPicResponseDto mapEmployeeToUserAuthPicDtoWithSignedUrl(Employee employee) {
		EpUserAuthPicResponseDto dto = new EpUserAuthPicResponseDto();
		dto.setUserId(employee.getEmployeeId().toString());
		dto.setAuthPic(generateAuthPicUrl(employee.getAuthPic()));
		return dto;
	}

	private String generateAuthPicUrl(String authPicPath) {
		if (authPicPath == null || authPicPath.isEmpty()) {
			return "";
		}
		authPicPath = EpCommonConstants.S3_PROFILE_PIC_THUMBNAIL_PATH + authPicPath;
		return amazonS3Service.generateSignedUrl(AmazonS3ActionType.DOWNLOAD, authPicPath, "",
				EpCommonConstants.CACHED_S3_SIGNED_URL_DURATION);
	}

}
