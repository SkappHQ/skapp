package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.repository.EnvelopeRepository;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

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

		Predicate statusPredicate = cb.equal(envelope.get("status"), EnvelopeStatus.NEED_TO_SIGN);

		query.select(cb.count(envelope)).where(cb.and(userPredicate, statusPredicate));

		TypedQuery<Long> typedQuery = entityManager.createQuery(query);
		return typedQuery.getSingleResult();
	}

}
