package com.skapp.community.common.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaUpdate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

	private final EntityManager entityManager;

	@Override
	public int consumeTempPassword(Long userId, Instant now) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaUpdate<User> update = criteriaBuilder.createCriteriaUpdate(User.class);
		Root<User> root = update.from(User.class);

		update.set(root.get(User_.tempPasswordExpiresAt), criteriaBuilder.nullLiteral(Instant.class));
		update.where(criteriaBuilder.equal(root.get(User_.userId), userId),
				criteriaBuilder.greaterThan(root.get(User_.tempPasswordExpiresAt), now));

		return entityManager.createQuery(update).executeUpdate();
	}

}
