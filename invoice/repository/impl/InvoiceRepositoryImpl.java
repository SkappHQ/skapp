package com.skapp.enterprise.invoice.repository.impl;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Customer_;
import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.Invoice_;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.repository.InvoiceRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class InvoiceRepositoryImpl implements InvoiceRepository {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public Page<Invoice> findInvoicesWithFilters(InvoiceFilterRequestDto invoiceFilterRequestDto, Pageable pageable) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Invoice> query = cb.createQuery(Invoice.class);
		Root<Invoice> invoice = query.from(Invoice.class);

		List<Predicate> predicates = buildPredicates(cb, invoice, invoiceFilterRequestDto);

		List<Predicate> searchPredicates = buildSearchPredicates(cb, invoice, invoiceFilterRequestDto);
		predicates.addAll(searchPredicates);

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

		Long total = getTotalCount(cb, invoiceFilterRequestDto);

		return new PageImpl<>(results, pageable, total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Invoice> invoice,
			InvoiceFilterRequestDto invoiceFilterRequestDto) {

		List<Predicate> predicates = new ArrayList<>();

		if (invoiceFilterRequestDto.getInvoiceId() != null && !invoiceFilterRequestDto.getInvoiceId().isEmpty()) {
			predicates.add(cb.like(cb.lower(invoice.get(Invoice_.invoiceId)),
					"%" + invoiceFilterRequestDto.getInvoiceId().toLowerCase() + "%"));
		}
		if (invoiceFilterRequestDto.getInvoiceDateFrom() != null) {
			predicates.add(cb.greaterThanOrEqualTo(invoice.get(Invoice_.invoiceDate),
					invoiceFilterRequestDto.getInvoiceDateFrom()));
		}
		if (invoiceFilterRequestDto.getInvoiceDateTo() != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get(Invoice_.invoiceDate),
					invoiceFilterRequestDto.getInvoiceDateTo()));
		}

		if (invoiceFilterRequestDto.getDueDateFrom() != null) {
			predicates
				.add(cb.greaterThanOrEqualTo(invoice.get(Invoice_.dueDate), invoiceFilterRequestDto.getDueDateFrom()));
		}
		if (invoiceFilterRequestDto.getDueDateTo() != null) {
			predicates.add(cb.lessThanOrEqualTo(invoice.get(Invoice_.dueDate), invoiceFilterRequestDto.getDueDateTo()));
		}

		if (invoiceFilterRequestDto.getCustomerId() != null) {
			Join<Invoice, Customer> customerJoin = invoice.join(Invoice_.customer);
			predicates.add(cb.equal(customerJoin.get(Customer_.id), invoiceFilterRequestDto.getCustomerId()));
		}

		if (invoiceFilterRequestDto.getProjectId() != null) {
			predicates.add(cb.equal(invoice.get(Invoice_.projectId), invoiceFilterRequestDto.getProjectId()));
		}

		if (invoiceFilterRequestDto.getStatus() != null) {
			predicates.add(cb.equal(invoice.get(Invoice_.status), invoiceFilterRequestDto.getStatus()));
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

	private List<Predicate> buildSearchPredicates(CriteriaBuilder cb, Root<Invoice> invoice,
			InvoiceFilterRequestDto invoiceFilterRequestDto) {

		List<Predicate> searchPredicates = new ArrayList<>();
		String searchKeyword = invoiceFilterRequestDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isEmpty()) {
			String likePattern = "%" + searchKeyword.toLowerCase() + "%";

			Join<Invoice, Customer> customerJoin = invoice.join(Invoice_.customer);
			searchPredicates.add(cb.or(cb.like(cb.lower(invoice.get(Invoice_.invoiceId)), likePattern),
					cb.like(cb.lower(customerJoin.get(Customer_.name)), likePattern)));
		}
		return searchPredicates;
	}

	private Long getTotalCount(CriteriaBuilder cb, InvoiceFilterRequestDto invoiceFilterRequestDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Invoice> countRoot = countQuery.from(Invoice.class);
		countQuery.select(cb.count(countRoot));

		List<Predicate> predicates = buildPredicates(cb, countRoot, invoiceFilterRequestDto);

		if (!predicates.isEmpty()) {
			countQuery.where(predicates.toArray(new Predicate[0]));
		}

		return entityManager.createQuery(countQuery).getSingleResult();
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

	public LocalDate getLatestInvoiceDate(Long customerId, Long projectId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<LocalDate> query = cb.createQuery(LocalDate.class);
		Root<Invoice> invoice = query.from(Invoice.class);

		// Select the maximum invoiceDate
		query.select(cb.greatest(invoice.get(Invoice_.invoiceDate)));

		// Add optional filters
		List<Predicate> predicates = new ArrayList<>();

		Join<Invoice, Customer> customerJoin = invoice.join(Invoice_.customer);
		predicates.add(cb.equal(customerJoin.get(Customer_.id), customerId));
		predicates.add(cb.equal(invoice.get(Invoice_.projectId), projectId));

		query.where(predicates.toArray(new Predicate[0]));

		// Execute the query
		TypedQuery<LocalDate> typedQuery = entityManager.createQuery(query);
		return typedQuery.getSingleResult();
	}

}
