package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.community.common.model.User_;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AddressBook_;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Envelope_;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.Recipient_;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.repository.EnvelopeRepository;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
public class EnvelopeRepositoryImpl implements EnvelopeRepository {

	private final EntityManager entityManager;

	@Override
	public long countNeedToSignEnvelopes(Long currentUserId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);

		Root<Envelope> envelope = query.from(Envelope.class);

		Join<Envelope, Recipient> recipientJoin = envelope.join("recipients", JoinType.INNER);

		Join<Recipient, AddressBook> addressBookJoin = recipientJoin.join("addressBook", JoinType.INNER);

		// Predicate to filter by internalUser's userId
		Predicate userPredicate = cb.equal(addressBookJoin.get("internalUser").get("userId"), currentUserId);

		Predicate statusPredicate = cb.equal(recipientJoin.get(Recipient_.STATUS), RecipientStatus.NEED_TO_SIGN);

		query.select(cb.count(envelope)).where(cb.and(userPredicate, statusPredicate));

		TypedQuery<Long> typedQuery = entityManager.createQuery(query);
		return typedQuery.getSingleResult();
	}

	@Override
	public Page<Envelope> getAllUserEnvelopes(Long currentUserId, EnvelopeInboxFilterDto filterDto) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> dataQuery = cb.createTupleQuery();
		Root<Envelope> envelopeRoot = dataQuery.from(Envelope.class);

		Join<Envelope, Recipient> recipientJoin = envelopeRoot.join(Envelope_.RECIPIENTS, JoinType.INNER);
		Join<Recipient, AddressBook> recipientAddressJoin = recipientJoin.join(Recipient_.ADDRESS_BOOK, JoinType.INNER);
		Join<Envelope, AddressBook> ownerJoin = envelopeRoot.join(Envelope_.OWNER, JoinType.LEFT);
		Path<String> ownerEmailPath = ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.EMAIL);

		List<Predicate> predicates = buildPredicates(cb, envelopeRoot, recipientJoin, recipientAddressJoin,
				ownerEmailPath, filterDto, currentUserId);

		// Sorting
		String keyword = filterDto.getSearchKeyword();
		if (keyword != null && !keyword.isBlank()) {
			String pattern = keyword.toLowerCase() + "%";
			Predicate subjectLike = cb.like(cb.lower(envelopeRoot.get(Envelope_.SUBJECT)), pattern);
			Predicate ownerEmailLike = cb.like(cb.lower(ownerEmailPath), pattern);

			Order priorityOrder = cb.asc(cb.selectCase().when(subjectLike, 1).when(ownerEmailLike, 2).otherwise(3));
			Order sortOrder = getSortOrder(cb, recipientJoin, filterDto);
			dataQuery.orderBy(priorityOrder, sortOrder);
		}
		else {
			dataQuery.orderBy(getSortOrder(cb, recipientJoin, filterDto));
		}

		dataQuery
			.multiselect(envelopeRoot, ownerEmailPath, recipientJoin.get(Recipient_.RECEIVED_AT),
					recipientJoin.get(Recipient_.INBOX_STATUS))
			.distinct(true);
		dataQuery.where(cb.and(predicates.toArray(new Predicate[0])));

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(dataQuery);
		typedQuery.setFirstResult(filterDto.getPage() * filterDto.getSize());
		typedQuery.setMaxResults(filterDto.getSize());

		List<Envelope> envelopes = typedQuery.getResultList().stream().map(t -> t.get(0, Envelope.class)).toList();

		long total = countUserEnvelopes(currentUserId, filterDto);
		return new PageImpl<>(envelopes, PageRequest.of(filterDto.getPage(), filterDto.getSize()), total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Envelope> envelopeRoot,
			Join<Envelope, Recipient> recipientJoin, Join<Recipient, AddressBook> recipientAddressJoin,
			Path<String> ownerEmailPath, EnvelopeInboxFilterDto filterDto, Long currentUserId) {
		List<Predicate> predicates = new ArrayList<>();

		predicates
			.add(cb.equal(recipientAddressJoin.get(AddressBook_.INTERNAL_USER).get(User_.USER_ID), currentUserId));

		if (filterDto.getStatusTypes() != null && !filterDto.getStatusTypes().isEmpty()) {
			CriteriaBuilder.In<RecipientStatus> statusIn = cb.in(recipientJoin.get(Recipient_.INBOX_STATUS));
			filterDto.getStatusTypes().forEach(statusIn::value);
			predicates.add(statusIn);
		}

		String keyword = filterDto.getSearchKeyword();
		if (keyword != null && !keyword.isBlank()) {
			String pattern = keyword.toLowerCase() + "%";
			Predicate subjectLike = cb.like(cb.lower(envelopeRoot.get(Envelope_.SUBJECT)), pattern);
			Predicate ownerEmailLike = cb.like(cb.lower(ownerEmailPath), pattern);
			predicates.add(cb.or(subjectLike, cb.and(cb.isNotNull(ownerEmailPath), ownerEmailLike)));
		}

		return predicates;
	}

	private Order getSortOrder(CriteriaBuilder cb, Join<Envelope, Recipient> recipientJoin,
			EnvelopeInboxFilterDto filterDto) {
		Path<?> sortPath = recipientJoin.get(filterDto.getSortKey().getSortField());
		return filterDto.getSortOrder() == Sort.Direction.ASC ? cb.asc(sortPath) : cb.desc(sortPath);
	}

	private long countUserEnvelopes(Long currentUserId, EnvelopeInboxFilterDto filterDto) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Envelope> countRoot = countQuery.from(Envelope.class);

		Join<Envelope, Recipient> recipientJoin = countRoot.join(Envelope_.RECIPIENTS, JoinType.INNER);
		Join<Recipient, AddressBook> recipientAddressJoin = recipientJoin.join(Recipient_.ADDRESS_BOOK, JoinType.INNER);
		Join<Envelope, AddressBook> ownerJoin = countRoot.join(Envelope_.OWNER, JoinType.LEFT);
		Path<String> ownerEmailPath = ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.EMAIL);

		List<Predicate> predicates = buildPredicates(cb, countRoot, recipientJoin, recipientAddressJoin, ownerEmailPath,
				filterDto, currentUserId);

		countQuery.select(cb.countDistinct(countRoot));
		countQuery.where(cb.and(predicates.toArray(new Predicate[0])));
		return entityManager.createQuery(countQuery).getSingleResult();
	}

	@Override
	public Page<Envelope> getAllSentEnvelopes(Long currentUserId, EnvelopeSentFilterDto filterDto,
			boolean isAllSentEnvelopes) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<Tuple> dataQuery = cb.createTupleQuery();
		Root<Envelope> envelopeRoot = dataQuery.from(Envelope.class);
		Join<Envelope, AddressBook> ownerJoin = envelopeRoot.join(Envelope_.owner, JoinType.LEFT);
		Path<String> ownerEmailPath = ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.EMAIL);

		List<Predicate> dataPredicates = buildSentEnvelopePredicates(cb, envelopeRoot, ownerJoin, ownerEmailPath,
				currentUserId, filterDto, isAllSentEnvelopes);
		dataQuery.where(cb.and(dataPredicates.toArray(new Predicate[0])));
		dataQuery.multiselect(envelopeRoot, ownerEmailPath).distinct(true);
		dataQuery.orderBy(getSentEnvelopeSortOrder(cb, envelopeRoot, ownerEmailPath, filterDto));

		TypedQuery<Tuple> pagedQuery = entityManager.createQuery(dataQuery);
		pagedQuery.setFirstResult(filterDto.getPage() * filterDto.getSize());
		pagedQuery.setMaxResults(filterDto.getSize());

		List<Envelope> envelopes = pagedQuery.getResultList()
			.stream()
			.map(tuple -> tuple.get(0, Envelope.class))
			.toList();

		Long totalItems = getSentEnvelopeCount(cb, currentUserId, filterDto, isAllSentEnvelopes);

		return new PageImpl<>(envelopes, PageRequest.of(filterDto.getPage(), filterDto.getSize()), totalItems);
	}

	private List<Predicate> buildSentEnvelopePredicates(CriteriaBuilder cb, Root<Envelope> envelopeRoot,
			Join<Envelope, AddressBook> ownerJoin, Path<String> ownerEmailPath, Long currentUserId,
			EnvelopeSentFilterDto filterDto, boolean isAllSentEnvelopes) {
		List<Predicate> predicates = new ArrayList<>();

		if (!isAllSentEnvelopes) {
			predicates.add(cb.equal(ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.USER_ID), currentUserId));
		}

		addStatusPredicate(filterDto.getStatusTypes(), cb, envelopeRoot, predicates);

		String keyword = filterDto.getSearchKeyword();
		if (keyword != null && !keyword.isBlank()) {
			String prefixPattern = "%" + keyword.toLowerCase() + "%";

			Predicate subjectLike = cb.like(cb.lower(envelopeRoot.get(Envelope_.subject)), prefixPattern);
			Predicate emailLike = cb.like(cb.lower(ownerEmailPath), prefixPattern);
			Predicate safeEmailLike = cb.and(cb.isNotNull(ownerEmailPath), emailLike);

			predicates.add(cb.or(subjectLike, safeEmailLike));
		}

		return predicates;
	}

	private List<Order> getSentEnvelopeSortOrder(CriteriaBuilder cb, Root<Envelope> envelopeRoot,
			Path<String> ownerEmailPath, EnvelopeSentFilterDto filterDto) {
		String keyword = filterDto.getSearchKeyword();
		Path<?> sortPath = envelopeRoot.get(filterDto.getSortKey().getSortField());

		if (keyword != null && !keyword.isBlank()) {
			String prefixPattern = "%" + keyword.toLowerCase() + "%";
			Predicate subjectLike = cb.like(cb.lower(envelopeRoot.get(Envelope_.subject)), prefixPattern);
			Predicate emailLike = cb.like(cb.lower(ownerEmailPath), prefixPattern);

			Order matchOrder = cb.asc(cb.selectCase().when(subjectLike, 1).when(emailLike, 2).otherwise(3));

			Order directionOrder = filterDto.getSortOrder() == Sort.Direction.ASC ? cb.asc(sortPath)
					: cb.desc(sortPath);
			return List.of(matchOrder, directionOrder);
		}
		else {
			Order directionOrder = filterDto.getSortOrder() == Sort.Direction.ASC ? cb.asc(sortPath)
					: cb.desc(sortPath);
			return List.of(directionOrder);
		}
	}

	private Long getSentEnvelopeCount(CriteriaBuilder cb, Long currentUserId, EnvelopeSentFilterDto filterDto,
			boolean isAllSentEnvelopes) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Envelope> countRoot = countQuery.from(Envelope.class);
		Join<Envelope, AddressBook> ownerJoin = countRoot.join(Envelope_.owner, JoinType.LEFT);
		Path<String> ownerEmailPath = ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.EMAIL);

		List<Predicate> countPredicates = buildSentEnvelopePredicates(cb, countRoot, ownerJoin, ownerEmailPath,
				currentUserId, filterDto, isAllSentEnvelopes);

		countQuery.select(cb.countDistinct(countRoot));
		countQuery.where(cb.and(countPredicates.toArray(new Predicate[0])));
		return entityManager.createQuery(countQuery).getSingleResult();
	}

	@Override
	public Map<EnvelopeStatus, Long> countEnvelopesByStatus(Long userId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<Envelope> envelope = query.from(Envelope.class);

		Join<Object, Object> owner = envelope.join("owner");
		Join<Object, Object> internalUser = owner.join("internalUser");

		Predicate byUser = cb.equal(internalUser.get("userId"), userId);
		Predicate byStatus = envelope.get(Envelope_.STATUS)
			.in(List.of(EnvelopeStatus.WAITING, EnvelopeStatus.COMPLETED));

		query.multiselect(envelope.get(Envelope_.STATUS).alias("status"), cb.count(envelope).alias("count"))
			.where(cb.and(byUser, byStatus))
			.groupBy(envelope.get(Envelope_.STATUS));

		List<Tuple> results = entityManager.createQuery(query).getResultList();

		Map<EnvelopeStatus, Long> resultMap = new EnumMap<>(EnvelopeStatus.class);
		for (Tuple tuple : results) {
			EnvelopeStatus status = tuple.get("status", EnvelopeStatus.class);
			Long count = tuple.get("count", Long.class);
			resultMap.put(status, count);
		}

		resultMap.putIfAbsent(EnvelopeStatus.WAITING, 0L);
		resultMap.putIfAbsent(EnvelopeStatus.COMPLETED, 0L);

		return resultMap;
	}

	private void addStatusPredicate(List<EnvelopeStatus> envelopeStatusList, CriteriaBuilder cb,
			Root<Envelope> envelopeRoot, List<Predicate> predicates) {
		if (envelopeStatusList != null && !envelopeStatusList.isEmpty()) {
			CriteriaBuilder.In<EnvelopeStatus> statusIn = cb.in(envelopeRoot.get(Envelope_.STATUS));
			for (EnvelopeStatus status : envelopeStatusList) {
				statusIn.value(status);
			}
			predicates.add(statusIn);
		}
	}

}
