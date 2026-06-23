package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageReorderRequestDto;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.service.CrmDealStageService;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealStageServiceImpl implements CrmDealStageService {

	private final CrmDealStageDao crmDealStageDao;

	private final CrmDealDao crmDealDao;

	private final CrmMapper crmMapper;

	private final MessageUtil messageUtil;

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

		if (CrmConstants.NON_DELETEABLE_STAGES.contains(stage.getStageType())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CANNOT_DELETE_TERMINAL_STAGE);
		}

		if (crmDealDao.existsByStageIdAndIsDeletedFalse(id)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CANNOT_DELETE_STAGE_WITH_DEALS);
		}

		stage.setIsDeleted(true);
		crmDealStageDao.save(stage);

		log.info("deleteDealStage: execution ended, deleted stage id={}", id);

		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_DEAL_STAGE_DELETED), false);
	}

	@Override
	@Transactional
	public ResponseEntityDto reorderDealStages(List<CrmDealStageReorderRequestDto> changedStages) {
		log.info("reorderDealStages: execution started");

		CrmValidations.validateDealStageReorderRequest(changedStages);

		List<Long> stageIds = changedStages.stream()
			.map(CrmDealStageReorderRequestDto::getId)
			.collect(Collectors.toList());

		List<CrmDealStage> existingStages = crmDealStageDao.findAllByIdInAndIsDeletedFalse(stageIds);

		if (existingStages.size() != stageIds.size()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND);
		}

		if (existingStages.stream().map(CrmDealStage::getStageType).anyMatch(CrmConstants.TERMINAL_STAGES::contains)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CANNOT_REORDER_TERMINAL_STAGE);
		}

		Map<Long, CrmDealStage> exisitingStagesMap = existingStages.stream()
			.collect(Collectors.toMap(CrmDealStage::getId, stage -> stage));

		changedStages.forEach(newStage -> {
			CrmDealStage stage = exisitingStagesMap.get(newStage.getId());
			stage.setOrderIndex(newStage.getOrderIndex());
		});

		ensureFirstStageIsInitial(existingStages);

		crmDealStageDao.saveAll(existingStages);

		log.info("reorderDealStages: execution ended");

		return new ResponseEntityDto(false, crmMapper.crmDealStagesToCrmDealStageResponseDtos(existingStages));
	}

	private void ensureFirstStageIsInitial(List<CrmDealStage> reorderedStages) {
		CrmDealStage firstStage = Collections.min(reorderedStages, Comparator.comparing(CrmDealStage::getOrderIndex));

		reorderedStages.forEach(stage -> stage
			.setStageType(stage.getId().equals(firstStage.getId()) ? CrmDealStageType.INITIAL : CrmDealStageType.OPEN));
	}

	protected List<CrmDealStage> filterVisibleDealStages(List<CrmDealStage> stages) {
		return stages;
	}

	protected void validateDealStageCreation() {
		// This method is a placeholder for enterprise deal stage creation logic
	}

}
