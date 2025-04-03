package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.TenantDatabaseCreationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Service
@Slf4j
@RequiredArgsConstructor
public class TenantDatabaseCreationServiceImpl implements TenantDatabaseCreationService {

	private final DataSource dataSource;

	@Override
	public void createTenantDatabase(String tenantId) {
		if (isInvalidDatabaseName(tenantId)) {
			log.error("createTenantDatabase: Invalid Database Name: {}", tenantId);
			throw new ModuleException(EPCommonMessageConstant.COMMON_ERROR_INVALID_DB_NAME);
		}

		String sanitizedTenantId = tenantId.toLowerCase();

		try (Connection connection = dataSource.getConnection()) {
			String sql = "CREATE DATABASE IF NOT EXISTS `" + sanitizedTenantId + "`";

			try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
				preparedStatement.execute();
				log.info("Successfully created database for tenant: {}", sanitizedTenantId);
			}
		}
		catch (SQLException e) {
			log.error("Failed to create database for tenant: {}", tenantId, e);
			throw new ModuleException(EPCommonMessageConstant.COMMON_ERROR_DB_CREATION_FAILED,
					new String[] { e.getMessage() });
		}
	}

	private boolean isInvalidDatabaseName(String dbName) {
		if (dbName == null || dbName.trim().isEmpty()) {
			return true;
		}

		return !dbName.matches("^[a-zA-Z0-9-]+$") || dbName.length() > 64;
	}

	@Override
	public boolean doesTenantDatabaseExist(String tenantId) {
		if (isInvalidDatabaseName(tenantId)) {
			log.error("Invalid database name for tenant: {}", tenantId);
			throw new ModuleException(EPCommonMessageConstant.COMMON_ERROR_INVALID_DB_NAME);
		}

		String sanitizedTenantId = tenantId.toLowerCase();

		try (Connection connection = dataSource.getConnection()) {
			String sql = "SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ? LIMIT 1";

			try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
				preparedStatement.setString(1, sanitizedTenantId);

				try (ResultSet resultSet = preparedStatement.executeQuery()) {
					return resultSet.next();
				}
			}
		}
		catch (SQLException e) {
			log.error("Failed to check if database exists for tenant: {}", tenantId, e);
			throw new ModuleException(EPCommonMessageConstant.COMMON_ERROR_DB_EXISTENCE_CHECK_FAILED,
					new String[] { e.getMessage() });
		}
	}

}
