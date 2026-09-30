package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.Auditable_;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.model.CrmIndustry_;
import com.skapp.community.crmplanner.repository.CrmIndustryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Path;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.hibernate.query.criteria.JpaCriteriaInsertValues;
import org.hibernate.query.criteria.JpaRoot;
import org.hibernate.query.criteria.JpaValues;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmIndustryRepositoryImpl implements CrmIndustryRepository {

	private final EntityManager entityManager;

	@Override
	public void insertAll(List<CrmIndustry> industries) {
		LocalDateTime now = DateTimeUtils.getCurrentUtcDateTime();
		Session session = entityManager.unwrap(Session.class);
		HibernateCriteriaBuilder cb = session.getCriteriaBuilder();
		JpaCriteriaInsertValues<CrmIndustry> insert = cb.createCriteriaInsertValues(CrmIndustry.class);
		JpaRoot<CrmIndustry> industry = insert.getTarget();
		Path<LocalDateTime> createdDate = industry.get(Auditable_.createdDate);
		Path<LocalDateTime> lastModifiedDate = industry.get(Auditable_.lastModifiedDate);

		insert.setInsertionTargetPaths(industry.get(CrmIndustry_.name), industry.get(CrmIndustry_.isDeleted),
				createdDate, lastModifiedDate);
		insert.values(industries.stream().map(row -> toInsertValues(cb, row, now)).toList());

		session.createMutationQuery(insert).executeUpdate();
	}

	private JpaValues toInsertValues(HibernateCriteriaBuilder cb, CrmIndustry industry, LocalDateTime now) {
		return cb.values(cb.value(industry.getName()), cb.value(industry.getIsDeleted()), cb.value(now), cb.value(now));
	}

}
