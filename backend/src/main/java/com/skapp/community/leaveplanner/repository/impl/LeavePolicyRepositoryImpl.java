package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.common.util.StringUtils;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.model.PolicyLeaveType_;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.repository.LeavePolicyRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LeavePolicyRepositoryImpl implements LeavePolicyRepository {

	private final EntityManager entityManager;

	@Override
	public Page<LeavePolicy> findLeavePolicies(LeavePolicyFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeavePolicy> query = cb.createQuery(LeavePolicy.class);
		Root<LeavePolicy> root = query.from(LeavePolicy.class);
		root.fetch(LeavePolicy_.leaveType, JoinType.LEFT);

		query.select(root).where(buildPredicates(cb, root, filterDto).toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(root.get(LeavePolicy_.name))));

		TypedQuery<LeavePolicy> typedQuery = entityManager.createQuery(query);
		if (pageable.isPaged()) {
			typedQuery.setFirstResult((int) pageable.getOffset());
			typedQuery.setMaxResults(pageable.getPageSize());
		}

		List<LeavePolicy> content = typedQuery.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<LeavePolicy> countRoot = countQuery.from(LeavePolicy.class);
		countQuery.select(cb.count(countRoot))
			.where(buildPredicates(cb, countRoot, filterDto).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<LeavePolicy> root,
			LeavePolicyFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.toLowerCase());
			predicates.add(cb.like(cb.lower(root.get(LeavePolicy_.name)), "%" + escaped + "%", '\\'));
		}

		if (filterDto.getLeaveTypeId() != null) {
			predicates
				.add(cb.equal(root.get(LeavePolicy_.leaveType).get(PolicyLeaveType_.id), filterDto.getLeaveTypeId()));
		}

		return predicates;
	}

}
