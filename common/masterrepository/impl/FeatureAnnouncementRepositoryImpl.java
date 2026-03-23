package com.skapp.enterprise.common.masterrepository.impl;

import com.skapp.community.common.model.Auditable_;
import com.skapp.enterprise.common.masterrepository.FeatureAnnouncementRepository;
import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.model.master.FeatureAnnouncement_;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FeatureAnnouncementRepositoryImpl implements FeatureAnnouncementRepository {

	private final EntityManager entityManager;

	@Override
	public List<FeatureAnnouncement> findAllByStatusOrderByCreatedDateDesc(AnnouncementStatus status) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<FeatureAnnouncement> query = cb.createQuery(FeatureAnnouncement.class);
		Root<FeatureAnnouncement> root = query.from(FeatureAnnouncement.class);

		query.where(cb.equal(root.get(FeatureAnnouncement_.status), status));
		query.orderBy(cb.desc(root.get(Auditable_.createdDate)));

		return entityManager.createQuery(query).getResultList();
	}

}
