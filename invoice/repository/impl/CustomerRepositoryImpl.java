package com.skapp.enterprise.invoice.repository.impl;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;
import com.skapp.enterprise.invoice.repository.CustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.query.QueryUtils;

import java.util.ArrayList;
import java.util.List;

import static com.skapp.community.peopleplanner.util.PeopleUtil.getSearchString;

@RequiredArgsConstructor
public class CustomerRepositoryImpl implements CustomerRepository {

	private final EntityManager entityManager;

	public Page<Customer> findAllCustomers(CustomerFilterDto customerFilterDto, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Customer> criteriaQuery = criteriaBuilder.createQuery(Customer.class);
		Root<Customer> root = criteriaQuery.from(Customer.class);

		List<Predicate> predicates = new ArrayList<>();

		if (customerFilterDto.getSearchKeyword() != null && !customerFilterDto.getSearchKeyword().isEmpty()) {
			predicates.add(findByName(customerFilterDto.getSearchKeyword(), criteriaBuilder, root));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		if (customerFilterDto.getSearchKeyword() != null && !customerFilterDto.getSearchKeyword().isEmpty()) {
			List<Order> orderList = new ArrayList<>();
			Order sortingOrder = criteriaBuilder.asc(criteriaBuilder.selectCase()
				.when(criteriaBuilder.like(root.get("name"), getSearchString(customerFilterDto.getSearchKeyword())),
						1));
			orderList.add(sortingOrder);
			orderList.addAll(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));
			criteriaQuery.orderBy(orderList);
		}
		else {
			criteriaQuery.distinct(true);
			criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));
		}

		TypedQuery<Customer> query = entityManager.createQuery(criteriaQuery);

		int totalRows = query.getResultList().size();

		if (page.isPaged()) {
			query.setFirstResult(page.getPageNumber() * page.getPageSize());
			query.setMaxResults(page.getPageSize());
		}

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	private Predicate findByName(String keyword, CriteriaBuilder criteriaBuilder, Root<Customer> customer) {
		keyword = getSearchString(keyword);
		return criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(customer.get("name")), keyword));
	}

}
