package com.skapp.support;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.repository.OrganizationDao;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.InitializingBean;

@RequiredArgsConstructor
public class TestOrganizationSeeder implements InitializingBean {

	private final OrganizationDao organizationDao;

	@Override
	public void afterPropertiesSet() {
		Organization organization = new Organization();
		organization.setOrganizationName("Test Organization");
		organization.setCountry("Sri Lanka");
		organization.setOrganizationTimeZone("UTC");
		organizationDao.save(organization);
	}

}
