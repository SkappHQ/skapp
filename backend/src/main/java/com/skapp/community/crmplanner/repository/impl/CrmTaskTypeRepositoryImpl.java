package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.model.CrmTaskType_;
import com.skapp.community.crmplanner.repository.CrmTaskTypeRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.hibernate.query.criteria.JpaCriteriaInsertValues;
import org.hibernate.query.criteria.JpaRoot;
import org.hibernate.query.criteria.JpaValues;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmTaskTypeRepositoryImpl implements CrmTaskTypeRepository {

	private final EntityManager entityManager;

	@Override
	public void insertAll(List<CrmTaskType> taskTypes) {
		Session session = entityManager.unwrap(Session.class);
		HibernateCriteriaBuilder cb = session.getCriteriaBuilder();
		JpaCriteriaInsertValues<CrmTaskType> insert = cb.createCriteriaInsertValues(CrmTaskType.class);
		JpaRoot<CrmTaskType> taskType = insert.getTarget();

		insert.setInsertionTargetPaths(taskType.get(CrmTaskType_.name), taskType.get(CrmTaskType_.orderIndex));
		insert.values(taskTypes.stream().map(row -> toInsertValues(cb, row)).toList());

		session.createMutationQuery(insert).executeUpdate();
	}

	private JpaValues toInsertValues(HibernateCriteriaBuilder cb, CrmTaskType taskType) {
		return cb.values(cb.value(taskType.getName()), cb.value(taskType.getOrderIndex()));
	}

}
