package com.skapp.enterprise.people.repository.impl;

import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.people.repository.EpEmployeeRoleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class EpEmployeeRoleRepositoryImpl implements EpEmployeeRoleRepository {

	private final EntityManager entityManager;

	@Override
	public long countByEmployeeRoleIsSuperAdminAndAccountStatus(Role roleName) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<EmployeeRole> root = criteriaQuery.from(EmployeeRole.class);
		Join<EmployeeRole, Employee> employee = root.join(EmployeeRole_.employee);

		List<Predicate> predicates = new ArrayList<>();

		if (roleName != null) {
			if (roleName == Role.ATTENDANCE_ADMIN || roleName == Role.ATTENDANCE_MANAGER) {
				predicates.add(criteriaBuilder.equal(root.get(EmployeeRole_.ATTENDANCE_ROLE), roleName));
				predicates.add(criteriaBuilder.isFalse(root.get(EmployeeRole_.isSuperAdmin)));
			}
			else if (roleName == Role.LEAVE_ADMIN || roleName == Role.LEAVE_MANAGER) {
				predicates.add(criteriaBuilder.equal(root.get(EmployeeRole_.LEAVE_ROLE), roleName));
				predicates.add(criteriaBuilder.isFalse(root.get(EmployeeRole_.isSuperAdmin)));
			}
			else if (roleName == Role.PEOPLE_ADMIN || roleName == Role.PEOPLE_MANAGER) {
				predicates.add(criteriaBuilder.equal(root.get(EmployeeRole_.PEOPLE_ROLE), roleName));
				predicates.add(criteriaBuilder.isFalse(root.get(EmployeeRole_.isSuperAdmin)));
			}
			else if (roleName == Role.PM_ADMIN) {
				predicates.add(criteriaBuilder.equal(root.get(EmployeeRole_.PM_ROLE), roleName));
				predicates.add(criteriaBuilder.isFalse(root.get(EmployeeRole_.isSuperAdmin)));
			}
			else if (roleName == Role.SUPER_ADMIN)
				predicates.add(criteriaBuilder.isTrue(root.get(EmployeeRole_.isSuperAdmin)));
		}

		predicates.add(criteriaBuilder.notEqual(employee.get(Employee_.accountStatus), AccountStatus.TERMINATED));
		predicates.add(criteriaBuilder.notEqual(employee.get(Employee_.accountStatus), AccountStatus.DELETED));

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		criteriaQuery.distinct(true);
		criteriaQuery.select(criteriaBuilder.count(root));

		TypedQuery<Long> query = entityManager.createQuery(criteriaQuery);
		return query.getSingleResult();
	}

}
