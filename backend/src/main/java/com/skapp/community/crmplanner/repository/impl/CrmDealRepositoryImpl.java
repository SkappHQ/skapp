package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.Auditable_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.repository.CrmDealRepository;
import com.skapp.community.crmplanner.type.CrmContactDealMetrics;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import com.skapp.community.crmplanner.model.CrmDealStage;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

		CriteriaQuery<Long> idQuery = cb.createQuery(Long.class);
		Root<CrmDeal> dealRoot = idQuery.from(CrmDeal.class);
		idQuery.select(dealRoot.get(CrmDeal_.id));
		idQuery.where(buildStagePredicates(cb, dealRoot, stageId, requestDto).toArray(new Predicate[0]));
		idQuery.orderBy(cb.desc(dealRoot.get(Auditable_.createdDate)), cb.desc(dealRoot.get(CrmDeal_.id)));

		TypedQuery<Long> idTypedQuery = entityManager.createQuery(idQuery);
		idTypedQuery.setFirstResult((int) pageable.getOffset());
		idTypedQuery.setMaxResults(pageable.getPageSize());
		List<Long> dealIds = idTypedQuery.getResultList();

		if (dealIds.isEmpty()) {
			CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
			Root<CrmDeal> countRoot = countQuery.from(CrmDeal.class);
			countQuery.select(cb.count(countRoot))
				.where(buildStagePredicates(cb, countRoot, stageId, requestDto).toArray(new Predicate[0]));
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
		fetchQuery.orderBy(cb.desc(deal.get(Auditable_.createdDate)), cb.desc(deal.get(CrmDeal_.id)));

		List<CrmDeal> deals = entityManager.createQuery(fetchQuery).getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmDeal> countRoot = countQuery.from(CrmDeal.class);
		countQuery.select(cb.count(countRoot))
			.where(buildStagePredicates(cb, countRoot, stageId, requestDto).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

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

	@Override
	public Page<CrmDeal> findDealsByStageId(Long stageId, CrmDealsByStagesRequestDto requestDto, Pageable pageable,
			long preComputedTotal) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> idQuery = cb.createQuery(Long.class);
		Root<CrmDeal> dealRoot = idQuery.from(CrmDeal.class);
		idQuery.select(dealRoot.get(CrmDeal_.id));
		idQuery.where(buildStagePredicates(cb, dealRoot, stageId, requestDto).toArray(new Predicate[0]));
		idQuery.orderBy(cb.desc(dealRoot.get(Auditable_.createdDate)), cb.desc(dealRoot.get(CrmDeal_.id)));

		TypedQuery<Long> idTypedQuery = entityManager.createQuery(idQuery);
		idTypedQuery.setFirstResult((int) pageable.getOffset());
		idTypedQuery.setMaxResults(pageable.getPageSize());
		List<Long> dealIds = idTypedQuery.getResultList();

		if (dealIds.isEmpty()) {
			return new PageImpl<>(new ArrayList<>(), pageable, preComputedTotal);
		}

		CriteriaQuery<CrmDeal> fetchQuery = cb.createQuery(CrmDeal.class);
		Root<CrmDeal> deal = fetchQuery.from(CrmDeal.class);

		deal.fetch(CrmDeal_.stage, JoinType.LEFT);
		deal.fetch(CrmDeal_.company, JoinType.LEFT);
		deal.fetch(CrmDeal_.contact, JoinType.LEFT);
		deal.fetch(CrmDeal_.owner, JoinType.LEFT);

		fetchQuery.select(deal).where(deal.get(CrmDeal_.id).in(dealIds));
		fetchQuery.orderBy(cb.desc(deal.get(Auditable_.createdDate)), cb.desc(deal.get(CrmDeal_.id)));

		List<CrmDeal> deals = entityManager.createQuery(fetchQuery).getResultList();
		return new PageImpl<>(deals, pageable, preComputedTotal);
	}

	@Override
	public Map<Long, Long> countDealsByStageIds(List<Long> stageIds, CrmDealsByStagesRequestDto requestDto) {
		if (stageIds == null || stageIds.isEmpty()) {
			return Collections.emptyMap();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmDeal> deal = query.from(CrmDeal.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(deal.get(CrmDeal_.stage).get(CrmDealStage_.id).in(stageIds));
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

		query.select(cb.tuple(deal.get(CrmDeal_.stage).get(CrmDealStage_.id).alias("stageId"),
				cb.count(deal.get(CrmDeal_.id)).alias("cnt")));
		query.where(predicates.toArray(new Predicate[0]));
		query.groupBy(deal.get(CrmDeal_.stage).get(CrmDealStage_.id));

		Map<Long, Long> counts = new HashMap<>();
		entityManager.createQuery(query)
			.getResultList()
			.forEach(t -> counts.put(t.get("stageId", Long.class), t.get("cnt", Long.class)));
		return counts;
	}

	public List<CrmDeal> findByContactIdWithAssociations(Long contactId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmDeal> query = cb.createQuery(CrmDeal.class);
		Root<CrmDeal> deal = query.from(CrmDeal.class);
		deal.fetch(CrmDeal_.stage, JoinType.INNER);
		deal.fetch(CrmDeal_.owner, JoinType.INNER);

		query.where(cb.equal(deal.get(CrmDeal_.contact).get(CrmContact_.id), contactId),
				cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
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

	@Override
	public CrmContactDealMetrics findDealMetricsByContactId(Long contactId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContactDealMetrics> query = cb.createQuery(CrmContactDealMetrics.class);
		Root<CrmDeal> deal = query.from(CrmDeal.class);
		Join<CrmDeal, CrmDealStage> stage = deal.join(CrmDeal_.stage, JoinType.INNER);

		Expression<BigDecimal> totalRevenue = cb.coalesce(cb.sum(cb.<BigDecimal>selectCase()
			.when(cb.equal(stage.get(CrmDealStage_.stageType), CrmDealStageType.WON),
					deal.get(CrmDeal_.amount).cast(BigDecimal.class))
			.otherwise(BigDecimal.ZERO)), BigDecimal.ZERO);

		Expression<BigDecimal> pipelineRevenue = cb.coalesce(cb.sum(cb.<BigDecimal>selectCase()
			.when(cb.or(cb.equal(stage.get(CrmDealStage_.stageType), CrmDealStageType.OPEN),
					cb.equal(stage.get(CrmDealStage_.stageType), CrmDealStageType.INITIAL)),
					deal.get(CrmDeal_.amount).cast(BigDecimal.class))
			.otherwise(BigDecimal.ZERO)), BigDecimal.ZERO);

		Expression<Long> activeDealsCount = cb.coalesce(cb.sum(cb.<Long>selectCase()
			.when(cb.or(cb.equal(stage.get(CrmDealStage_.stageType), CrmDealStageType.OPEN),
					cb.equal(stage.get(CrmDealStage_.stageType), CrmDealStageType.INITIAL)), 1L)
			.otherwise(0L)), 0L);

		query.select(cb.construct(CrmContactDealMetrics.class, totalRevenue, pipelineRevenue, activeDealsCount));

		query.where(cb.equal(deal.get(CrmDeal_.contact).get(CrmContact_.id), contactId),
				cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		return entityManager.createQuery(query).getSingleResult();
	}

}
