package com.skapp.enterprise.invoice.repository.impl;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.enterprise.invoice.model.BillableRate;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import com.skapp.enterprise.invoice.repository.BillableRateRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import static com.skapp.community.peopleplanner.util.PeopleUtil.getSearchString;

@RequiredArgsConstructor
public class BillableRateRepositoryImpl implements BillableRateRepository {

	private final EntityManager entityManager;

	@Override
	public List<BillableRate> findAllProjectTeamMembers(ProjectMemberFilterDto projectMemberFilterDto) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<BillableRate> criteriaQuery = criteriaBuilder.createQuery(BillableRate.class);

		Root<BillableRate> root = criteriaQuery.from(BillableRate.class);
		Join<BillableRate, Employee> employeeJoin = root.join("employee", JoinType.INNER);

		List<Predicate> predicates = new ArrayList<>();

		if (projectMemberFilterDto.getSearchKeyword() != null && !projectMemberFilterDto.getSearchKeyword().isEmpty()) {
			predicates.add(findByName(projectMemberFilterDto.getSearchKeyword(), criteriaBuilder, employeeJoin));
		}

		predicates.add(criteriaBuilder.equal(root.get("isActive"), true));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		if (projectMemberFilterDto.getSearchKeyword() != null && !projectMemberFilterDto.getSearchKeyword().isEmpty()) {
			List<Order> orderList = new ArrayList<>();
			Order sortingOrder = criteriaBuilder.asc(criteriaBuilder.selectCase()
				.when(criteriaBuilder.like(criteriaBuilder.lower(employeeJoin.get(Employee_.FIRST_NAME)),
						getSearchString(projectMemberFilterDto.getSearchKeyword()).toLowerCase()), 1)
				.when(criteriaBuilder.like(criteriaBuilder.lower(employeeJoin.get(Employee_.LAST_NAME)),
						getSearchString(projectMemberFilterDto.getSearchKeyword()).toLowerCase()), 2)
				.otherwise(3));
			orderList.add(sortingOrder);
			criteriaQuery.orderBy(orderList);
		}
		else {
			criteriaQuery.distinct(true);
		}

		TypedQuery<BillableRate> query = entityManager.createQuery(criteriaQuery);

		return query.getResultList();
	}

	private Predicate findByName(String keyword, CriteriaBuilder criteriaBuilder,
			Join<BillableRate, Employee> employeeJoin) {
		keyword = getSearchString(keyword);
		return criteriaBuilder.or(
				criteriaBuilder.like(criteriaBuilder
					.lower(criteriaBuilder.concat(criteriaBuilder.concat(employeeJoin.get(Employee_.FIRST_NAME), " "),
							employeeJoin.get(Employee_.LAST_NAME))),
						keyword),
				criteriaBuilder.like(criteriaBuilder.lower(employeeJoin.get(Employee_.LAST_NAME)), keyword));
	}

}
