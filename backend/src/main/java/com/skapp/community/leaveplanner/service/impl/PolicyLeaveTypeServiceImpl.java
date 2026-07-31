package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeUpdateRequestDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeDetailResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeStatusResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypesResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.PolicyLeaveTypeService;
import com.skapp.community.leaveplanner.util.PolicyLeaveTypeValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyLeaveTypeServiceImpl implements PolicyLeaveTypeService {

	private final PolicyLeaveTypeDao policyLeaveTypeDao;

	private final LeaveMapper leaveMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveTypes() {
		log.info("getPolicyLeaveTypes: execution started");

		List<PolicyLeaveTypeResponseDto> leaveTypes = leaveMapper
			.policyLeaveTypeListToPolicyLeaveTypeResponseDtoList(policyLeaveTypeDao.findAllByIsActive(true));

		log.info("getPolicyLeaveTypes: execution ended");
		return new ResponseEntityDto(false, new PolicyLeaveTypesResponseDto(leaveTypes));
	}

	@Override
	@Transactional
	public ResponseEntityDto addPolicyLeaveType(PolicyLeaveTypeRequestDto policyLeaveTypeRequestDto) {
		log.info("addPolicyLeaveType: execution started");

		PolicyLeaveTypeValidationUtil.validateName(policyLeaveTypeRequestDto.getName());
		PolicyLeaveTypeValidationUtil.validateAppearance(policyLeaveTypeRequestDto.getEmojiCode(),
				policyLeaveTypeRequestDto.getColorCode());
		PolicyLeaveTypeValidationUtil.validateMinDuration(policyLeaveTypeRequestDto.getMinDuration());
		PolicyLeaveTypeValidationUtil.validateAttachmentSetup(policyLeaveTypeRequestDto.getIsAttachment(),
				policyLeaveTypeRequestDto.getIsAttachmentMust());

		if (policyLeaveTypeDao.existsByNameIgnoreCase(policyLeaveTypeRequestDto.getName())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS);
		}

		PolicyLeaveType policyLeaveType = buildPolicyLeaveType(policyLeaveTypeRequestDto);
		policyLeaveType = policyLeaveTypeDao.save(policyLeaveType);

		log.info("addPolicyLeaveType: leave type created successfully");

		return new ResponseEntityDto(false,
				leaveMapper.policyLeaveTypeToPolicyLeaveTypeDetailResponseDto(policyLeaveType));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto searchPolicyLeaveTypes(PolicyLeaveTypeFilterDto policyLeaveTypeFilterDto) {
		log.info("searchPolicyLeaveTypes: execution started");

		Pageable pageable = PageRequest.of(policyLeaveTypeFilterDto.getPage(), policyLeaveTypeFilterDto.getSize());
		Page<PolicyLeaveType> policyLeaveTypePage = policyLeaveTypeDao.findPolicyLeaveTypes(policyLeaveTypeFilterDto,
				pageable);

		List<PolicyLeaveTypeDetailResponseDto> policyLeaveTypeDetailResponseDtos = leaveMapper
			.policyLeaveTypeListToPolicyLeaveTypeDetailResponseDtoList(policyLeaveTypePage.getContent());

		PageDto pageDto = new PageDto();
		pageDto.setItems(policyLeaveTypeDetailResponseDtos);
		pageDto.setCurrentPage(policyLeaveTypePage.getNumber());
		pageDto.setTotalItems(policyLeaveTypePage.getTotalElements());
		pageDto.setTotalPages(policyLeaveTypePage.getTotalPages());

		log.info("searchPolicyLeaveTypes: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveTypeById(Long id) {
		log.info("getPolicyLeaveTypeById: execution started");

		PolicyLeaveType policyLeaveType = getPolicyLeaveType(id);

		log.info("getPolicyLeaveTypeById: execution ended");
		return new ResponseEntityDto(false,
				leaveMapper.policyLeaveTypeToPolicyLeaveTypeDetailResponseDto(policyLeaveType));
	}

	@Override
	@Transactional
	public ResponseEntityDto updatePolicyLeaveType(Long id,
			PolicyLeaveTypeUpdateRequestDto policyLeaveTypeUpdateRequestDto) {
		log.info("updatePolicyLeaveType: execution started");

		PolicyLeaveType policyLeaveType = getPolicyLeaveType(id);

		if (policyLeaveTypeUpdateRequestDto.getName() != null) {
			PolicyLeaveTypeValidationUtil.validateName(policyLeaveTypeUpdateRequestDto.getName());

			if (policyLeaveTypeDao.existsByNameIgnoreCaseAndIdNot(policyLeaveTypeUpdateRequestDto.getName(), id)) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS);
			}

			policyLeaveType.setName(policyLeaveTypeUpdateRequestDto.getName());
		}

		if (policyLeaveTypeUpdateRequestDto.getEmojiCode() != null) {
			policyLeaveType.setEmojiCode(policyLeaveTypeUpdateRequestDto.getEmojiCode());
		}

		if (policyLeaveTypeUpdateRequestDto.getColorCode() != null) {
			policyLeaveType.setColorCode(policyLeaveTypeUpdateRequestDto.getColorCode());
		}

		if (policyLeaveTypeUpdateRequestDto.getMinDuration() != null) {
			policyLeaveType.setMinDuration(policyLeaveTypeUpdateRequestDto.getMinDuration());
		}

		if (policyLeaveTypeUpdateRequestDto.getIsAttachment() != null) {
			policyLeaveType.setIsAttachment(policyLeaveTypeUpdateRequestDto.getIsAttachment());
		}

		if (policyLeaveTypeUpdateRequestDto.getIsAttachmentMust() != null) {
			policyLeaveType.setIsAttachmentMust(policyLeaveTypeUpdateRequestDto.getIsAttachmentMust());
		}

		if (policyLeaveTypeUpdateRequestDto.getIsCommentMust() != null) {
			policyLeaveType.setIsCommentMust(policyLeaveTypeUpdateRequestDto.getIsCommentMust());
		}

		if (policyLeaveTypeUpdateRequestDto.getIsAutoApproval() != null) {
			policyLeaveType.setIsAutoApproval(policyLeaveTypeUpdateRequestDto.getIsAutoApproval());
		}

		PolicyLeaveTypeValidationUtil.validateAttachmentSetup(policyLeaveType.getIsAttachment(),
				policyLeaveType.getIsAttachmentMust());

		policyLeaveType = policyLeaveTypeDao.save(policyLeaveType);

		log.info("updatePolicyLeaveType: leave type updated successfully");

		return new ResponseEntityDto(false,
				leaveMapper.policyLeaveTypeToPolicyLeaveTypeDetailResponseDto(policyLeaveType));
	}

	@Override
	@Transactional
	public ResponseEntityDto deactivatePolicyLeaveType(Long id) {
		log.info("deactivatePolicyLeaveType: execution started");

		PolicyLeaveType policyLeaveType = getPolicyLeaveType(id);

		if (!Boolean.TRUE.equals(policyLeaveType.getIsActive())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_INACTIVE);
		}

		policyLeaveType.setIsActive(false);
		policyLeaveType = policyLeaveTypeDao.save(policyLeaveType);

		log.info("deactivatePolicyLeaveType: leave type deactivated successfully");

		return new ResponseEntityDto(false,
				new PolicyLeaveTypeStatusResponseDto(policyLeaveType.getId(), policyLeaveType.getIsActive()));
	}

	@Override
	@Transactional
	public ResponseEntityDto activatePolicyLeaveType(Long id) {
		log.info("activatePolicyLeaveType: execution started");

		PolicyLeaveType policyLeaveType = getPolicyLeaveType(id);

		if (Boolean.TRUE.equals(policyLeaveType.getIsActive())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_ACTIVE);
		}

		policyLeaveType.setIsActive(true);
		policyLeaveType = policyLeaveTypeDao.save(policyLeaveType);

		log.info("activatePolicyLeaveType: leave type activated successfully");

		return new ResponseEntityDto(false,
				new PolicyLeaveTypeStatusResponseDto(policyLeaveType.getId(), policyLeaveType.getIsActive()));
	}

	private PolicyLeaveType getPolicyLeaveType(Long id) {
		return policyLeaveTypeDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_EXIST));
	}

	private PolicyLeaveType buildPolicyLeaveType(PolicyLeaveTypeRequestDto dto) {
		PolicyLeaveType policyLeaveType = new PolicyLeaveType();
		policyLeaveType.setName(dto.getName());
		policyLeaveType.setEmojiCode(dto.getEmojiCode());
		policyLeaveType.setColorCode(dto.getColorCode());
		policyLeaveType.setMinDuration(dto.getMinDuration());
		policyLeaveType.setIsAttachment(Boolean.TRUE.equals(dto.getIsAttachment()));
		policyLeaveType.setIsAttachmentMust(Boolean.TRUE.equals(dto.getIsAttachmentMust()));
		policyLeaveType.setIsCommentMust(Boolean.TRUE.equals(dto.getIsCommentMust()));
		policyLeaveType.setIsAutoApproval(Boolean.TRUE.equals(dto.getIsAutoApproval()));
		policyLeaveType.setIsActive(true);

		return policyLeaveType;
	}

}
