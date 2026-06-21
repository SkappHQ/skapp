package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageEditRequestDto;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.service.CrmDealStageService;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealStageServiceImpl implements CrmDealStageService {

	private final CrmDealStageDao crmDealStageDao;

	private final CrmMapper crmMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDealStages() {
		log.info("getDealStages: execution started");

		List<CrmDealStage> stages = filterVisibleDealStages(
				crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc());

		log.info("getDealStages: execution ended with {} result(s)", stages.size());

		return new ResponseEntityDto(false, crmMapper.crmDealStagesToCrmDealStageResponseDtos(stages));
	}

	@Override
	@Transactional
	public ResponseEntityDto createDealStage(CrmDealStageCreateRequestDto requestDto) {
		log.info("createDealStage: execution started");

		CrmValidations.validateDealStageName(requestDto.getName());
		CrmValidations.validateDealStageDescription(requestDto.getDescription());
		CrmValidations.validateDealStageColor(requestDto.getColor());

		if (crmDealStageDao.existsByNameIgnoreCaseAndIsDeletedFalse(requestDto.getName())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_DUPLICATE);
		}

		validateDealStageCreation();

		CrmDealStage stage = new CrmDealStage();
		stage.setName(requestDto.getName());
		stage.setDescription(requestDto.getDescription());
		stage.setColor(requestDto.getColor().name());
		stage.setStageType(CrmConstants.DEFAULT_DEAL_STAGE_TYPE);
		stage.setOrderIndex(crmDealStageDao.findNextOrderIndex());

		CrmDealStage saved = crmDealStageDao.save(stage);

		log.info("createDealStage: execution ended, created stage id={}", saved.getId());

		return new ResponseEntityDto(false, crmMapper.crmDealStageToCrmDealStageResponseDto(saved));
	}

	@Override
	@Transactional
	public ResponseEntityDto editDealStage(Long id, CrmDealStageEditRequestDto requestDto) {
		log.info("editDealStage: execution started for id={}", id);

		CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));

		if (requestDto.getName() != null && !requestDto.getName().equals(stage.getName())) {
			CrmValidations.validateDealStageName(requestDto.getName());
			if (crmDealStageDao.existsByNameIgnoreCaseAndIsDeletedFalseAndIdNot(requestDto.getName(), id)) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_DUPLICATE);
			}
			stage.setName(requestDto.getName());
		}

		if (requestDto.getDescription() != null) {
			CrmValidations.validateDealStageDescription(requestDto.getDescription());
			stage.setDescription(requestDto.getDescription());
		}

		if (requestDto.getColor() != null) {
			CrmValidations.validateDealStageColor(requestDto.getColor());
			stage.setColor(requestDto.getColor().name());
		}

		if (requestDto.getOrderIndex() != null) {
			stage.setOrderIndex(requestDto.getOrderIndex());
		}

		CrmDealStage saved = crmDealStageDao.save(stage);

		log.info("editDealStage: execution ended, updated stage id={}", saved.getId());

		return new ResponseEntityDto(false, crmMapper.crmDealStageToCrmDealStageResponseDto(saved));
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteDealStage(Long id) {
		log.info("deleteDealStage: execution started for id={}", id);

		CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));

		stage.setIsDeleted(true);
		crmDealStageDao.save(stage);

		log.info("deleteDealStage: execution ended, deleted stage id={}", id);

		return new ResponseEntityDto(false, null);
	}

	protected List<CrmDealStage> filterVisibleDealStages(List<CrmDealStage> stages) {
		return stages;
	}

	protected void validateDealStageCreation() {
		// This method is a placeholder for enterprise deal stage creation logic
	}

}
