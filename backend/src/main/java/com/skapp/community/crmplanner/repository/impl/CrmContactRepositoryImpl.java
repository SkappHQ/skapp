package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.repository.CrmContactRepository;
import com.skapp.community.crmplanner.type.CrmContactSort;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmContactRepositoryImpl implements CrmContactRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmContact> findContacts(CrmContactFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContact> query = cb.createQuery(CrmContact.class);
		Root<CrmContact> contact = query.from(CrmContact.class);
		Join<CrmContact, CrmCompany> company = contact.join("company", JoinType.LEFT);
		Join<CrmContact, Employee> owner = contact.join("owner", JoinType.INNER);

		List<Predicate> predicates = buildPredicates(cb, contact, company, owner, filterDto);
		query.where(predicates.toArray(new Predicate[0]));

		List<Order> orderList = new ArrayList<>();
		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String likePattern = "%" + searchKeyword.trim().toLowerCase() + "%";
			orderList.add(cb.asc(cb.selectCase()
				.when(cb.like(cb.lower(contact.get("name")), likePattern), 1)
				.when(cb.like(cb.lower(owner.get("firstName")), likePattern), 2)
				.when(cb.like(cb.lower(owner.get("lastName")), likePattern), 3)
				.otherwise(4)));
		}
		orderList.add(buildSortOrder(cb, contact, company, query, filterDto));
		query.orderBy(orderList);

		TypedQuery<CrmContact> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getTotalCount(cb, filterDto));
	}

	private Order buildSortOrder(CriteriaBuilder cb, Root<CrmContact> contact,
			Join<CrmContact, CrmCompany> company, CriteriaQuery<CrmContact> query,
			CrmContactFilterDto filterDto) {
		CrmContactSort sortKey = filterDto.getSortKey();
		boolean isAsc = filterDto.getSortOrder() == Sort.Direction.ASC;

		Expression<?> sortExpression;
		if (sortKey == CrmContactSort.DEAL_VALUE) {
			Subquery<Double> dealValueSub = query.subquery(Double.class);
			Root<CrmDeal> dealRoot = dealValueSub.from(CrmDeal.class);
			Join<CrmDeal, CrmDealStage> stageJoin = dealRoot.join("stage");
			dealValueSub
				.select(cb.coalesce(cb.sum(dealRoot.get("amount").as(Double.class)), 0.0))
				.where(cb.equal(dealRoot.get("contact").get("id"), contact.get("id")),
						cb.equal(stageJoin.get("stageType"), CrmDealStageType.WON),
						cb.isFalse(dealRoot.<Boolean>get("isDeleted")));
			sortExpression = dealValueSub;
		}
		else {
			sortExpression = contact.get(sortKey.getSortField());
		}

		return isAsc ? cb.asc(sortExpression) : cb.desc(sortExpression);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<CrmContact> contact,
			Join<CrmContact, CrmCompany> company, Join<CrmContact, Employee> owner,
			CrmContactFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(contact.<Boolean>get("isDeleted")));

		List<Long> companyIds = filterDto.getCompanyIds();
		if (companyIds != null && !companyIds.isEmpty()) {
			predicates.add(company.get("id").in(companyIds));
		}

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String likePattern = "%" + searchKeyword.trim().toLowerCase() + "%";
			predicates.add(cb.or(cb.like(cb.lower(contact.get("name")), likePattern),
					cb.like(cb.lower(owner.get("firstName")), likePattern),
					cb.like(cb.lower(owner.get("lastName")), likePattern)));
		}

		return predicates;
	}

	private Long getTotalCount(CriteriaBuilder cb, CrmContactFilterDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmContact> contact = countQuery.from(CrmContact.class);
		Join<CrmContact, CrmCompany> company = contact.join("company", JoinType.LEFT);
		Join<CrmContact, Employee> owner = contact.join("owner", JoinType.INNER);
		countQuery.select(cb.count(contact));

		List<Predicate> predicates = buildPredicates(cb, contact, company, owner, filterDto);
		countQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

	@Override
	public Page<CrmContact> findContactsForLookup(String searchKeyword, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContact> query = cb.createQuery(CrmContact.class);
		Root<CrmContact> contact = query.from(CrmContact.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(contact.get("isDeleted")));

		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String likePattern = "%" + searchKeyword.trim().toLowerCase() + "%";
			predicates.add(cb.or(cb.like(cb.lower(contact.get("name")), likePattern),
					cb.like(cb.lower(contact.get("email")), likePattern)));
		}

		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(contact.get("name")));

		TypedQuery<CrmContact> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		List<CrmContact> contacts = typedQuery.getResultList();
		Long totalCount = getTotalCountForLookup(cb, searchKeyword);

		return new PageImpl<>(contacts, pageable, totalCount);
	}

	private Long getTotalCountForLookup(CriteriaBuilder cb, String searchKeyword) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmContact> contact = countQuery.from(CrmContact.class);
		countQuery.select(cb.count(contact));

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(contact.get("isDeleted")));

		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String likePattern = "%" + searchKeyword.trim().toLowerCase() + "%";
			predicates.add(cb.or(cb.like(cb.lower(contact.get("name")), likePattern),
					cb.like(cb.lower(contact.get("email")), likePattern)));
		}

		countQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

}
