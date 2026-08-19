package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.Auditable_;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTask_;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactMetricsResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmContactRepository;
import com.skapp.community.crmplanner.type.CrmContactMetrics;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Fetch;
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
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CrmContactRepositoryImpl implements CrmContactRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmContact> findContacts(CrmContactMetricRequestDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContact> query = cb.createQuery(CrmContact.class);
		Root<CrmContact> contact = query.from(CrmContact.class);
		Fetch<CrmContact, Employee> ownerFetch = contact.fetch(CrmContact_.owner, JoinType.INNER);
		ownerFetch.fetch(Employee_.user, JoinType.LEFT);
		Join<CrmContact, Employee> owner = (Join<CrmContact, Employee>) ownerFetch;
		Join<CrmContact, CrmCompany> company = (Join<CrmContact, CrmCompany>) contact.fetch(CrmContact_.company,
				JoinType.LEFT);

		query.where(buildPredicates(cb, contact, owner, company, filterDto));
		query.orderBy(buildOrderBy(cb, contact, query));

		TypedQuery<CrmContact> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getContactTotalCount(cb, filterDto));
	}

	@Override
	public Page<CrmContactMetricsResponseDtoV2> getContactMetricsV2(CrmContactMetricRequestDto filterDto,
			Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContactMetricsResponseDtoV2> query = cb.createQuery(CrmContactMetricsResponseDtoV2.class);
		Root<CrmContact> contact = query.from(CrmContact.class);
		Join<CrmContact, Employee> owner = contact.join(CrmContact_.owner, JoinType.INNER);
		Join<CrmContact, CrmCompany> company = contact.join(CrmContact_.company, JoinType.LEFT);

		Subquery<BigDecimal> closedValueSub = query.subquery(BigDecimal.class);
		Root<CrmDeal> valueDeal = closedValueSub.from(CrmDeal.class);
		closedValueSub
			.select(cb.coalesce(cb.sum(valueDeal.get(CrmDeal_.amount).cast(BigDecimal.class)), BigDecimal.ZERO))
			.where(cb.equal(valueDeal.get(CrmDeal_.contact), contact),
					cb.equal(valueDeal.get(CrmDeal_.stage).get(CrmDealStage_.stageType), CrmDealStageType.WON),
					cb.isFalse(valueDeal.get(CrmDeal_.isDeleted)));

		Subquery<Long> closedCountSub = query.subquery(Long.class);
		Root<CrmDeal> countDeal = closedCountSub.from(CrmDeal.class);
		closedCountSub.select(cb.count(countDeal.get(CrmDeal_.id)))
			.where(cb.equal(countDeal.get(CrmDeal_.contact), contact),
					cb.equal(countDeal.get(CrmDeal_.stage).get(CrmDealStage_.stageType), CrmDealStageType.WON),
					cb.isFalse(countDeal.get(CrmDeal_.isDeleted)));

		Subquery<Long> openTaskSub = query.subquery(Long.class);
		Root<CrmTask> openTask = openTaskSub.from(CrmTask.class);
		openTaskSub.select(cb.count(openTask.get(CrmTask_.id)))
			.where(cb.equal(openTask.get(CrmTask_.contact), contact), cb.isFalse(openTask.get(CrmTask_.isCompleted)),
					cb.isFalse(openTask.get(CrmTask_.isDeleted)));

		Subquery<Long> overdueTaskSub = query.subquery(Long.class);
		Root<CrmTask> overdueTask = overdueTaskSub.from(CrmTask.class);
		overdueTaskSub.select(cb.count(overdueTask.get(CrmTask_.id)))
			.where(cb.equal(overdueTask.get(CrmTask_.contact), contact),
					cb.isFalse(overdueTask.get(CrmTask_.isCompleted)), cb.isFalse(overdueTask.get(CrmTask_.isDeleted)),
					cb.isNotNull(overdueTask.get(CrmTask_.dueAt)),
					cb.lessThan(overdueTask.get(CrmTask_.dueAt), cb.literal(LocalDate.now().atStartOfDay())));

		query.select(cb.construct(CrmContactMetricsResponseDtoV2.class, contact.get(CrmContact_.id),
				contact.get(CrmContact_.name), contact.get(CrmContact_.email), contact.get(CrmContact_.contactNumber),
				contact.get(CrmContact_.lastContactAt), contact.get(Auditable_.lastModifiedDate),
				cb.construct(CrmCompanyResponseDto.class, company.get(CrmCompany_.id), company.get(CrmCompany_.name),
						company.get(CrmCompany_.industry), company.get(CrmCompany_.website),
						company.get(CrmCompany_.address), company.get(CrmCompany_.contactNumber)),
				cb.construct(CrmOwnerResponseDto.class, owner.get(Employee_.employeeId), owner.get(Employee_.firstName),
						owner.get(Employee_.lastName), owner.get(Employee_.authPic)),
				cb.construct(CrmContactMetrics.class, closedValueSub.cast(String.class), closedCountSub, openTaskSub,
						overdueTaskSub)));

		query.where(buildPredicates(cb, contact, owner, company, filterDto));
		query.orderBy(buildOrderBy(cb, contact, query));

		List<CrmContactMetricsResponseDtoV2> content = entityManager.createQuery(query)
			.setFirstResult((int) pageable.getOffset())
			.setMaxResults(pageable.getPageSize())
			.getResultList();

		return new PageImpl<>(content, pageable, getContactTotalCount(cb, filterDto));
	}

	@Override
	public Optional<CrmContactMetrics> getContactMetricsById(Long contactId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContactMetrics> query = cb.createQuery(CrmContactMetrics.class);
		Root<CrmContact> contact = query.from(CrmContact.class);

		Subquery<BigDecimal> closedValueSub = query.subquery(BigDecimal.class);
		Root<CrmDeal> valueDeal = closedValueSub.from(CrmDeal.class);
		closedValueSub
			.select(cb.coalesce(cb.sum(valueDeal.get(CrmDeal_.amount).cast(BigDecimal.class)), BigDecimal.ZERO))
			.where(cb.equal(valueDeal.get(CrmDeal_.contact), contact),
					cb.equal(valueDeal.get(CrmDeal_.stage).get(CrmDealStage_.stageType), CrmDealStageType.WON),
					cb.isFalse(valueDeal.get(CrmDeal_.isDeleted)));

		Subquery<Long> closedCountSub = query.subquery(Long.class);
		Root<CrmDeal> countDeal = closedCountSub.from(CrmDeal.class);
		closedCountSub.select(cb.count(countDeal.get(CrmDeal_.id)))
			.where(cb.equal(countDeal.get(CrmDeal_.contact), contact),
					cb.equal(countDeal.get(CrmDeal_.stage).get(CrmDealStage_.stageType), CrmDealStageType.WON),
					cb.isFalse(countDeal.get(CrmDeal_.isDeleted)));

		Subquery<Long> openTaskSub = query.subquery(Long.class);
		Root<CrmTask> openTask = openTaskSub.from(CrmTask.class);
		Join<CrmTask, CrmContact> openDirectContact = openTask.join(CrmTask_.contact, JoinType.LEFT);
		Join<CrmTask, CrmDeal> openTaskDeal = openTask.join(CrmTask_.deal, JoinType.LEFT);
		Join<CrmDeal, CrmContact> openDealContact = openTaskDeal.join(CrmDeal_.contact, JoinType.LEFT);
		openTaskSub.select(cb.count(openTask.get(CrmTask_.id)))
			.where(cb.or(cb.equal(openDirectContact.get(CrmContact_.id), contactId),
					cb.equal(openDealContact.get(CrmContact_.id), contactId)),
					cb.isFalse(openTask.get(CrmTask_.isCompleted)), cb.isFalse(openTask.get(CrmTask_.isDeleted)));

		Subquery<Long> overdueTaskSub = query.subquery(Long.class);
		Root<CrmTask> overdueTask = overdueTaskSub.from(CrmTask.class);
		Join<CrmTask, CrmContact> overdueDirectContact = overdueTask.join(CrmTask_.contact, JoinType.LEFT);
		Join<CrmTask, CrmDeal> overdueTaskDeal = overdueTask.join(CrmTask_.deal, JoinType.LEFT);
		Join<CrmDeal, CrmContact> overdueDealContact = overdueTaskDeal.join(CrmDeal_.contact, JoinType.LEFT);
		overdueTaskSub.select(cb.count(overdueTask.get(CrmTask_.id)))
			.where(cb.or(cb.equal(overdueDirectContact.get(CrmContact_.id), contactId),
					cb.equal(overdueDealContact.get(CrmContact_.id), contactId)),
					cb.isFalse(overdueTask.get(CrmTask_.isCompleted)), cb.isFalse(overdueTask.get(CrmTask_.isDeleted)),
					cb.isNotNull(overdueTask.get(CrmTask_.dueAt)),
					cb.lessThan(overdueTask.get(CrmTask_.dueAt), cb.literal(LocalDate.now().atStartOfDay())));

		query.select(cb.construct(CrmContactMetrics.class, closedValueSub.cast(String.class), closedCountSub,
				openTaskSub, overdueTaskSub));
		query.where(cb.equal(contact.get(CrmContact_.id), contactId), cb.isFalse(contact.get(CrmContact_.isDeleted)));

		return Optional.ofNullable(entityManager.createQuery(query).getSingleResultOrNull());
	}

	private List<Order> buildOrderBy(CriteriaBuilder cb, Root<CrmContact> contact, CriteriaQuery<?> query) {
		Subquery<BigDecimal> dealValueSub = query.subquery(BigDecimal.class);
		Root<CrmDeal> deal = dealValueSub.from(CrmDeal.class);
		dealValueSub.select(cb.coalesce(cb.sum(deal.get(CrmDeal_.amount).cast(BigDecimal.class)), BigDecimal.ZERO))
			.where(cb.equal(deal.get(CrmDeal_.contact), contact),
					cb.equal(deal.get(CrmDeal_.stage).get(CrmDealStage_.stageType), CrmDealStageType.WON),
					cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		return List.of(cb.desc(dealValueSub), cb.asc(contact.get(CrmContact_.id)));
	}

	private Predicate[] buildPredicates(CriteriaBuilder cb, Root<CrmContact> contact, Join<CrmContact, Employee> owner,
			Join<CrmContact, CrmCompany> company, CrmContactMetricRequestDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(contact.get(CrmContact_.isDeleted)));

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT));
			String likePattern = "%" + escaped + "%";
			predicates.add(cb.or(cb.like(cb.lower(contact.get(CrmContact_.firstName)), likePattern, '\\'),
					cb.like(cb.lower(contact.get(CrmContact_.lastName)), likePattern, '\\'),
					cb.like(cb.lower(cb.concat(cb.concat(contact.get(CrmContact_.firstName), " "),
							contact.get(CrmContact_.lastName))), likePattern, '\\'),
					cb.like(cb.lower(owner.get(Employee_.firstName)), likePattern, '\\'),
					cb.like(cb.lower(owner.get(Employee_.lastName)), likePattern, '\\')));
		}

		Long companyId = filterDto.getCompanyId();
		if (companyId != null) {
			predicates.add(cb.equal(company.get(CrmCompany_.id), companyId));
		}

		return predicates.toArray(new Predicate[0]);
	}

	private Long getContactTotalCount(CriteriaBuilder cb, CrmContactMetricRequestDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmContact> contact = countQuery.from(CrmContact.class);
		Join<CrmContact, Employee> owner = contact.join(CrmContact_.owner, JoinType.INNER);
		Join<CrmContact, CrmCompany> company = contact.join(CrmContact_.company, JoinType.LEFT);

		countQuery.select(cb.count(contact)).where(buildPredicates(cb, contact, owner, company, filterDto));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

	@Override
	public List<CrmContact> findAllContactsForBoardInit() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContact> query = cb.createQuery(CrmContact.class);
		Root<CrmContact> contact = query.from(CrmContact.class);
		contact.fetch(CrmContact_.company, JoinType.LEFT);

		query.where(cb.isFalse(contact.get(CrmContact_.isDeleted)));
		query.orderBy(cb.asc(cb.lower(contact.get(CrmContact_.firstName))),
				cb.asc(cb.lower(contact.get(CrmContact_.lastName))), cb.asc(contact.get(CrmContact_.id)));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public Page<CrmContact> findContactsForLookup(CrmContactFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContact> query = cb.createQuery(CrmContact.class);
		Root<CrmContact> contact = query.from(CrmContact.class);
		Join<CrmContact, CrmCompany> company = (Join<CrmContact, CrmCompany>) contact.fetch(CrmContact_.company,
				JoinType.LEFT);

		List<Predicate> predicates = buildLookupPredicates(cb, query, contact, company, filterDto);

		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(contact.get(CrmContact_.firstName))),
				cb.asc(cb.lower(contact.get(CrmContact_.lastName))), cb.asc(contact.get(CrmContact_.id)));

		TypedQuery<CrmContact> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getLookupTotalCount(cb, filterDto));
	}

	private <T> List<Predicate> buildLookupPredicates(CriteriaBuilder cb, CriteriaQuery<T> query,
			Root<CrmContact> contact, Join<CrmContact, CrmCompany> company, CrmContactFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(contact.get(CrmContact_.isDeleted)));

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT));
			String likePattern = "%" + escaped + "%";
			predicates.add(cb.or(cb.like(cb.lower(contact.get(CrmContact_.firstName)), likePattern, '\\'),
					cb.like(cb.lower(contact.get(CrmContact_.lastName)), likePattern, '\\'),
					cb.like(cb.lower(cb.concat(cb.concat(contact.get(CrmContact_.firstName), " "),
							contact.get(CrmContact_.lastName))), likePattern, '\\'),
					cb.like(cb.lower(company.get(CrmCompany_.name)), likePattern, '\\')));
		}

		if (filterDto.getDealId() != null) {
			Subquery<Long> dealSub = query.subquery(Long.class);
			Root<CrmDeal> deal = dealSub.from(CrmDeal.class);
			dealSub.select(deal.get(CrmDeal_.contact).get(CrmContact_.id))
				.where(cb.equal(deal.get(CrmDeal_.id), filterDto.getDealId()),
						cb.isFalse(deal.get(CrmDeal_.isDeleted)));
			predicates.add(contact.get(CrmContact_.id).in(dealSub));
		}

		if (filterDto.getCompanyId() != null) {
			predicates.add(cb.equal(company.get(CrmCompany_.id), filterDto.getCompanyId()));
		}

		return predicates;
	}

	private Long getLookupTotalCount(CriteriaBuilder cb, CrmContactFilterDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmContact> contact = countQuery.from(CrmContact.class);
		Join<CrmContact, CrmCompany> company = contact.join(CrmContact_.company, JoinType.LEFT);
		countQuery.select(cb.count(contact));
		countQuery.where(buildLookupPredicates(cb, countQuery, contact, company, filterDto).toArray(new Predicate[0]));
		return entityManager.createQuery(countQuery).getSingleResult();
	}

	@Override
	public CrmContact findByIdWithAssociations(Long id) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContact> query = cb.createQuery(CrmContact.class);
		Root<CrmContact> contact = query.from(CrmContact.class);
		contact.fetch(CrmContact_.company, JoinType.LEFT);
		contact.fetch(CrmContact_.owner, JoinType.INNER);

		query.where(cb.equal(contact.get(CrmContact_.id), id), cb.isFalse(contact.get(CrmContact_.isDeleted)));

		CrmContact results = entityManager.createQuery(query).getSingleResultOrNull();
		return results;
	}

}
