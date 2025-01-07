package com.skapp.enterprise.common.repository.impl;

import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.repository.EpDataResetRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class EpDataResetRepositoryImpl implements EpDataResetRepository {

	@NonNull
	private EntityManager entityManager;

	@Override
	@Transactional
	public void resetDatabase() {
		String databaseSchema = TenantContext.getCurrentTenant();

		if (databaseSchema == null || databaseSchema.isEmpty()
				|| EpCommonConstants.MASTER_DATABASE.equals(databaseSchema)) {
			throw new IllegalStateException("Cannot reset master database");
		}

		entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

		List<?> tableResults = entityManager
			.createNativeQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = :schema "
					+ "AND table_type = 'BASE TABLE' "
					+ "AND LOWER(table_name) NOT IN ('databasechangelog', 'databasechangeloglock')")
			.setParameter("schema", databaseSchema)
			.getResultList();

		List<String> tables = tableResults.stream().map(Object::toString).toList();

		for (String table : tables) {
			entityManager.createNativeQuery("TRUNCATE TABLE `" + table + "`").executeUpdate();
		}

		entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
	}

}
