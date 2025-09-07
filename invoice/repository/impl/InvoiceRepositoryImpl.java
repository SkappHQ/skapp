package com.skapp.enterprise.invoice.repository.impl;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.repository.InvoiceRepository;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class InvoiceRepositoryImpl implements InvoiceRepository {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public Page<Invoice> findInvoicesWithFilters(LocalDateTime invoiceDateFrom, LocalDateTime invoiceDateTo,
			LocalDateTime dueDateFrom, LocalDateTime dueDateTo, Long customerId, Long projectId, InvoiceStatus status,
			Pageable pageable) {

		// Build the main query
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Invoice> query = cb.createQuery(Invoice.class);
		Root<Invoice> invoice = query.from(Invoice.class);

		// Build predicates for filtering
		List<Predicate> predicates = buildPredicates(cb, invoice, invoiceDateFrom, invoiceDateTo, dueDateFrom,
				dueDateTo, customerId, projectId, status);

		// Apply where clause
		if (!predicates.isEmpty()) {
			query.where(predicates.toArray(new Predicate[0]));
		}

		// Apply sorting
		List<Order> orders = buildSortOrders(cb, invoice, pageable.getSort());
		if (!orders.isEmpty()) {
			query.orderBy(orders);
		}

		// Execute main query with pagination
		TypedQuery<Invoice> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());
		List<Invoice> results = typedQuery.getResultList();

		// Get total count
		Long total = getTotalCount(cb, invoiceDateFrom, invoiceDateTo, dueDateFrom, dueDateTo, customerId, projectId,
				status);

		return new PageImpl<>(results, pageable, total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Invoice> invoice, LocalDateTime invoiceDateFrom,
			LocalDateTime invoiceDateTo, LocalDateTime dueDateFrom, LocalDateTime dueDateTo, Long customerId,
			Long projectId, InvoiceStatus status) {

		List<Predicate> predicates = new ArrayList<>();

		// Invoice date range filter
		if (invoiceDateFrom != null) {
			predicates.add(cb.greaterThanOrEqualTo(invoice.get("invoiceDate"), invoiceDateFrom));
		}
		if (invoiceDateTo != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get("invoiceDate"), invoiceDateTo));
		}

		// Due date range filter
		if (dueDateFrom != null) {
			predicates.add(cb.greaterThanOrEqualTo(invoice.get("dueDate"), dueDateFrom));
		}
		if (dueDateTo != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get("dueDate"), dueDateTo));
		}

		// Customer filter
		if (customerId != null) {
			predicates.add(cb.equal(invoice.get("customerId"), customerId));
		}

		// Project filter
		if (projectId != null) {
			predicates.add(cb.equal(invoice.get("projectId"), projectId));
		}

		// Status filter
		if (status != null) {
			predicates.add(cb.equal(invoice.get("status"), status));
		}

		return predicates;
	}

	private List<Order> buildSortOrders(CriteriaBuilder cb, Root<Invoice> invoice, Sort sort) {
		List<Order> orders = new ArrayList<>();

		if (sort.isSorted()) {
			for (Sort.Order sortOrder : sort) {
				try {
					if (sortOrder.isAscending()) {
						orders.add(cb.asc(invoice.get(sortOrder.getProperty())));
					}
					else {
						orders.add(cb.desc(invoice.get(sortOrder.getProperty())));
					}
				}
				catch (IllegalArgumentException e) {
					// If the property doesn't exist, skip it and use default sorting
					System.err.println("Invalid sort property: " + sortOrder.getProperty() + ". Skipping...");
				}
			}
		}

		// Default sorting if no valid sort orders
		if (orders.isEmpty()) {
			orders.add(cb.desc(invoice.get("id")));
		}

		return orders;
	}

	private Long getTotalCount(CriteriaBuilder cb, LocalDateTime invoiceDateFrom, LocalDateTime invoiceDateTo,
			LocalDateTime dueDateFrom, LocalDateTime dueDateTo, Long customerId, Long projectId, InvoiceStatus status) {

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Invoice> countRoot = countQuery.from(Invoice.class);
		countQuery.select(cb.count(countRoot));

		// Apply same filters for count query
		List<Predicate> predicates = buildPredicates(cb, countRoot, invoiceDateFrom, invoiceDateTo, dueDateFrom,
				dueDateTo, customerId, projectId, status);

		if (!predicates.isEmpty()) {
			countQuery.where(predicates.toArray(new Predicate[0]));
		}

		return entityManager.createQuery(countQuery).getSingleResult();
	}

	@Override
	public long countDueInvoices() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<Invoice> invoice = query.from(Invoice.class);

		LocalDateTime now = LocalDateTime.now();

		query.select(cb.count(invoice));
		query.where(
				cb.and(cb.lessThan(invoice.get("dueDate"), now), cb.notEqual(invoice.get("status"), InvoiceStatus.PAID),
						cb.notEqual(invoice.get("status"), InvoiceStatus.CANCELLED),
						cb.notEqual(invoice.get("status"), InvoiceStatus.OVERDUE)));

		return entityManager.createQuery(query).getSingleResult();
	}

	@Override
	public long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<Invoice> invoice = query.from(Invoice.class);
		query.select(cb.count(invoice));
		List<Predicate> predicates = new ArrayList<>();
		if (start != null) {
			predicates.add(cb.greaterThanOrEqualTo(invoice.get("createdDate"), start));
		}
		if (end != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get("createdDate"), end));
		}
		query.where(predicates.toArray(new Predicate[0]));
		return entityManager.createQuery(query).getSingleResult();
	}

}
