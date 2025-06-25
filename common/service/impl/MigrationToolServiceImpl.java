package com.skapp.enterprise.common.service.impl;

import com.skapp.enterprise.common.service.MigrationToolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
	public boolean createMySqlTenantDatabase(String tenantId) {
		return createTenantDatabase(tenantId, mySqlTenantCreationUrl, "MySQL");
	}

	@Override
	public boolean createPostgresqlTenantDatabase(String tenantId) {
		return createTenantDatabase(tenantId, postgresqlTenantCreationUrl, "Postgresql");
	}

	private boolean createTenantDatabase(String tenantId, String baseUrl, String databaseType) {
		String url = baseUrl + "/" + tenantId;
		HttpHeaders headers = new HttpHeaders();
		headers.set("x-api-key", apiKey);
		HttpEntity<String> entity = new HttpEntity<>(headers);

		ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

		if (responseEntity.getStatusCode().is2xxSuccessful()) {
			log.info("Successfully created tenant in {} for tenantId: {}, response: {}", databaseType, tenantId,
					responseEntity.getBody());
			return true;
		}

		log.error("Failed to create tenant in {} for tenantId: {}, status: {}, response: {}", databaseType, tenantId,
				responseEntity.getStatusCode(), responseEntity.getBody());
		return false;
	}

}