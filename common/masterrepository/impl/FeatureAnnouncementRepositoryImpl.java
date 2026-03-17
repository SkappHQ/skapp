package com.skapp.enterprise.common.masterrepository.impl;

import com.skapp.enterprise.common.masterrepository.FeatureAnnouncementRepository;
import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FeatureAnnouncementRepositoryImpl implements FeatureAnnouncementRepository {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public List<FeatureAnnouncement> findAllByStatusOrderByCreatedDateDesc(AnnouncementStatus status) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<FeatureAnnouncement> query = cb.createQuery(FeatureAnnouncement.class);
		Root<FeatureAnnouncement> root = query.from(FeatureAnnouncement.class);

		root.fetch("recipients", JoinType.LEFT);
		query.distinct(true);
		query.where(cb.equal(root.get("status"), status));
		query.orderBy(cb.desc(root.get("createdDate")));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public List<FeatureAnnouncement> findAllWithRecipientsByIdIn(List<Long> ids) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<FeatureAnnouncement> query = cb.createQuery(FeatureAnnouncement.class);
		Root<FeatureAnnouncement> root = query.from(FeatureAnnouncement.class);

		root.fetch("recipients", JoinType.LEFT);
		query.distinct(true);
		query.where(root.get("announcementId").in(ids));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public Page<FeatureAnnouncement> findAllWithRecipients(Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		// Main query with fetch join for recipients
		CriteriaQuery<FeatureAnnouncement> query = cb.createQuery(FeatureAnnouncement.class);
		Root<FeatureAnnouncement> root = query.from(FeatureAnnouncement.class);
		root.fetch("recipients", JoinType.LEFT);
		query.distinct(true);

		TypedQuery<FeatureAnnouncement> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());
		List<FeatureAnnouncement> results = typedQuery.getResultList();

		// Count query without fetch join
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<FeatureAnnouncement> countRoot = countQuery.from(FeatureAnnouncement.class);
		countQuery.select(cb.count(countRoot));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(results, pageable, total);
	}

}
