package com.skapp.enterprise.invoice.repository.impl;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.Invoice_;
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

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Invoice> query = cb.createQuery(Invoice.class);
		Root<Invoice> invoice = query.from(Invoice.class);

		List<Predicate> predicates = buildPredicates(cb, invoice, invoiceDateFrom, invoiceDateTo, dueDateFrom,
				dueDateTo, customerId, projectId, status);

		if (!predicates.isEmpty()) {
			query.where(predicates.toArray(new Predicate[0]));
		}

		List<Order> orders = buildSortOrders(cb, invoice, pageable.getSort());
		if (!orders.isEmpty()) {
			query.orderBy(orders);
		}

		TypedQuery<Invoice> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());
		List<Invoice> results = typedQuery.getResultList();

		Long total = getTotalCount(cb, invoiceDateFrom, invoiceDateTo, dueDateFrom, dueDateTo, customerId, projectId,
				status);

		return new PageImpl<>(results, pageable, total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Invoice> invoice, LocalDateTime invoiceDateFrom,
			LocalDateTime invoiceDateTo, LocalDateTime dueDateFrom, LocalDateTime dueDateTo, Long customerId,
			Long projectId, InvoiceStatus status) {

		List<Predicate> predicates = new ArrayList<>();

		if (invoiceDateFrom != null) {
			predicates.add(cb.greaterThanOrEqualTo(invoice.get(Invoice_.invoiceDate), invoiceDateFrom));
		}
		if (invoiceDateTo != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get(Invoice_.invoiceDate), invoiceDateTo));
		}

		if (dueDateFrom != null) {
			predicates.add(cb.greaterThanOrEqualTo(invoice.get(Invoice_.dueDate), dueDateFrom));
		}
		if (dueDateTo != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get(Invoice_.dueDate), dueDateTo));
		}

		if (customerId != null) {
			predicates.add(cb.equal(invoice.get(Invoice_.customerId), customerId));
		}

		if (projectId != null) {
			predicates.add(cb.equal(invoice.get(Invoice_.projectId), projectId));
		}

		if (status != null) {
			predicates.add(cb.equal(invoice.get(Invoice_.status), status));
		}

		return predicates;
	}

	private List<Order> buildSortOrders(CriteriaBuilder cb, Root<Invoice> invoice, Sort sort) {
		List<Order> orders = new ArrayList<>();

		if (sort.isSorted()) {
			for (Sort.Order sortOrder : sort) {
				if (sortOrder.isAscending()) {
					orders.add(cb.asc(invoice.get(sortOrder.getProperty())));
				}
				else {
					orders.add(cb.desc(invoice.get(sortOrder.getProperty())));
				}
			}
		}

		if (orders.isEmpty()) {
			orders.add(cb.desc(invoice.get(Invoice_.id)));
		}

		return orders;
	}

	private Long getTotalCount(CriteriaBuilder cb, LocalDateTime invoiceDateFrom, LocalDateTime invoiceDateTo,
			LocalDateTime dueDateFrom, LocalDateTime dueDateTo, Long customerId, Long projectId, InvoiceStatus status) {

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Invoice> countRoot = countQuery.from(Invoice.class);
		countQuery.select(cb.count(countRoot));

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
		query.where(cb.and(cb.lessThan(invoice.get(Invoice_.dueDate), now),
				cb.notEqual(invoice.get(Invoice_.status), InvoiceStatus.PAID),
				cb.notEqual(invoice.get(Invoice_.status), InvoiceStatus.CANCELLED),
				cb.notEqual(invoice.get(Invoice_.status), InvoiceStatus.OVERDUE)));

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
			predicates.add(cb.greaterThanOrEqualTo(invoice.get(Invoice_.createdDate), start));
		}
		if (end != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get(Invoice_.createdDate), end));
		}
		query.where(predicates.toArray(new Predicate[0]));
		return entityManager.createQuery(query).getSingleResult();
	}

}
