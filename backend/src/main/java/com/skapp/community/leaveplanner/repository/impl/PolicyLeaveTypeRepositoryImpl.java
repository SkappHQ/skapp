package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.common.util.StringUtils;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.model.PolicyLeaveType_;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeFilterDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PolicyLeaveTypeRepositoryImpl implements PolicyLeaveTypeRepository {

	private final EntityManager entityManager;

	@Override
	public Page<PolicyLeaveType> findPolicyLeaveTypes(PolicyLeaveTypeFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveType> query = cb.createQuery(PolicyLeaveType.class);
		Root<PolicyLeaveType> root = query.from(PolicyLeaveType.class);

		query.select(root).where(buildPredicates(cb, root, filterDto).toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(root.get(PolicyLeaveType_.name))));

		TypedQuery<PolicyLeaveType> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		List<PolicyLeaveType> content = typedQuery.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<PolicyLeaveType> countRoot = countQuery.from(PolicyLeaveType.class);
		countQuery.select(cb.count(countRoot))
			.where(buildPredicates(cb, countRoot, filterDto).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<PolicyLeaveType> root,
			PolicyLeaveTypeFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.toLowerCase());
			predicates.add(cb.like(cb.lower(root.get(PolicyLeaveType_.name)), "%" + escaped + "%", '\\'));
		}

		if (filterDto.getIsActive() != null) {
			predicates.add(cb.equal(root.get(PolicyLeaveType_.isActive), filterDto.getIsActive()));
		}

		return predicates;
	}

}
