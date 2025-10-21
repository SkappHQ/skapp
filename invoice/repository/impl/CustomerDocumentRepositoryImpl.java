package com.skapp.enterprise.invoice.repository.impl;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.repository.CustomerDocumentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class CustomerDocumentRepositoryImpl implements CustomerDocumentRepository {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public Page<CustomerDocument> findFilteredDocuments(CustomerDocumentFilterDto customerDocumentFilterDto,
			Pageable pageable) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<CustomerDocument> contentQuery = criteriaBuilder.createQuery(CustomerDocument.class);
		Root<CustomerDocument> customerDocument = contentQuery.from(CustomerDocument.class);

		List<Predicate> predicates = buildPredicates(criteriaBuilder, customerDocument, customerDocumentFilterDto);
		contentQuery.where(predicates.toArray(new Predicate[0]));

		if (pageable.getSort().isSorted()) {
			List<Order> orders = new ArrayList<>();
			pageable.getSort().forEach(sortOrder -> {
				if (sortOrder.isAscending()) {
					orders.add(criteriaBuilder.asc(customerDocument.get(sortOrder.getProperty())));
				}
				else {
					orders.add(criteriaBuilder.desc(customerDocument.get(sortOrder.getProperty())));
				}
			});
			contentQuery.orderBy(orders);
		}

		List<CustomerDocument> content = entityManager.createQuery(contentQuery)
			.setFirstResult((int) pageable.getOffset())
			.setMaxResults(pageable.getPageSize())
			.getResultList();

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		Root<CustomerDocument> countRoot = countQuery.from(CustomerDocument.class);
		List<Predicate> countPredicates = buildPredicates(criteriaBuilder, countRoot, customerDocumentFilterDto);
		countQuery.select(criteriaBuilder.count(countRoot)).where(countPredicates.toArray(new Predicate[0]));

		Long totalElements = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, totalElements);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder criteriaBuilder, Root<CustomerDocument> root,
			CustomerDocumentFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		if (filterDto.getCustomerId() != null) {
			Join<CustomerDocument, Customer> customerJoin = root.join("customer");
			predicates.add(criteriaBuilder.equal(customerJoin.get("id"), filterDto.getCustomerId()));
		}

		if (filterDto.getName() != null && !filterDto.getName().isEmpty()) {
			predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")),
					"%" + filterDto.getName().toLowerCase().trim() + "%"));
		}

		if (filterDto.getDocumentStatus() != null) {
			predicates.add(criteriaBuilder.equal(root.get("documentStatus"), filterDto.getDocumentStatus()));
		}

		return predicates;
	}

}
