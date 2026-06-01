package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.Auditable_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.repository.CrmDealRepository;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmDealRepositoryImpl implements CrmDealRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmDeal> findDeals(CrmDealFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> idQuery = cb.createQuery(Long.class);
		Root<CrmDeal> dealRoot = idQuery.from(CrmDeal.class);
		idQuery.select(dealRoot.get(CrmDeal_.id));
		idQuery.where(buildPredicates(cb, dealRoot, filterDto).toArray(new Predicate[0]));

		idQuery.orderBy(cb.asc(dealRoot.get(CrmDeal_.stage).get(CrmDealStage_.orderIndex)));

		TypedQuery<Long> idTypedQuery = entityManager.createQuery(idQuery);
		idTypedQuery.setFirstResult((int) pageable.getOffset());
		idTypedQuery.setMaxResults(pageable.getPageSize());
		List<Long> dealIds = idTypedQuery.getResultList();

		if (dealIds.isEmpty()) {
			CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
			Root<CrmDeal> countRoot = countQuery.from(CrmDeal.class);
			countQuery.select(cb.count(countRoot))
				.where(buildPredicates(cb, countRoot, filterDto).toArray(new Predicate[0]));
			Long total = entityManager.createQuery(countQuery).getSingleResult();
			return new PageImpl<>(new ArrayList<>(), pageable, total);
		}

		CriteriaQuery<CrmDeal> fetchQuery = cb.createQuery(CrmDeal.class);
		Root<CrmDeal> deal = fetchQuery.from(CrmDeal.class);

		deal.fetch(CrmDeal_.stage, JoinType.LEFT);
		deal.fetch(CrmDeal_.company, JoinType.LEFT);
		deal.fetch(CrmDeal_.contact, JoinType.LEFT);
		deal.fetch(CrmDeal_.owner, JoinType.LEFT);

		fetchQuery.select(deal).where(deal.get(CrmDeal_.id).in(dealIds));

		fetchQuery.orderBy(cb.asc(deal.get(CrmDeal_.stage).get(CrmDealStage_.orderIndex)));

		List<CrmDeal> deals = entityManager.createQuery(fetchQuery).getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmDeal> countRoot = countQuery.from(CrmDeal.class);
		countQuery.select(cb.count(countRoot))
			.where(buildPredicates(cb, countRoot, filterDto).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(deals, pageable, total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<CrmDeal> deal, CrmDealFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.equal(deal.get(CrmDeal_.isDeleted), false));

		if (filterDto.getSearchKeyword() != null && !filterDto.getSearchKeyword().isBlank()) {
			String keyword = "%" + filterDto.getSearchKeyword().toLowerCase() + "%";
			Join<CrmDeal, CrmContact> contactJoin = deal.join(CrmDeal_.contact, JoinType.LEFT);
			Join<CrmDeal, Employee> ownerJoin = deal.join(CrmDeal_.owner, JoinType.LEFT);
			predicates.add(cb.or(cb.like(cb.lower(deal.get(CrmDeal_.name)), keyword),
					cb.like(cb.lower(contactJoin.get(CrmContact_.name)), keyword),
					cb.like(cb.lower(ownerJoin.get(Employee_.firstName)), keyword),
					cb.like(cb.lower(ownerJoin.get(Employee_.lastName)), keyword),
					cb.like(cb.lower(cb.concat(cb.concat(ownerJoin.get(Employee_.firstName), " "),
							ownerJoin.get(Employee_.lastName))), keyword)));
		}

		if (filterDto.getStageId() != null) {
			predicates.add(cb.equal(deal.get(CrmDeal_.stage).get(CrmDealStage_.id), filterDto.getStageId()));
		}

		if (filterDto.getPriority() != null) {
			predicates.add(cb.equal(deal.get(CrmDeal_.priority), filterDto.getPriority()));
		}

		return predicates;
	}

	@Override
	public Page<CrmDeal> findDealsByStageId(Long stageId, CrmDealsByStagesRequestDto requestDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmDeal> countRoot = countQuery.from(CrmDeal.class);
		countQuery.select(cb.count(countRoot))
			.where(buildStagePredicates(cb, countRoot, stageId, requestDto).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		CriteriaQuery<CrmDeal> fetchQuery = cb.createQuery(CrmDeal.class);
		Root<CrmDeal> deal = fetchQuery.from(CrmDeal.class);

		deal.fetch(CrmDeal_.stage, JoinType.LEFT);
		deal.fetch(CrmDeal_.company, JoinType.LEFT);
		deal.fetch(CrmDeal_.contact, JoinType.LEFT);
		deal.fetch(CrmDeal_.owner, JoinType.LEFT);

		fetchQuery.select(deal).where(buildStagePredicates(cb, deal, stageId, requestDto).toArray(new Predicate[0]));
		fetchQuery.orderBy(cb.desc(deal.get(Auditable_.createdDate)));

		TypedQuery<CrmDeal> typedQuery = entityManager.createQuery(fetchQuery);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		List<CrmDeal> deals = typedQuery.getResultList();
		return new PageImpl<>(deals, pageable, total);
	}

	private List<Predicate> buildStagePredicates(CriteriaBuilder cb, Root<CrmDeal> deal, Long stageId,
			CrmDealsByStagesRequestDto requestDto) {
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.equal(deal.get(CrmDeal_.stage).get(CrmDealStage_.id), stageId));
		predicates.add(cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		if (requestDto.getSearchKeyword() != null && !requestDto.getSearchKeyword().isBlank()) {
			String keyword = "%" + requestDto.getSearchKeyword().toLowerCase() + "%";
			Join<CrmDeal, CrmContact> contactJoin = deal.join(CrmDeal_.contact, JoinType.LEFT);
			Join<CrmDeal, Employee> ownerJoin = deal.join(CrmDeal_.owner, JoinType.LEFT);
			predicates.add(cb.or(cb.like(cb.lower(deal.get(CrmDeal_.name)), keyword),
					cb.like(cb.lower(contactJoin.get(CrmContact_.name)), keyword),
					cb.like(cb.lower(ownerJoin.get(Employee_.firstName)), keyword),
					cb.like(cb.lower(ownerJoin.get(Employee_.lastName)), keyword),
					cb.like(cb.lower(cb.concat(cb.concat(ownerJoin.get(Employee_.firstName), " "),
							ownerJoin.get(Employee_.lastName))), keyword)));
		}

		return predicates;
	}

	public List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds) {
		if (contactIds == null || contactIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmDealSummary> query = cb.createQuery(CrmDealSummary.class);
		Root<CrmDeal> deal = query.from(CrmDeal.class);
		Join<CrmDeal, CrmDealStage> stage = deal.join(CrmDeal_.stage, JoinType.INNER);

		query.select(cb.construct(CrmDealSummary.class, deal.get(CrmDeal_.contact).get(CrmContact_.id),
				cb.coalesce(cb.sum(deal.get(CrmDeal_.amount).cast(BigDecimal.class)), BigDecimal.ZERO),
				cb.count(deal.get(CrmDeal_.id))));

		query.where(deal.get(CrmDeal_.contact).get(CrmContact_.id).in(contactIds),
				cb.equal(stage.get(CrmDealStage_.stageType), CrmDealStageType.WON),
				cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		query.groupBy(deal.get(CrmDeal_.contact).get(CrmContact_.id));

		return entityManager.createQuery(query).getResultList();
	}

}
