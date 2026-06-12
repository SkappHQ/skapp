package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.service.CrmDealStageService;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.DefaultCrmDealStageValues;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.enterprise.common.config.TenantValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealStageServiceImpl implements CrmDealStageService {

	private final CrmDealStageDao crmDealStageDao;

	private final CrmMapper crmMapper;

	private final TenantValidator tenantValidator;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDealStages() {
		log.info("getDealStages: execution started");

		List<CrmDealStage> stages = crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc();

		if (!tenantValidator.isCurrentTenantCoreOrPro()) {
			stages = stages.stream().filter(stage -> !isHiddenFreeTierDefaultStage(stage)).collect(Collectors.toList());
		}

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

		if (!tenantValidator.isCurrentTenantCoreOrPro()) {
			long openStageCount = crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc()
				.stream()
				.filter(stage -> stage.getStageType() == CrmDealStageType.OPEN)
				.filter(stage -> !isHiddenFreeTierDefaultStage(stage))
				.count();

			if (openStageCount >= CrmConstants.DEAL_STAGE_OPEN_LIMIT_FREE_TIER) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_LIMIT_EXCEEDED,
						new Object[] { CrmConstants.DEAL_STAGE_OPEN_LIMIT_FREE_TIER });
			}
		}

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

	private boolean isHiddenFreeTierDefaultStage(CrmDealStage stage) {
		return CrmConstants.FREE_TIER_HIDDEN_DEAL_STAGES.stream()
			.anyMatch(defaultStage -> matchesDefaultStage(stage, defaultStage));
	}

	private boolean matchesDefaultStage(CrmDealStage stage, DefaultCrmDealStageValues defaultStage) {
		return defaultStage.getStage().getName().equals(stage.getName())
				&& defaultStage.getColor().name().equals(stage.getColor())
				&& Objects.equals(defaultStage.getOrderIndex(), stage.getOrderIndex())
				&& defaultStage.getStageType() == stage.getStageType();
	}

}
