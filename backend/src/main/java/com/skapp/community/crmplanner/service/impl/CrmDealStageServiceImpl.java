package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmDealStageResponseDto;
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

		List<CrmDealStageResponseDto> stages = crmMapper
			.crmDealStagesToCrmDealStageResponseDtos(crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc());

		log.info("getDealStages: execution ended with {} result(s)", stages.size());

		return new ResponseEntityDto(false, stages);
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

		CrmDealStage stage = new CrmDealStage();
		stage.setName(requestDto.getName());
		stage.setDescription(requestDto.getDescription());
		stage.setColor(requestDto.getColor().name());
		stage.setStageType(CrmConstants.DEFAULT_DEAL_STAGE_TYPE);
		stage.setOrderIndex(crmDealStageDao.countByIsDeletedFalse() + 1);

		CrmDealStage saved = crmDealStageDao.save(stage);

		log.info("createDealStage: execution ended, created stage id={}", saved.getId());

		return new ResponseEntityDto(false, crmMapper.crmDealStageToCrmDealStageResponseDto(saved));
	}

}
