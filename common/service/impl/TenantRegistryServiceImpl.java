package com.skapp.enterprise.common.service.impl;

import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.service.TenantRegistryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantRegistryServiceImpl implements TenantRegistryService {

	private final TenantDao tenantDao;

	@Transactional(readOnly = true)
	public boolean isTenantActive(String tenantId) {
		return tenantDao.existsById(tenantId);
	}

}
