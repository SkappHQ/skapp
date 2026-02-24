package com.skapp.enterprise.esignature.repository.impl;

import com.skapp.enterprise.esignature.model.EsignVerificationSession;
import com.skapp.enterprise.esignature.model.EsignVerificationSession_;
import com.skapp.enterprise.esignature.repository.EsignVerificationSessionRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class EsignVerificationSessionRepositoryImpl implements EsignVerificationSessionRepository {

	private final EntityManager entityManager;

	@Transactional
	@Override
	public EsignVerificationSession findByDocumentIdAndRecipientIdForUpdate(Long documentId, Long recipientId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EsignVerificationSession> query = cb.createQuery(EsignVerificationSession.class);

		Root<EsignVerificationSession> verificationSession = query.from(EsignVerificationSession.class);

		verificationSession.fetch(EsignVerificationSession_.recipient, JoinType.LEFT);
		verificationSession.fetch(EsignVerificationSession_.document, JoinType.LEFT);

		Predicate documentPredicate = cb.equal(verificationSession.get(EsignVerificationSession_.document).get("id"),
				documentId);
		Predicate recipientPredicate = cb.equal(verificationSession.get(EsignVerificationSession_.recipient).get("id"),
				recipientId);

		query.select(verificationSession).where(cb.and(documentPredicate, recipientPredicate));

		TypedQuery<EsignVerificationSession> typedQuery = entityManager.createQuery(query);

		return typedQuery.getResultStream().findFirst().orElse(null);
	}

}
