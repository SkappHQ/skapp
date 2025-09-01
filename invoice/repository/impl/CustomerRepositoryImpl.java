package com.skapp.enterprise.invoice.repository.impl;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;
import com.skapp.enterprise.invoice.repository.CustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class CustomerRepositoryImpl implements CustomerRepository {

	private final EntityManager entityManager;

	@Override
	public Page<Customer> findAllCustomers(CustomerFilterDto filterDto) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Customer> query = cb.createQuery(Customer.class);
		Root<Customer> root = query.from(Customer.class);

		// Build predicates based on filterDto
		List<Predicate> predicates = new ArrayList<>();

		query.where(cb.and(predicates.toArray(new Predicate[0])));

		Order sortOrder = filterDto.getSortOrder() == Sort.Direction.ASC ? cb.asc(root.get("name"))
				: cb.desc(root.get("name"));

		if (filterDto.getSearchKeyword() != null && !filterDto.getSearchKeyword().isBlank()) {
			String pattern = "%" + filterDto.getSearchKeyword().toLowerCase() + "%";
			Predicate keywordPredicate = cb.like(cb.lower(root.get("name")), pattern);
			query.where(keywordPredicate);
		}

		query.orderBy(sortOrder);

		// Create paginated query
		TypedQuery<Customer> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult(filterDto.getPage() * filterDto.getSize());
		typedQuery.setMaxResults(filterDto.getSize());

		// Fetch results
		List<Customer> customers = typedQuery.getResultList();

		// Count total records
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Customer> countRoot = countQuery.from(Customer.class);
		countQuery.select(cb.count(countRoot)).where(cb.and(predicates.toArray(new Predicate[0])));
		Long totalRecords = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(customers, PageRequest.of(filterDto.getPage(), filterDto.getSize()), totalRecords);
	}

}
