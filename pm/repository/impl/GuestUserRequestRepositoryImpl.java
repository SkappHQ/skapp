package com.skapp.enterprise.pm.repository.impl;

import com.skapp.enterprise.pm.model.GuestUserRequest;
import com.skapp.enterprise.pm.model.GuestUserRequest_;
import com.skapp.enterprise.pm.repository.GuestUserRequestRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

@RequiredArgsConstructor
public class GuestUserRequestRepositoryImpl implements GuestUserRequestRepository {

	private final EntityManager entityManager;

	@Override
	public Optional<GuestUserRequest> findByIdWithRequestedUser(Long id) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<GuestUserRequest> cq = cb.createQuery(GuestUserRequest.class);
		Root<GuestUserRequest> root = cq.from(GuestUserRequest.class);

		root.fetch(GuestUserRequest_.requestedUser);
		cq.where(cb.equal(root.get(GuestUserRequest_.id), id));

		return entityManager.createQuery(cq).getResultStream().findFirst();
	}

}
