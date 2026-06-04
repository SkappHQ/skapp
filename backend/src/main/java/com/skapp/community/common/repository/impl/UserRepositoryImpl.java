package com.skapp.community.common.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.repository.UserRepository;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

	private final EntityManager entityManager;

	@Override
	public List<User> findAllByIsActiveTrueAndEmployeeWorkLocationInAndEmployeeRolePmRoleNot(
			Set<WorkLocation> workLocations, Role pmRole) {
		return findActiveUsersExcludingPmRole(pmRole, workLocations);
	}

	@Override
	public List<User> findAllByIsActiveTrueAndEmployeeRolePmRoleNot(Role pmRole) {
		return findActiveUsersExcludingPmRole(pmRole, null);
	}

	private List<User> findActiveUsersExcludingPmRole(Role excludedPmRole, Set<WorkLocation> workLocations) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<User> query = cb.createQuery(User.class);
		Root<User> userRoot = query.from(User.class);

		Join<User, Employee> employeeJoin = userRoot.join(User_.EMPLOYEE, JoinType.INNER);
		Join<Employee, EmployeeRole> roleJoin = employeeJoin.join(Employee_.EMPLOYEE_ROLE, JoinType.LEFT);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isTrue(userRoot.get(User_.IS_ACTIVE)));
		predicates.add(cb.or(roleJoin.get(EmployeeRole_.PM_ROLE).isNull(),
				cb.notEqual(roleJoin.get(EmployeeRole_.PM_ROLE), excludedPmRole)));

		if (workLocations != null && !workLocations.isEmpty()) {
			predicates.add(employeeJoin.get(Employee_.WORK_LOCATION).in(workLocations));
		}

		query.select(userRoot).where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(query).getResultList();
	}

}
