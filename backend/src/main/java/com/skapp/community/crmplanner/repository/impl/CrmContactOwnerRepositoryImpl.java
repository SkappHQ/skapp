package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Repository
@RequiredArgsConstructor
public class CrmContactOwnerRepositoryImpl implements CrmContactOwnerRepository {

	private final EntityManager entityManager;

	@Override
	public Page<Employee> findContactOwners(CrmContactOwnerFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> query = cb.createQuery(Employee.class);
		Root<Employee> employee = query.from(Employee.class);
		Join<Employee, User> user = employee.join(Employee_.user, JoinType.INNER);
		Join<Employee, EmployeeRole> employeeRole = employee.join(Employee_.employeeRole, JoinType.INNER);

		List<Predicate> predicates = buildPredicates(cb, employee, user, employeeRole, filterDto);
		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(employee.get(Employee_.firstName))),
				cb.asc(cb.lower(employee.get(Employee_.lastName))));

		TypedQuery<Employee> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getTotalContactOwnerCount(cb, filterDto));
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Employee> employee, Join<Employee, User> user,
			Join<Employee, EmployeeRole> employeeRole, CrmContactOwnerFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isTrue(user.get(User_.isActive)));
		predicates.add(cb.or(cb.isTrue(employeeRole.get(EmployeeRole_.isSuperAdmin)),
				cb.and(cb.isNotNull(employeeRole.get(EmployeeRole_.crmRole)),
						cb.notEqual(employeeRole.get(EmployeeRole_.crmRole), Role.CRM_NONE))));

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT));
			String likePattern = "%" + escaped + "%";
			predicates.add(cb.or(cb.like(cb.lower(employee.get(Employee_.firstName)), likePattern, '\\'),
					cb.like(cb.lower(employee.get(Employee_.lastName)), likePattern, '\\'),
					cb.like(cb.lower(user.get(User_.email)), likePattern, '\\')));
		}

		return predicates;
	}

	private Long getTotalContactOwnerCount(CriteriaBuilder cb, CrmContactOwnerFilterDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Employee> employee = countQuery.from(Employee.class);
		Join<Employee, User> user = employee.join(Employee_.user, JoinType.INNER);
		Join<Employee, EmployeeRole> employeeRole = employee.join(Employee_.employeeRole, JoinType.INNER);
		countQuery.select(cb.count(employee));

		List<Predicate> predicates = buildPredicates(cb, employee, user, employeeRole, filterDto);
		countQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

}
