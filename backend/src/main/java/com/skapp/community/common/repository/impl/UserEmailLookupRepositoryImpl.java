package com.skapp.community.common.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.repository.UserEmailLookupRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class UserEmailLookupRepositoryImpl implements UserEmailLookupRepository {

	private final EntityManager entityManager;

	@Override
	public Map<String, Long> findUserIdsByEmailIgnoreCase(List<String> emails) {
		if (emails.isEmpty()) {
			return Map.of();
		}

		List<String> lowerCaseEmails = emails.stream().map(email -> email.toLowerCase(Locale.ROOT)).toList();

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Object[]> query = criteriaBuilder.createQuery(Object[].class);
		Root<User> root = query.from(User.class);
		Expression<String> lowerCaseEmail = criteriaBuilder.lower(root.get(User_.email));

		query.select(criteriaBuilder.array(lowerCaseEmail, root.get(User_.userId)))
			.where(lowerCaseEmail.in(lowerCaseEmails));

		return entityManager.createQuery(query)
			.getResultList()
			.stream()
			.collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1], (first, second) -> first));
	}

}
