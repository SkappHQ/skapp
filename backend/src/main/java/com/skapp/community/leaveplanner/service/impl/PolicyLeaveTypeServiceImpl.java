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
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeStatusResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.PolicyLeaveTypeService;
import com.skapp.community.leaveplanner.util.PolicyLeaveTypeValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
	public ResponseEntityDto getPolicyLeaveTypes(PolicyLeaveTypeFilterDto policyLeaveTypeFilterDto) {
		log.info("getPolicyLeaveTypes: execution started");

		Sort sort = Sort.by(Sort.Order.asc("name").ignoreCase());
		Pageable pageable = policyLeaveTypeFilterDto.getSize() < 0 ? Pageable.unpaged(sort)
				: PageRequest.of(policyLeaveTypeFilterDto.getPage(), policyLeaveTypeFilterDto.getSize(), sort);

		Boolean isActive = policyLeaveTypeFilterDto.getIsActive();
		Page<PolicyLeaveType> policyLeaveTypePage = isActive == null ? policyLeaveTypeDao.findAll(pageable)
				: policyLeaveTypeDao.findAllByIsActive(isActive, pageable);

		List<PolicyLeaveTypeDetailResponseDto> policyLeaveTypes = leaveMapper
			.policyLeaveTypeListToPolicyLeaveTypeDetailResponseDtoList(policyLeaveTypePage.getContent());

		PageDto pageDto = new PageDto();
		pageDto.setItems(policyLeaveTypes);
		pageDto.setCurrentPage(policyLeaveTypePage.getNumber());
		pageDto.setTotalItems(policyLeaveTypePage.getTotalElements());
		pageDto.setTotalPages(policyLeaveTypePage.getTotalPages());

		log.info("getPolicyLeaveTypes: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto addPolicyLeaveType(PolicyLeaveTypeRequestDto policyLeaveTypeRequestDto) {
		log.info("addPolicyLeaveType: execution started");

		String name = normalizeName(policyLeaveTypeRequestDto.getName());

		PolicyLeaveTypeValidationUtil.validateName(name);
		PolicyLeaveTypeValidationUtil.validateEmojiCode(policyLeaveTypeRequestDto.getEmojiCode());
		PolicyLeaveTypeValidationUtil.validateColorCode(policyLeaveTypeRequestDto.getColorCode());
		PolicyLeaveTypeValidationUtil.validateMinDuration(policyLeaveTypeRequestDto.getMinDuration());
		PolicyLeaveTypeValidationUtil.validateAttachmentSetup(policyLeaveTypeRequestDto.getIsAttachment(),
				policyLeaveTypeRequestDto.getIsAttachmentMust());

		if (policyLeaveTypeDao.existsByNameIgnoreCase(name)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS);
		}

		PolicyLeaveType policyLeaveType = buildPolicyLeaveType(policyLeaveTypeRequestDto, name);
		policyLeaveType = policyLeaveTypeDao.save(policyLeaveType);

		log.info("addPolicyLeaveType: execution ended");

		return new ResponseEntityDto(false,
				leaveMapper.policyLeaveTypeToPolicyLeaveTypeDetailResponseDto(policyLeaveType));
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
			String name = normalizeName(policyLeaveTypeUpdateRequestDto.getName());
			PolicyLeaveTypeValidationUtil.validateName(name);

			if (policyLeaveTypeDao.existsByNameIgnoreCaseAndIdNot(name, id)) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS);
			}

			policyLeaveType.setName(name);
		}

		if (policyLeaveTypeUpdateRequestDto.getEmojiCode() != null) {
			PolicyLeaveTypeValidationUtil.validateEmojiCode(policyLeaveTypeUpdateRequestDto.getEmojiCode());
			policyLeaveType.setEmojiCode(policyLeaveTypeUpdateRequestDto.getEmojiCode());
		}

		if (policyLeaveTypeUpdateRequestDto.getColorCode() != null) {
			PolicyLeaveTypeValidationUtil.validateColorCode(policyLeaveTypeUpdateRequestDto.getColorCode());
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

		log.info("updatePolicyLeaveType: execution ended");

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

		policyLeaveType.setIsActive(Boolean.FALSE);
		policyLeaveType = policyLeaveTypeDao.save(policyLeaveType);

		log.info("deactivatePolicyLeaveType: execution ended");

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

		policyLeaveType.setIsActive(Boolean.TRUE);
		policyLeaveType = policyLeaveTypeDao.save(policyLeaveType);

		log.info("activatePolicyLeaveType: execution ended");

		return new ResponseEntityDto(false,
				new PolicyLeaveTypeStatusResponseDto(policyLeaveType.getId(), policyLeaveType.getIsActive()));
	}

	private PolicyLeaveType getPolicyLeaveType(Long id) {
		return policyLeaveTypeDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_ID_NOT_FOUND));
	}

	private String normalizeName(String name) {
		return name == null ? null : name.trim();
	}

	private PolicyLeaveType buildPolicyLeaveType(PolicyLeaveTypeRequestDto dto, String name) {
		PolicyLeaveType policyLeaveType = new PolicyLeaveType();
		policyLeaveType.setName(name);
		policyLeaveType.setEmojiCode(dto.getEmojiCode());
		policyLeaveType.setColorCode(dto.getColorCode());
		policyLeaveType.setMinDuration(dto.getMinDuration());
		policyLeaveType.setIsAttachment(Boolean.TRUE.equals(dto.getIsAttachment()));
		policyLeaveType.setIsAttachmentMust(Boolean.TRUE.equals(dto.getIsAttachmentMust()));
		policyLeaveType.setIsCommentMust(Boolean.TRUE.equals(dto.getIsCommentMust()));
		policyLeaveType.setIsAutoApproval(Boolean.TRUE.equals(dto.getIsAutoApproval()));
		policyLeaveType.setIsActive(Boolean.TRUE);

		return policyLeaveType;
	}

}
