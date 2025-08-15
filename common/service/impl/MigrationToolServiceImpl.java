package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.MigrationToolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class MigrationToolServiceImpl implements MigrationToolService {

	private final RestTemplate restTemplate;

	@Value("${migration-tool.mysql-tenant-creation-url}")
	private String mySqlTenantCreationUrl;

	@Value("${migration-tool.postgresql-tenant-creation-url}")
	private String postgresqlTenantCreationUrl;

	@Value("${migration-tool.api-key}")
	private String apiKey;

	@Override
	public void createMySqlTenantDatabase(String tenantId) {
		createTenantDatabase(tenantId, mySqlTenantCreationUrl, "MySQL");
	}

	@Override
	public void createPostgresqlTenantDatabase(String tenantId) {
		createTenantDatabase(tenantId, postgresqlTenantCreationUrl, "Postgresql");
	}

	private void createTenantDatabase(String tenantId, String baseUrl, String databaseType) {
		String url = baseUrl + "/" + tenantId;
		HttpHeaders headers = new HttpHeaders();
		headers.set("x-api-key", apiKey);
		HttpEntity<String> entity = new HttpEntity<>(headers);

		try {
			ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
			if (responseEntity.getStatusCode().is2xxSuccessful()) {
				log.info("createTenantDatabase: Successfully created tenant in {} for tenantId: {}, response: {}",
						databaseType, tenantId, responseEntity.getBody());
			}
		}
		catch (RestClientException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MIGRATION_SERVICE_UNAVAILABLE,
					new String[] { e.getMessage() });
		}
	}

}
