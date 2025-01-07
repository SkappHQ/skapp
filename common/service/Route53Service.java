package com.skapp.enterprise.common.service;

public interface Route53Service {

	String getHostedZoneId();

	void createSubdomainForTenant(String subdomainName);

	void deleteTenantSubdomain(String subdomainName);

	boolean isDomainNotAvailable(String subDomainName);

}
