package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.payload.request.LeaveTypeFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypePatchRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypeRequestDto;
import com.skapp.community.leaveplanner.payload.response.LeaveTypeResponseDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeaveTypeService;
import com.skapp.community.leaveplanner.type.CalculationType;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeaveTypeServiceImpl implements LeaveTypeService {

	private final LeaveTypeDao leaveTypeDao;

	private final LeaveMapper leaveMapper;

	private final UserService userService;

	private final LeaveEntitlementDao leaveEntitlementDao;

	@Override
	public ResponseEntityDto addLeaveType(LeaveTypeRequestDto leaveTypeRequestDto) {
		log.info("addLeaveType: execution started");

		if (leaveTypeRequestDto != null) {
			validateLeaveType(leaveTypeRequestDto);

			LeaveType leaveType = leaveMapper.leaveTypeDtoToLeaveType(leaveTypeRequestDto);
			leaveType = leaveTypeDao.save(leaveType);

			leaveTypeRequestDto = leaveMapper.leaveTypeToLeaveTypeDto(leaveType);
		}

		log.info("addLeaveType: execution ended");
		return new ResponseEntityDto(false, leaveTypeRequestDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getLeaveTypes(LeaveTypeFilterDto leaveTypeFilterDto) {

		log.info("getLeaveTypes: execution started");
		List<LeaveType> leaveTypes;

		Long userId = userService.getCurrentUser().getUserId();

		if (Boolean.TRUE.equals(leaveTypeFilterDto.getFilterByInUse())) {
			leaveTypes = leaveTypeDao.getUsedUserLeaveTypes(userId,
					Boolean.TRUE.equals(leaveTypeFilterDto.getIsCarryForward()));
		}
		else if (Boolean.TRUE.equals(leaveTypeFilterDto.getIsCarryForward())) {
			leaveTypes = leaveTypeDao.findByIsCarryForwardEnabledAndIsActive(true, true);
		}
		else {
			leaveTypes = leaveTypeDao.findAll();
		}
		List<LeaveTypeResponseDto> responseDtoList = leaveMapper.leaveTypeListToLeaveTypeResponseDtoList(leaveTypes);

		log.info("getLeaveTypes: execution ended successfully for Leave Types: {}", responseDtoList.size());
		return new ResponseEntityDto(false, responseDtoList);

	}

	@Override
	public ResponseEntityDto getLeaveTypeById(@NonNull Long id) {
		log.info("getLeaveTypeById: execution started");

		Optional<LeaveType> optionalLeaveType = leaveTypeDao.findById(id);
		if (optionalLeaveType.isEmpty()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_NOT_FOUND);
		}

		LeaveTypeRequestDto leaveTypeDto = leaveMapper.leaveTypeToLeaveTypeDto(optionalLeaveType.get());

		log.info("getLeaveTypeById: execution ended");
		return new ResponseEntityDto(false, leaveTypeDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateLeaveType(@NonNull Long id, LeaveTypePatchRequestDto leaveTypePatchRequestDto) {
		log.info("updateLeaveType: execution started");

		Optional<LeaveType> optionalLeaveType = leaveTypeDao.findById(id);
		if (optionalLeaveType.isEmpty()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_NOT_FOUND);
		}

		LeaveType leaveType = optionalLeaveType.get();
		validateLeaveTypeConfigurations(leaveTypePatchRequestDto, leaveType);

		if (leaveTypePatchRequestDto.getName() != null) {
			if (!leaveType.getName().equalsIgnoreCase(leaveTypePatchRequestDto.getName())
					&& isLeaveTypeNameExist(leaveTypePatchRequestDto.getName())) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_ALREADY_EXISTS);
			}
			leaveType.setName(leaveTypePatchRequestDto.getName());
		}

		if (leaveTypePatchRequestDto.getColorCode() != null
				&& !leaveType.getColorCode().equalsIgnoreCase(leaveTypePatchRequestDto.getColorCode())) {
			leaveType.setColorCode(leaveTypePatchRequestDto.getColorCode());
		}

		if (leaveTypePatchRequestDto.getEmojiCode() != null
				&& !leaveType.getEmojiCode().equalsIgnoreCase(leaveTypePatchRequestDto.getEmojiCode())) {
			leaveType.setEmojiCode(leaveTypePatchRequestDto.getEmojiCode());
		}

		if (leaveTypePatchRequestDto.getCalculationType() != null) {
			leaveType.setCalculationType(leaveTypePatchRequestDto.getCalculationType());
		}
		if (leaveTypePatchRequestDto.getLeaveDuration() != null) {
			leaveType.setLeaveDuration(leaveTypePatchRequestDto.getLeaveDuration());
		}

		if (!Objects.equals(leaveTypePatchRequestDto.getIsCarryForwardEnabled(),
				leaveType.getIsCarryForwardEnabled())) {
			leaveType.setIsCarryForwardEnabled(leaveTypePatchRequestDto.getIsCarryForwardEnabled());
		}

		if (leaveTypePatchRequestDto.getCarryForwardExpirationDays() != leaveType.getCarryForwardExpirationDays()) {
			leaveType
				.setCarryForwardExpirationDays(Boolean.TRUE.equals(leaveTypePatchRequestDto.getIsCarryForwardEnabled())
						? leaveTypePatchRequestDto.getCarryForwardExpirationDays() : 0);
		}
		if (leaveTypePatchRequestDto.getCarryForwardExpirationDate() != leaveType.getCarryForwardExpirationDate()) {
			leaveType
				.setCarryForwardExpirationDate(Boolean.TRUE.equals(leaveTypePatchRequestDto.getIsCarryForwardEnabled())
						? leaveTypePatchRequestDto.getCarryForwardExpirationDate() : null);
		}

		if (leaveTypePatchRequestDto.getMaxCarryForwardDays() != leaveType.getMaxCarryForwardDays()) {
			leaveType.setMaxCarryForwardDays(Boolean.TRUE.equals(leaveTypePatchRequestDto.getIsCarryForwardEnabled())
					? leaveTypePatchRequestDto.getMaxCarryForwardDays() : 0);
		}
		if (!Objects.equals(leaveTypePatchRequestDto.getIsCarryForwardRemainingBalanceEnabled(),
				leaveType.getIsCarryForwardRemainingBalanceEnabled())) {
			leaveType.setIsCarryForwardRemainingBalanceEnabled(leaveTypePatchRequestDto.getIsCarryForwardEnabled()
					&& leaveTypePatchRequestDto.getIsCarryForwardRemainingBalanceEnabled());
		}

		List<LeaveEntitlement> leaveEntitlements = handleIsActiveFlag(leaveType, leaveTypePatchRequestDto);
		if (!leaveEntitlements.isEmpty()) {
			leaveEntitlementDao.saveAll(leaveEntitlements);
		}

		leaveType = leaveTypeDao.save(leaveType);
		LeaveTypeResponseDto leaveTypeDto = leaveMapper.leaveTypeToLeaveTypeResponseDto(leaveType);
		log.info("updateLeaveType: execution ended");

		return new ResponseEntityDto(false, leaveTypeDto);
	}

	@Transactional
	public void createDefaultLeaveType() {
		log.info("createDefaultLeaveType: execution started");

		LeaveTypeRequestDto annualLeaveType = new LeaveTypeRequestDto();
		annualLeaveType.setName("Annual");
		annualLeaveType.setEmojiCode("1f3d6-fe0f;"); // Beach with Umbrella
		annualLeaveType.setColorCode("#FF6384");
		annualLeaveType.setCalculationType(CalculationType.ACCUMULATED);
		annualLeaveType.setLeaveDuration(LeaveDuration.HALF_AND_FULL_DAY);
		annualLeaveType.setMaxCarryForwardDays(0);
		annualLeaveType.setCarryForwardExpirationDays(0);
		annualLeaveType.setIsAttachment(false);
		annualLeaveType.setIsOverridden(false);
		annualLeaveType.setIsAttachmentMandatory(false);
		annualLeaveType.setIsCommentMandatory(false);
		annualLeaveType.setIsAutoApproval(false);
		annualLeaveType.setIsActive(true);
		annualLeaveType.setIsCarryForwardEnabled(false);
		annualLeaveType.setIsCarryForwardRemainingBalanceEnabled(false);

		addLeaveType(annualLeaveType);
		log.info("createDefaultLeaveType: execution ended");
	}

	private void validateLeaveTypeConfigurations(LeaveTypePatchRequestDto leaveTypePatchRequestDto,
			LeaveType leaveType) {
		if (!Objects.equals(leaveTypePatchRequestDto.getIsAttachment(), leaveType.getIsAttachment()))
			leaveType.setIsAttachment(leaveTypePatchRequestDto.getIsAttachment());

		if (!leaveTypePatchRequestDto.getIsAttachment()
				&& Boolean.TRUE.equals(leaveTypePatchRequestDto.getIsAttachmentMandatory())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_UNABLE_TO_MAKE_ATTACHMENT_MANDATORY);
		}
		if (!Objects.equals(leaveTypePatchRequestDto.getIsAttachmentMandatory(),
				leaveType.getIsAttachmentMandatory())) {
			leaveType.setIsAttachmentMandatory(leaveTypePatchRequestDto.getIsAttachmentMandatory());
		}

		if (!Objects.equals(leaveTypePatchRequestDto.getIsCommentMandatory(), leaveType.getIsCommentMandatory()))
			leaveType.setIsCommentMandatory(leaveTypePatchRequestDto.getIsCommentMandatory());

		if (!Objects.equals(leaveTypePatchRequestDto.getIsAutoApproval(), leaveType.getIsAutoApproval()))
			leaveType.setIsAutoApproval(leaveTypePatchRequestDto.getIsAutoApproval());
	}

	private List<LeaveEntitlement> handleIsActiveFlag(LeaveType leaveType,
			LeaveTypePatchRequestDto leaveTypePatchRequestDto) {
		if (!Objects.equals(leaveTypePatchRequestDto.getIsActive(), leaveType.getIsActive())) {
			leaveType.setIsActive(leaveTypePatchRequestDto.getIsActive());
			List<LeaveEntitlement> leaveEntitlements = leaveEntitlementDao.findAllByLeaveType(leaveType);
			if (!leaveEntitlements.isEmpty() && leaveTypePatchRequestDto.getIsActive() != null) {
				boolean isActive = leaveTypePatchRequestDto.getIsActive();
				leaveEntitlements.forEach(leaveEntitlement -> leaveEntitlement.setActive(isActive));
				return leaveEntitlements;
			}
		}
		return Collections.emptyList();
	}

	private void validateLeaveType(LeaveTypeRequestDto leaveType) {
		if (!leaveType.getIsAttachment() && Boolean.TRUE.equals(leaveType.getIsAttachmentMandatory())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_UNABLE_TO_MAKE_ATTACHMENT_MANDATORY);
		}

		if (leaveType.getName() != null && isLeaveTypeNameExist(leaveType.getName())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_ALREADY_EXISTS);
		}

		if (!leaveType.getIsCarryForwardEnabled() && leaveType.getMaxCarryForwardDays() > 0) {
			throw new ModuleException(
					LeaveMessageConstant.LEAVE_ERROR_CANNOT_SET_CARRY_FORWARD_DAYS_IF_CARRY_FORWARD_DISABLED);
		}

		if (leaveType.getMaxCarryForwardDays() > LeaveModuleConstant.MAX_CARRY_FORWARD_DAYS) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_MAX_CARRY_FORWARD_DAYS_EXCEEDS_LIMIT,
					new String[] { String.valueOf(LeaveModuleConstant.MAX_CARRY_FORWARD_DAYS) });
		}

	}

	private boolean isLeaveTypeNameExist(String name) {
		LeaveType defineLeaveType = leaveTypeDao.findLeaveTypeByName(name);
		return defineLeaveType != null;
	}

}
