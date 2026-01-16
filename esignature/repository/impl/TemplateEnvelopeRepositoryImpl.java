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
			Long userId, boolean isAllTemplateEnvelopes, Pageable pageable) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<TemplateEnvelope> cq = cb.createQuery(TemplateEnvelope.class);
		Root<TemplateEnvelope> root = cq.from(TemplateEnvelope.class);
		Join<TemplateEnvelope, AddressBook> addressBookJoin = root.join(TemplateEnvelope_.owner, JoinType.LEFT);

		List<Predicate> predicates = new ArrayList<>();

		if (!isAllTemplateEnvelopes) {
			predicates.add(cb.equal(addressBookJoin.get(AddressBook_.INTERNAL_USER).get(User_.USER_ID), userId));
		}

		String keyword = templateEnvelopeFilterDto.getSearchKeyword();

		if (keyword != null && !keyword.isBlank()) {
			predicates.add(cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
		}

		cq.where(predicates.toArray(new Predicate[0]));

		List<Order> orderList = new ArrayList<>();

		if (templateEnvelopeFilterDto.getSearchKeyword() != null
				&& !templateEnvelopeFilterDto.getSearchKeyword().isEmpty()) {
			Order sortingOrder = cb.asc(cb.selectCase().when(cb.like(cb.lower(root.get("name")), keyword), 1));
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

		TypedQuery<TemplateEnvelope> query = entityManager.createQuery(cq);

		int totalRows = query.getResultList().size();

		if (pageable.isPaged()) {
			query.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());
			query.setMaxResults(pageable.getPageSize());
		}

		return new PageImpl<>(query.getResultList(), pageable, totalRows);

	}

}
