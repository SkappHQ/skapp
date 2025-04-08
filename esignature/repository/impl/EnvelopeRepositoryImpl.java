package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AddressBook_;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Envelope_;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.Recipient_;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.payload.response.AddressBookBasicResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.repository.EnvelopeRepository;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeInboxData;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeSentData;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
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

		Predicate statusPredicate = cb.equal(envelope.get(Envelope_.STATUS), EnvelopeStatus.NEED_TO_SIGN);

		query.select(cb.count(envelope)).where(cb.and(userPredicate, statusPredicate));

		TypedQuery<Long> typedQuery = entityManager.createQuery(query);
		return typedQuery.getSingleResult();
	}

	@Override
	public PageDto getAllUserEnvelopes(Long currentUserId, EnvelopeInboxFilterDto filterDto) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<EnvelopeInboxData> query = cb.createQuery(EnvelopeInboxData.class);
		Root<Envelope> envelopeRoot = query.from(Envelope.class);

		Join<Envelope, Recipient> recipientJoin = envelopeRoot.join(Envelope_.RECIPIENTS, JoinType.INNER);
		Join<Recipient, AddressBook> addressBookJoin = recipientJoin.join(Recipient_.ADDRESS_BOOK, JoinType.INNER);
		Join<Envelope, AddressBook> ownerJoin = envelopeRoot.join(Envelope_.owner, JoinType.LEFT);
		Join<AddressBook, User> internalUserJoin = addressBookJoin.join(AddressBook_.INTERNAL_USER, JoinType.LEFT);

		Join<User, Employee> employeeJoin = internalUserJoin.join(User_.EMPLOYEE, JoinType.LEFT);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.equal(addressBookJoin.get(AddressBook_.INTERNAL_USER).get(User_.USER_ID), currentUserId));

		if (filterDto.getStatusTypes() != null && !filterDto.getStatusTypes().isEmpty()) {
			CriteriaBuilder.In<RecipientStatus> statusIn = cb.in(recipientJoin.get(Recipient_.STATUS));
			for (RecipientStatus status : filterDto.getStatusTypes()) {
				statusIn.value(status);
			}
			predicates.add(statusIn);
		}

		Path<String> ownerEmailPath = ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.EMAIL);

		String keyword = filterDto.getSearchKeyword();
		if (keyword != null && !keyword.isBlank()) {
			String prefixPattern = keyword.toLowerCase() + "%";

			Predicate subjectLike = cb.like(cb.lower(envelopeRoot.get(Envelope_.subject)), prefixPattern);

			Predicate ownerNotNull = cb.isNotNull(ownerEmailPath);
			Predicate emailLike = cb.like(cb.lower(ownerEmailPath), prefixPattern);
			Predicate safeEmailLike = cb.and(ownerNotNull, emailLike);

			predicates.add(cb.or(subjectLike, safeEmailLike));

			Order sortingOrder = cb.asc(cb.selectCase().when(subjectLike, 1).when(safeEmailLike, 2).otherwise(3));

			Path<?> sortPath = recipientJoin.get(filterDto.getSortKey().getSortField());

			if (filterDto.getSortOrder() == Sort.Direction.ASC) {
				query.orderBy(sortingOrder, cb.asc(sortPath));
			}
			else {
				query.orderBy(sortingOrder, cb.desc(sortPath));
			}

		}
		else {
			Path<?> sortPath = recipientJoin.get(filterDto.getSortKey().getSortField());

			if (filterDto.getSortOrder() == Sort.Direction.ASC) {
				query.orderBy(cb.asc(sortPath));
			}
			else {
				query.orderBy(cb.desc(sortPath));
			}
		}

		query.where(cb.and(predicates.toArray(new Predicate[0])));
		query.distinct(true);

		// 🧱 Create constructor expression
		Expression<Long> envelopeId = envelopeRoot.get(Envelope_.ID);
		Expression<String> subject = envelopeRoot.get(Envelope_.SUBJECT);
		Expression<String> ownerEmail = ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.EMAIL);
		Expression<RecipientStatus> status = recipientJoin.get(Recipient_.STATUS);
		Expression<LocalDateTime> expiresAt = envelopeRoot.get(Envelope_.EXPIRE_AT);
		Expression<LocalDateTime> receivedDate = recipientJoin.get(Recipient_.RECEIVED_AT);
		Expression<String> ownerProfilePic = employeeJoin.get(Employee_.AUTH_PIC);

		query.select(cb.construct(EnvelopeInboxData.class, envelopeId, subject, ownerEmail, status, expiresAt,
				receivedDate, ownerProfilePic));

		TypedQuery<EnvelopeInboxData> countQuery = entityManager.createQuery(query);
		Long totalItems = (long) countQuery.getResultList().size();
		int totalPages = (int) Math.ceil((double) totalItems / filterDto.getSize());

		TypedQuery<EnvelopeInboxData> pagedQuery = entityManager.createQuery(query);
		pagedQuery.setFirstResult(filterDto.getPage() * filterDto.getSize());
		pagedQuery.setMaxResults(filterDto.getSize());
		List<EnvelopeInboxData> resultList = pagedQuery.getResultList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(resultList);
		pageDto.setCurrentPage(filterDto.getPage());
		pageDto.setTotalItems(totalItems);
		pageDto.setTotalPages(totalPages);

		return pageDto;
	}

	@Override
	public PageDto getAllSentEnvelopes(Long currentUserId, EnvelopeSentFilterDto filterDto,
			boolean isAllSentEnvelopes) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<Envelope> query = cb.createQuery(Envelope.class);
		Root<Envelope> envelopeRoot = query.from(Envelope.class);

		Join<Envelope, Recipient> recipientJoin = envelopeRoot.join(Envelope_.RECIPIENTS, JoinType.INNER);
		Join<Recipient, AddressBook> addressBookJoin = recipientJoin.join(Recipient_.ADDRESS_BOOK, JoinType.INNER);
		Join<Envelope, AddressBook> ownerJoin = envelopeRoot.join(Envelope_.owner, JoinType.LEFT);

		List<Predicate> predicates = new ArrayList<>();

		if (!isAllSentEnvelopes)
			predicates.add(cb.equal(ownerJoin.get(AddressBook_.INTERNAL_USER).get(User_.USER_ID), currentUserId));

		addStatusPredicate(filterDto.getStatusTypes(), cb, envelopeRoot, predicates);

		String keyword = filterDto.getSearchKeyword();
		if (keyword != null && !keyword.isBlank()) {
			String prefixPattern = keyword.toLowerCase() + "%";

			Predicate subjectLike = cb.like(cb.lower(envelopeRoot.get(Envelope_.subject)), prefixPattern);
			Path<String> recipientEmailPath = addressBookJoin.get(AddressBook_.INTERNAL_USER).get(User_.EMAIL);

			Predicate recipientNotNull = cb.isNotNull(recipientEmailPath);
			Predicate emailLike = cb.like(cb.lower(recipientEmailPath), prefixPattern);
			Predicate safeEmailLike = cb.and(recipientNotNull, emailLike);

			// predicates.add(cb.or(subjectLike, safeEmailLike));
			predicates.add(cb.or(subjectLike));

			// Order sortingOrder = cb.asc(cb.selectCase().when(subjectLike,
			// 1).when(safeEmailLike, 2).otherwise(3));
			Order sortingOrder = cb.asc(cb.selectCase().when(subjectLike, 1).otherwise(2));

			Path<?> sortPath = envelopeRoot.get(filterDto.getSortKey().getSortField());

			if (filterDto.getSortOrder() == Sort.Direction.ASC) {
				query.orderBy(sortingOrder, cb.asc(sortPath));
			}
			else {
				query.orderBy(sortingOrder, cb.desc(sortPath));
			}

		}
		else {

			Path<?> sortPath = envelopeRoot.get(filterDto.getSortKey().getSortField());

			if (filterDto.getSortOrder() == Sort.Direction.ASC) {
				query.orderBy(cb.asc(sortPath));
			}
			else {
				query.orderBy(cb.desc(sortPath));
			}
		}

		query.where(cb.and(predicates.toArray(new Predicate[0])));

		query.select(envelopeRoot).distinct(true);

		TypedQuery<Envelope> countQuery = entityManager.createQuery(query);
		Long totalItems = (long) countQuery.getResultList().size();
		int totalPages = (int) Math.ceil((double) totalItems / filterDto.getSize());

		TypedQuery<Envelope> pagedQuery = entityManager.createQuery(query);
		pagedQuery.setFirstResult(filterDto.getPage() * filterDto.getSize());
		pagedQuery.setMaxResults(filterDto.getSize());
		List<Envelope> resultList = pagedQuery.getResultList();

		List<EnvelopeSentData> envelopeSentDataList = resultList.stream()
			.map(this::mapEnvelopeToSentData) // Map each Envelope to EnvelopeSentData
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(envelopeSentDataList);
		pageDto.setCurrentPage(filterDto.getPage());
		pageDto.setTotalItems(totalItems);
		pageDto.setTotalPages(totalPages);

		return pageDto;
	}

	private EnvelopeSentData mapEnvelopeToSentData(Envelope envelope) {
		// Mapping Envelope to EnvelopeSentData
		EnvelopeSentData envelopeSentData = new EnvelopeSentData();

		// Mapping simple fields
		envelopeSentData.setEnvelopeId(envelope.getId());
		envelopeSentData.setSubject(envelope.getSubject());
		envelopeSentData.setStatus(envelope.getStatus());
		envelopeSentData.setExpiresAt(envelope.getExpireAt());
		envelopeSentData.setSentAt(envelope.getSentAt());

		// Mapping owner email and profile pic
		if (envelope.getOwner() != null && envelope.getOwner().getInternalUser() != null) {
			envelopeSentData.setOwnerEmail(envelope.getOwner().getEmail());
			envelopeSentData.setOwnerProfilePic(envelope.getOwner().getInternalUser().getEmployee().getAuthPic());
		}

		// Mapping recipients data to RecipientResponseDto
		List<RecipientResponseDto> recipientResponseDtos = new ArrayList<>();
		if (envelope.getRecipients() != null) {
			for (Recipient recipient : envelope.getRecipients()) {
				RecipientResponseDto recipientResponseDto = new RecipientResponseDto();

				// Mapping recipient fields to RecipientResponseDto
				recipientResponseDto.setId(recipient.getId());
				recipientResponseDto.setMemberRole(recipient.getMemberRole());
				recipientResponseDto.setStatus(recipient.getStatus());
				recipientResponseDto.setSigningOrder(recipient.getSigningOrder());
				recipientResponseDto.setColor(recipient.getColor());

				// Mapping AddressBookBasicResponseDto (user details)
				if (recipient.getAddressBook() != null) {
					AddressBookBasicResponseDto addressBookDto = getAddressBookBasicResponseDto(recipient);
					recipientResponseDto.setAddressBookBasicResponseDto(addressBookDto);
				}

				// Add recipientResponseDto to the list
				recipientResponseDtos.add(recipientResponseDto);
			}
		}

		// Setting recipients in EnvelopeSentData
		envelopeSentData.setRecipients(recipientResponseDtos);

		return envelopeSentData;
	}

	private AddressBookBasicResponseDto getAddressBookBasicResponseDto(Recipient recipient) {
		AddressBookBasicResponseDto addressBookDto = new AddressBookBasicResponseDto();
		addressBookDto.setId(recipient.getAddressBook().getId());
		addressBookDto.setUserId(recipient.getAddressBook().getUserId());
		addressBookDto.setFirstName(recipient.getAddressBook().getName());
		addressBookDto.setLastName(recipient.getAddressBook().getName());
		addressBookDto.setEmail(recipient.getAddressBook().getEmail());
		addressBookDto.setPhone(recipient.getAddressBook().getPhone());
		addressBookDto.setProfilePic(recipient.getAddressBook().getInternalUser() != null
				? recipient.getAddressBook().getInternalUser().getEmployee().getAuthPic() : null);
		return addressBookDto;
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
			.in(List.of(EnvelopeStatus.NEED_TO_SIGN, EnvelopeStatus.COMPLETED));

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

		resultMap.putIfAbsent(EnvelopeStatus.NEED_TO_SIGN, 0L);
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
