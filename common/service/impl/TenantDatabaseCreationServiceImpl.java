package com.skapp.enterprise.common.service.impl;

import com.skapp.enterprise.common.service.TenantDatabaseCreationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Service
@Slf4j
@RequiredArgsConstructor
public class TenantDatabaseCreationServiceImpl implements TenantDatabaseCreationService {

	private final DataSource dataSource;

	public void createTenantDatabase(String tenantId) {
		try (Connection connection = dataSource.getConnection()) {
			try (Statement stmt = connection.createStatement()) {
				stmt.execute("CREATE DATABASE IF NOT EXISTS " + tenantId.toLowerCase());
			}
		}
		catch (SQLException e) {
			log.error("Failed to create database for tenant: {}", tenantId, e);
		}
	}

}
