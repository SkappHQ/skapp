package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.crmplanner.constant.DefaultCrmDealStageTemplate;
import com.skapp.community.crmplanner.constant.DefaultCrmIndustryTemplate;
import com.skapp.community.crmplanner.constant.DefaultCrmTaskTypeTemplate;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmIndustryDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.service.CrmConfigService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmConfigServiceImpl implements CrmConfigService {

	private final CrmDealStageDao crmDealStageDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final CrmIndustryDao crmIndustryDao;

	@Override
	@Transactional
	public void setDefaultCrmConfig() {
		setDefaultCrmDealStages();
		setDefaultCrmTaskTypes();
		setDefaultCrmIndustries();
	}

	private void setDefaultCrmDealStages() {
		log.info("setDefaultCrmDealStages: execution started");

		List<CrmDealStage> dealStages = DefaultCrmDealStageTemplate.getDefaultStages();
		if (!dealStages.isEmpty()) {
			crmDealStageDao.insertAll(dealStages);
		}

		log.info("setDefaultCrmDealStages: execution ended");
	}

	private void setDefaultCrmTaskTypes() {
		log.info("setDefaultCrmTaskTypes: execution started");

		List<CrmTaskType> taskTypes = DefaultCrmTaskTypeTemplate.getDefaultTaskTypes();
		if (!taskTypes.isEmpty()) {
			crmTaskTypeDao.insertAll(taskTypes);
		}

		log.info("setDefaultCrmTaskTypes: execution ended");
	}

	private void setDefaultCrmIndustries() {
		log.info("setDefaultCrmIndustries: execution started");

		List<CrmIndustry> industries = DefaultCrmIndustryTemplate.getDefaultIndustries();
		if (!industries.isEmpty()) {
			crmIndustryDao.insertAll(industries);
		}

		log.info("setDefaultCrmIndustries: execution ended");
	}

}
