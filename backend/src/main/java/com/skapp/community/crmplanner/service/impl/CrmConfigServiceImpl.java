package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.crmplanner.constant.DefaultCrmDealTemplate;
import com.skapp.community.crmplanner.constant.DefaultCrmTaskTypeTemplate;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.service.CrmConfigService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmConfigServiceImpl implements CrmConfigService {

	private final CrmDealStageDao crmDealStageDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	@Override
	@Transactional
	public void setDefaultCrmConfig() {
		setDefaultCrmDealStages();
		setDefaultCrmTaskTypes();
	}

	private void setDefaultCrmDealStages() {
		log.info("setDefaultCrmDealStages: execution started");

		crmDealStageDao.saveAll(DefaultCrmDealTemplate.getDefaultStages());

		log.info("setDefaultCrmDealStages: execution ended");
	}

	private void setDefaultCrmTaskTypes() {
		log.info("setDefaultCrmTaskTypes: execution started");
		
		crmTaskTypeDao.saveAll(DefaultCrmTaskTypeTemplate.getDefaultTaskTypes());

		log.info("setDefaultCrmTaskTypes: execution ended");
	}

}
