package com.skapp.enterprise.people.repository.impl;

import com.skapp.community.common.model.Auditable_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.enterprise.people.model.EmployeeTimeline;
import com.skapp.enterprise.people.model.EmployeeTimeline_;
import com.skapp.enterprise.people.repository.EpEmployeeTimelineRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class EpEmployeeTimelineRepositoryImpl implements EpEmployeeTimelineRepository {

	private final EntityManager entityManager;

	@Override
	public List<EmployeeTimeline> findAllByEmployeeIdWithRecordedBy(Long employeeId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeTimeline> query = cb.createQuery(EmployeeTimeline.class);
		Root<EmployeeTimeline> root = query.from(EmployeeTimeline.class);

		root.fetch(EmployeeTimeline_.recordedBy, JoinType.LEFT);

		query.select(root)
			.where(cb.equal(root.get(EmployeeTimeline_.employee).get(Employee_.employeeId), employeeId))
			.orderBy(cb.desc(root.get(Auditable_.createdDate)));

		TypedQuery<EmployeeTimeline> typedQuery = entityManager.createQuery(query);
		return typedQuery.getResultList();
	}

}
