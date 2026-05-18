package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
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
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CrmContactOwnerRepositoryImpl implements CrmContactOwnerRepository {

	private final EntityManager entityManager;

	@Override
	public Page<Employee> findContactOwners(CrmContactOwnerFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> query = cb.createQuery(Employee.class);
		Root<Employee> employee = query.from(Employee.class);
		Join<Employee, User> user = employee.join("user", JoinType.INNER);
		Join<Employee, EmployeeRole> employeeRole = employee.join("employeeRole", JoinType.INNER);

		List<Predicate> predicates = buildPredicates(cb, employee, user, employeeRole, filterDto);
		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(employee.<String>get("firstName"))),
				cb.asc(cb.lower(employee.<String>get("lastName"))));

		TypedQuery<Employee> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getTotalCount(cb, filterDto));
	}

	@Override
	public Optional<Employee> findFallbackAdminOwner() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> query = cb.createQuery(Employee.class);
		Root<Employee> employee = query.from(Employee.class);
		Join<Employee, User> user = employee.join("user", JoinType.INNER);
		Join<Employee, EmployeeRole> employeeRole = employee.join("employeeRole", JoinType.INNER);

		query.where(cb.and(cb.isTrue(user.<Boolean>get("isActive")),
				cb.or(cb.isTrue(employeeRole.<Boolean>get("isSuperAdmin")),
						cb.equal(employeeRole.<Role>get("crmRole"), Role.CRM_ADMIN))));
		query.orderBy(cb.asc(employee.<Long>get("employeeId")));

		TypedQuery<Employee> typedQuery = entityManager.createQuery(query);
		typedQuery.setMaxResults(1);

		List<Employee> employees = typedQuery.getResultList();
		return employees.isEmpty() ? Optional.empty() : Optional.of(employees.getFirst());
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Employee> employee, Join<Employee, User> user,
			Join<Employee, EmployeeRole> employeeRole, CrmContactOwnerFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isTrue(user.<Boolean>get("isActive")));
		predicates.add(cb.or(cb.isTrue(employeeRole.<Boolean>get("isSuperAdmin")),
				employeeRole.<Role>get("crmRole")
					.in(Role.CRM_ADMIN, Role.CRM_SALES_MANAGER, Role.CRM_SALES_REPRESENTATIVE)));

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT));
			String likePattern = "%" + escaped + "%";
			predicates.add(cb.or(cb.like(cb.lower(employee.<String>get("firstName")), likePattern, '\\'),
					cb.like(cb.lower(employee.<String>get("lastName")), likePattern, '\\'),
					cb.like(cb.lower(user.<String>get("email")), likePattern, '\\')));
		}

		return predicates;
	}

	private String escapeLikePattern(String input) {
		return input.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
	}

	private Long getTotalCount(CriteriaBuilder cb, CrmContactOwnerFilterDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<Employee> employee = countQuery.from(Employee.class);
		Join<Employee, User> user = employee.join("user", JoinType.INNER);
		Join<Employee, EmployeeRole> employeeRole = employee.join("employeeRole", JoinType.INNER);
		countQuery.select(cb.count(employee));

		List<Predicate> predicates = buildPredicates(cb, employee, user, employeeRole, filterDto);
		countQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

}
