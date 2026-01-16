package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.community.common.model.User_;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AddressBook_;
import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.model.TemplateEnvelope_;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeFilterDto;
import com.skapp.enterprise.esignature.repository.TemplateEnvelopeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.query.QueryUtils;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class TemplateEnvelopeRepositoryImpl implements TemplateEnvelopeRepository {

	private final EntityManager entityManager;

	@Override
	public Page<TemplateEnvelope> findAllTemplateEnvelopesByFilter(TemplateEnvelopeFilterDto templateEnvelopeFilterDto,
			Long userId, boolean isAllEnvelopeTemplates, Pageable pageable) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<TemplateEnvelope> cq = cb.createQuery(TemplateEnvelope.class);
		Root<TemplateEnvelope> root = cq.from(TemplateEnvelope.class);
		Join<TemplateEnvelope, AddressBook> addressBookJoin = root.join(TemplateEnvelope_.owner, JoinType.LEFT);

		String keyword = templateEnvelopeFilterDto.getSearchKeyword();

		List<Predicate> predicates = buildPredicates(templateEnvelopeFilterDto, isAllEnvelopeTemplates, cb, root,
				addressBookJoin, userId);

		cq.where(predicates.toArray(new Predicate[0]));

		List<Order> orderList = new ArrayList<>();

		if (templateEnvelopeFilterDto.getSearchKeyword() != null
				&& !templateEnvelopeFilterDto.getSearchKeyword().isEmpty()) {
			Order sortingOrder = cb
				.asc(cb.selectCase().when(cb.like(cb.lower(root.get(TemplateEnvelope_.NAME)), keyword), 1));
			orderList.add(sortingOrder);
		}
		else {
			cq.distinct(true);
			if (templateEnvelopeFilterDto.getSortKey() != null) {
				orderList.add(templateEnvelopeFilterDto.getSortOrder() == Sort.Direction.ASC
						? cb.asc(root.get(templateEnvelopeFilterDto.getSortKey().name().toLowerCase()))
						: cb.desc(root.get(templateEnvelopeFilterDto.getSortKey().name().toLowerCase())));
			}
		}

		orderList.addAll(QueryUtils.toOrders(pageable.getSort(), root, cb));
		cq.orderBy(orderList);

		TypedQuery<TemplateEnvelope> typedQuery = entityManager.createQuery(cq);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());
		List<TemplateEnvelope> results = typedQuery.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<TemplateEnvelope> countRoot = countQuery.from(TemplateEnvelope.class);
		Join<TemplateEnvelope, AddressBook> countAddressBookJoin = countRoot.join(TemplateEnvelope_.owner,
				JoinType.LEFT);
		List<Predicate> countPredicates = buildPredicates(templateEnvelopeFilterDto, isAllEnvelopeTemplates, cb,
				countRoot, countAddressBookJoin, userId);
		countQuery.select(cb.count(countRoot)).where(countPredicates.toArray(new Predicate[0]));

		Long totalElements = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(results, pageable, totalElements);

	}

	private List<Predicate> buildPredicates(TemplateEnvelopeFilterDto templateEnvelopeFilterDto,
			boolean isAllEnvelopeTemplates, CriteriaBuilder cb, Root<TemplateEnvelope> root,
			Join<TemplateEnvelope, AddressBook> addressBookJoin, Long userId) {

		List<Predicate> predicates = new ArrayList<>();

		if (!isAllEnvelopeTemplates) {
			predicates.add(cb.equal(addressBookJoin.get(AddressBook_.INTERNAL_USER).get(User_.USER_ID), userId));
		}

		String keyword = templateEnvelopeFilterDto.getSearchKeyword();

		if (keyword != null && !keyword.isBlank()) {
			predicates.add(cb.like(cb.lower(root.get(TemplateEnvelope_.NAME)), "%" + keyword.toLowerCase() + "%"));
		}

		return predicates;
	}

}
