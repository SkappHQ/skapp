package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyAccrualDetailDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyUpdateRequestDto;
import com.skapp.community.leaveplanner.payload.response.LeavePolicyResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeResponseDto;
import com.skapp.community.leaveplanner.repository.LeavePolicyDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Leave Policy Service Unit Tests")
class LeavePolicyServiceImplUnitTest {

	private LeavePolicyServiceImpl leavePolicyService;

	@Mock
	private LeavePolicyDao leavePolicyDao;

	@Mock
	private PolicyLeaveTypeDao policyLeaveTypeDao;

	@Mock
	private LeaveMapper leaveMapper;

	@BeforeEach
	void setup() {
		MessageUtil messageUtil = mock(MessageUtil.class);
		lenient().when(messageUtil.getMessage(anyString())).thenReturn("error");
		installMessageUtil(messageUtil);
		leavePolicyService = new LeavePolicyServiceImpl(leavePolicyDao, policyLeaveTypeDao, leaveMapper);
	}

	@AfterEach
	void tearDown() {
		installMessageUtil(null);
	}

	/**
	 * ModuleException and EntityNotFoundException resolve their messages through a static
	 * MessageUtil that Spring wires at startup. These are plain unit tests with no
	 * context, so drive the same injectors with a stub and reset them afterwards.
	 */
	private static void installMessageUtil(MessageUtil messageUtil) {
		ApplicationContext applicationContext = mock(ApplicationContext.class);
		when(applicationContext.getBean(MessageUtil.class)).thenReturn(messageUtil);
		new ModuleException.MessageUtilInjector().setApplicationContext(applicationContext);
		new EntityNotFoundException.MessageUtilInjector().setApplicationContext(applicationContext);
	}

	private PolicyLeaveType buildLeaveType() {
		PolicyLeaveType leaveType = new PolicyLeaveType();
		leaveType.setTypeId(1L);
		leaveType.setName("Annual");
		return leaveType;
	}

	private LeavePolicyAccrualDetailDto buildAccrualDetail() {
		LeavePolicyAccrualDetailDto accrual = new LeavePolicyAccrualDetailDto();
		accrual.setAccrualDays(1.5F);
		accrual.setFrequency(AccrualFrequency.MONTHLY);
		return accrual;
	}

	private LeavePolicyRequestDto buildAccrualRequest() {
		LeavePolicyRequestDto dto = new LeavePolicyRequestDto();
		dto.setName("Annual Policy");
		dto.setLeaveTypeId(1L);
		dto.setPolicyType(PolicyType.ACCRUAL);
		dto.setAccrual(buildAccrualDetail());
		return dto;
	}

	private void mockActiveLeaveType() {
		when(policyLeaveTypeDao.findByTypeIdAndIsActive(1L, true)).thenReturn(Optional.of(buildLeaveType()));
	}

	private void mockSaveAndMap() {
		when(leavePolicyDao.save(any(LeavePolicy.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(leaveMapper.leavePolicyToLeavePolicyResponseDto(any(LeavePolicy.class)))
			.thenReturn(new LeavePolicyResponseDto());
	}

	private LeavePolicy captureSavedPolicy() {
		ArgumentCaptor<LeavePolicy> captor = ArgumentCaptor.forClass(LeavePolicy.class);
		verify(leavePolicyDao).save(captor.capture());
		return captor.getValue();
	}

	@Nested
	@DisplayName("Add Leave Policy - Success Paths")
	class AddLeavePolicySuccessTests {

		@Test
		@DisplayName("Creates an accrual policy with all accrual fields applied")
		void addLeavePolicy_AccrualPolicy_SavesPolicyWithAccrualDetail() {
			mockActiveLeaveType();
			when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId("Annual Policy", 1L)).thenReturn(false);
			mockSaveAndMap();

			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.setName("Annual Policy");
			dto.getAccrual().setWaitingPeriodDays(30);
			dto.getAccrual().setAccrualCapDays(20F);
			dto.getAccrual().setIsCarryoverEnabled(true);
			dto.getAccrual().setCarryoverDate("04-01");
			dto.getAccrual().setMaxCarryoverDays(10F);
			dto.getAccrual().setFirstAccrual(FirstAccrualType.FULL);
			dto.getAccrual().setAccrualTiming(AccrualTiming.PERIOD_START);

			ResponseEntityDto response = leavePolicyService.addLeavePolicy(dto);

			assertEquals("successful", response.getStatus());
			LeavePolicy saved = captureSavedPolicy();
			assertEquals("Annual Policy", saved.getName());
			assertEquals(PolicyType.ACCRUAL, saved.getPolicyType());
			assertEquals(LeavePolicyStatus.ACTIVE, saved.getStatus());
			assertEquals(1.5F, saved.getAccrualDays());
			assertEquals(AccrualFrequency.MONTHLY, saved.getFrequency());
			assertEquals(30, saved.getWaitingPeriodDays());
			assertEquals(20F, saved.getAccrualCapDays());
			assertEquals(true, saved.getIsCarryoverEnabled());
			assertEquals("04-01", saved.getCarryoverDate());
			assertEquals(10F, saved.getMaxCarryoverDays());
			assertEquals(FirstAccrualType.FULL, saved.getFirstAccrual());
			assertEquals(AccrualTiming.PERIOD_START, saved.getAccrualTiming());
		}

		@Test
		@DisplayName("Creates a flexible policy without applying accrual detail")
		void addLeavePolicy_FlexiblePolicy_SavesPolicyWithoutAccrualDetail() {
			mockActiveLeaveType();
			when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId("Flexible Policy", 1L)).thenReturn(false);
			mockSaveAndMap();

			LeavePolicyRequestDto dto = new LeavePolicyRequestDto();
			dto.setName("Flexible Policy");
			dto.setLeaveTypeId(1L);
			dto.setPolicyType(PolicyType.FLEXIBLE);

			ResponseEntityDto response = leavePolicyService.addLeavePolicy(dto);

			assertEquals("successful", response.getStatus());
			LeavePolicy saved = captureSavedPolicy();
			assertEquals(PolicyType.FLEXIBLE, saved.getPolicyType());
			assertNull(saved.getAccrualDays());
			assertNull(saved.getFrequency());
		}

		@Test
		@DisplayName("Applies default first accrual and accrual timing when not provided")
		void addLeavePolicy_MissingFineTuning_AppliesDefaults() {
			mockActiveLeaveType();
			when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId("Annual Policy", 1L)).thenReturn(false);
			mockSaveAndMap();

			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.getAccrual().setFirstAccrual(null);
			dto.getAccrual().setAccrualTiming(null);

			leavePolicyService.addLeavePolicy(dto);

			LeavePolicy saved = captureSavedPolicy();
			assertEquals(FirstAccrualType.PRORATED, saved.getFirstAccrual());
			assertEquals(AccrualTiming.PERIOD_END, saved.getAccrualTiming());
			assertFalse(saved.getIsCarryoverEnabled());
			assertNull(saved.getCarryoverDate());
		}

		@Test
		@DisplayName("Defaults carryover date to 01-01 when carryover is enabled without a date")
		void addLeavePolicy_CarryoverWithoutDate_DefaultsCarryoverDate() {
			mockActiveLeaveType();
			when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId("Annual Policy", 1L)).thenReturn(false);
			mockSaveAndMap();

			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.getAccrual().setIsCarryoverEnabled(true);

			leavePolicyService.addLeavePolicy(dto);

			assertEquals("01-01", capturedCarryoverDate());
		}

		private String capturedCarryoverDate() {
			return captureSavedPolicy().getCarryoverDate();
		}

	}

	@Nested
	@DisplayName("Add Leave Policy - Required Field Validations")
	class AddLeavePolicyRequiredFieldTests {

		@Test
		@DisplayName("Throws when leave type id is missing")
		void addLeavePolicy_NullLeaveTypeId_ThrowsModuleException() {
			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.setLeaveTypeId(null);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_LEAVE_TYPE_REQUIRED, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when policy type is missing")
		void addLeavePolicy_NullPolicyType_ThrowsModuleException() {
			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.setPolicyType(null);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_POLICY_TYPE_REQUIRED, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when name is missing")
		void addLeavePolicy_NullName_ThrowsModuleException() {
			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.setName(null);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_REQUIRED, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when name is blank")
		void addLeavePolicy_BlankName_ThrowsModuleException() {
			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.setName("   ");

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_REQUIRED, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when name exceeds the maximum length")
		void addLeavePolicy_NameTooLong_ThrowsModuleException() {
			LeavePolicyRequestDto dto = buildAccrualRequest();
			dto.setName("a".repeat(101));

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_MAX_LENGTH_EXCEEDED,
					exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when the leave type does not exist or is inactive")
		void addLeavePolicy_LeaveTypeNotFound_ThrowsEntityNotFoundException() {
			when(policyLeaveTypeDao.findByTypeIdAndIsActive(1L, true)).thenReturn(Optional.empty());

			LeavePolicyRequestDto dto = buildAccrualRequest();

			EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws a conflict when a policy with the same name exists for the leave type")
		void addLeavePolicy_DuplicateName_ThrowsModuleException() {
			mockActiveLeaveType();
			when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId("Annual Policy", 1L)).thenReturn(true);

			LeavePolicyRequestDto dto = buildAccrualRequest();

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS, exception.getMessageKey());
		}

	}

	@Nested
	@DisplayName("Add Leave Policy - Entitlement Setup Validations")
	class AddLeavePolicyEntitlementValidationTests {

		private LeavePolicyRequestDto dto;

		@BeforeEach
		void setupLeaveType() {
			mockActiveLeaveType();
			dto = buildAccrualRequest();
			lenient().when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeId("Annual Policy", 1L))
				.thenReturn(false);
		}

		private void assertThrowsWithKey(LeaveMessageConstant expectedKey) {
			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.addLeavePolicy(dto));
			assertEquals(expectedKey, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when a flexible policy carries accrual configuration")
		void addLeavePolicy_FlexibleWithAccrual_ThrowsModuleException() {
			dto.setPolicyType(PolicyType.FLEXIBLE);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_NOT_ALLOWED);
		}

		@Test
		@DisplayName("Throws when an accrual policy has no accrual configuration")
		void addLeavePolicy_AccrualWithoutConfig_ThrowsModuleException() {
			dto.setAccrual(null);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_REQUIRED);
		}

		@Test
		@DisplayName("Throws when accrual days is below the minimum")
		void addLeavePolicy_AccrualDaysBelowMinimum_ThrowsModuleException() {
			dto.getAccrual().setAccrualDays(0.4F);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_DAYS_INVALID);
		}

		@Test
		@DisplayName("Throws when accrual days exceeds the maximum")
		void addLeavePolicy_AccrualDaysAboveMaximum_ThrowsModuleException() {
			dto.getAccrual().setAccrualDays(365.5F);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_DAYS_INVALID);
		}

		@Test
		@DisplayName("Throws when accrual days is missing")
		void addLeavePolicy_AccrualDaysMissing_ThrowsModuleException() {
			dto.getAccrual().setAccrualDays(null);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_DAYS_INVALID);
		}

		@Test
		@DisplayName("Throws when accrual frequency is missing")
		void addLeavePolicy_FrequencyMissing_ThrowsModuleException() {
			dto.getAccrual().setFrequency(null);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_FREQUENCY_REQUIRED);
		}

		@Test
		@DisplayName("Throws when waiting period days is below one")
		void addLeavePolicy_WaitingPeriodBelowOne_ThrowsModuleException() {
			dto.getAccrual().setWaitingPeriodDays(0);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_WAITING_PERIOD_INVALID);
		}

		@Test
		@DisplayName("Throws when accrual cap days is below one")
		void addLeavePolicy_AccrualCapBelowOne_ThrowsModuleException() {
			dto.getAccrual().setAccrualCapDays(0.5F);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CAP_INVALID);
		}

		@Test
		@DisplayName("Throws when carryover date is not in MM-DD format")
		void addLeavePolicy_InvalidCarryoverDate_ThrowsModuleException() {
			dto.getAccrual().setIsCarryoverEnabled(true);
			dto.getAccrual().setCarryoverDate("13-01");
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_CARRYOVER_DATE_INVALID);
		}

		@Test
		@DisplayName("Throws when max carryover days is out of range")
		void addLeavePolicy_InvalidMaxCarryoverDays_ThrowsModuleException() {
			dto.getAccrual().setIsCarryoverEnabled(true);
			dto.getAccrual().setCarryoverDate("01-01");
			dto.getAccrual().setMaxCarryoverDays(366F);
			assertThrowsWithKey(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_MAX_CARRYOVER_DAYS_INVALID);
		}

	}

	@Nested
	@DisplayName("Get All Leave Policies")
	class GetAllLeavePoliciesTests {

		@Test
		@DisplayName("Throws when page is negative")
		void getAllLeavePolicies_NegativePage_ThrowsModuleException() {
			LeavePolicyFilterDto filterDto = new LeavePolicyFilterDto();
			filterDto.setPage(-1);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.getAllLeavePolicies(filterDto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_PAGE_INVALID, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when size is below one")
		void getAllLeavePolicies_SizeBelowOne_ThrowsModuleException() {
			LeavePolicyFilterDto filterDto = new LeavePolicyFilterDto();
			filterDto.setSize(0);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.getAllLeavePolicies(filterDto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_PAGE_SIZE_INVALID, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when size exceeds the maximum")
		void getAllLeavePolicies_SizeAboveMaximum_ThrowsModuleException() {
			LeavePolicyFilterDto filterDto = new LeavePolicyFilterDto();
			filterDto.setSize(101);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.getAllLeavePolicies(filterDto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_PAGE_SIZE_INVALID, exception.getMessageKey());
		}

		@Test
		@DisplayName("Returns a page dto with mapped results")
		void getAllLeavePolicies_ValidFilter_ReturnsPagedResults() {
			LeavePolicyFilterDto filterDto = new LeavePolicyFilterDto();
			Page<LeavePolicy> page = new PageImpl<>(List.of(new LeavePolicy()), PageRequest.of(0, 20), 1);
			when(leavePolicyDao.findLeavePolicies(any(LeavePolicyFilterDto.class), any(Pageable.class)))
				.thenReturn(page);
			when(leaveMapper.leavePolicyListToLeavePolicyResponseDtoList(anyList()))
				.thenReturn(List.of(new LeavePolicyResponseDto()));

			ResponseEntityDto response = leavePolicyService.getAllLeavePolicies(filterDto);

			assertEquals("successful", response.getStatus());
			PageDto pageDto = (PageDto) response.getResults().get(0);
			assertEquals(1L, pageDto.getTotalItems());
			assertEquals(0, pageDto.getCurrentPage());
			assertEquals(1, pageDto.getTotalPages());
		}

	}

	@Nested
	@DisplayName("Update Leave Policy")
	class UpdateLeavePolicyTests {

		private LeavePolicy buildExistingPolicy() {
			LeavePolicy leavePolicy = new LeavePolicy();
			leavePolicy.setPolicyId(5L);
			leavePolicy.setName("Old Name");
			leavePolicy.setLeaveType(buildLeaveType());
			leavePolicy.setStatus(LeavePolicyStatus.ACTIVE);
			return leavePolicy;
		}

		@Test
		@DisplayName("Throws when the policy does not exist")
		void updateLeavePolicy_PolicyNotFound_ThrowsEntityNotFoundException() {
			when(leavePolicyDao.findById(5L)).thenReturn(Optional.empty());

			LeavePolicyUpdateRequestDto dto = new LeavePolicyUpdateRequestDto();
			dto.setName("Renamed");

			EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
					() -> leavePolicyService.updateLeavePolicy(5L, dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws when the new name is missing")
		void updateLeavePolicy_NullName_ThrowsModuleException() {
			when(leavePolicyDao.findById(5L)).thenReturn(Optional.of(buildExistingPolicy()));

			LeavePolicyUpdateRequestDto dto = new LeavePolicyUpdateRequestDto();

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.updateLeavePolicy(5L, dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_REQUIRED, exception.getMessageKey());
		}

		@Test
		@DisplayName("Throws a conflict when another policy already uses the new name")
		void updateLeavePolicy_DuplicateName_ThrowsModuleException() {
			when(leavePolicyDao.findById(5L)).thenReturn(Optional.of(buildExistingPolicy()));
			when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeIdAndPolicyIdNot("Renamed", 1L, 5L))
				.thenReturn(true);

			LeavePolicyUpdateRequestDto dto = new LeavePolicyUpdateRequestDto();
			dto.setName("Renamed");

			ModuleException exception = assertThrows(ModuleException.class,
					() -> leavePolicyService.updateLeavePolicy(5L, dto));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS, exception.getMessageKey());
		}

		@Test
		@DisplayName("Updates the policy with the new name")
		void updateLeavePolicy_ValidName_UpdatesName() {
			LeavePolicy existing = buildExistingPolicy();
			when(leavePolicyDao.findById(5L)).thenReturn(Optional.of(existing));
			when(leavePolicyDao.existsByNameIgnoreCaseAndLeaveType_TypeIdAndPolicyIdNot("Renamed", 1L, 5L))
				.thenReturn(false);
			when(leavePolicyDao.save(existing)).thenReturn(existing);
			when(leaveMapper.leavePolicyToLeavePolicyResponseDto(existing)).thenReturn(new LeavePolicyResponseDto());

			LeavePolicyUpdateRequestDto dto = new LeavePolicyUpdateRequestDto();
			dto.setName("Renamed");

			ResponseEntityDto response = leavePolicyService.updateLeavePolicy(5L, dto);

			assertEquals("successful", response.getStatus());
			assertEquals("Renamed", existing.getName());
		}

	}

	@Nested
	@DisplayName("Deactivate Leave Policy")
	class DeactivateLeavePolicyTests {

		@Test
		@DisplayName("Throws when the policy does not exist")
		void deactivateLeavePolicy_PolicyNotFound_ThrowsEntityNotFoundException() {
			when(leavePolicyDao.findById(5L)).thenReturn(Optional.empty());

			EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
					() -> leavePolicyService.deactivateLeavePolicy(5L));
			assertEquals(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NOT_FOUND, exception.getMessageKey());
		}

		@Test
		@DisplayName("Marks the policy as inactive")
		void deactivateLeavePolicy_ExistingPolicy_MarksInactive() {
			LeavePolicy existing = new LeavePolicy();
			existing.setPolicyId(5L);
			existing.setStatus(LeavePolicyStatus.ACTIVE);
			when(leavePolicyDao.findById(5L)).thenReturn(Optional.of(existing));
			when(leavePolicyDao.save(existing)).thenReturn(existing);
			when(leaveMapper.leavePolicyToLeavePolicyResponseDto(existing)).thenReturn(new LeavePolicyResponseDto());

			ResponseEntityDto response = leavePolicyService.deactivateLeavePolicy(5L);

			assertEquals("successful", response.getStatus());
			assertEquals(LeavePolicyStatus.INACTIVE, existing.getStatus());
		}

	}

	@Nested
	@DisplayName("Get Policy Leave Types")
	class GetPolicyLeaveTypesTests {

		@Test
		@DisplayName("Returns the active leave types")
		void getPolicyLeaveTypes_ActiveTypesExist_ReturnsMappedTypes() {
			when(policyLeaveTypeDao.findAllByIsActive(true)).thenReturn(List.of(buildLeaveType()));
			when(leaveMapper.policyLeaveTypeListToPolicyLeaveTypeResponseDtoList(anyList()))
				.thenReturn(List.of(new PolicyLeaveTypeResponseDto()));

			ResponseEntityDto response = leavePolicyService.getPolicyLeaveTypes();

			assertEquals("successful", response.getStatus());
			assertEquals(1, response.getResults().size());
		}

	}

}
