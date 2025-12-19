package com.skapp.enterprise.people.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.repository.impl.EmployeeRepositoryImpl;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.model.ModuleConfig;
import com.skapp.enterprise.people.repository.EpEmployeeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Repository
@Primary
public class EpEmployeeRepositoryImpl extends EmployeeRepositoryImpl implements EpEmployeeRepository {

	private final EntityManager entityManager;

	public EpEmployeeRepositoryImpl(EntityManager entityManager, EntityManager entityManager1) {
		super(entityManager);
		this.entityManager = entityManager1;
	}

	@Override
	public List<Employee> getManagerRoleEmployeesExcludingEmployeeIds(List<Long> employeeIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<ModuleConfig> moduleQuery = criteriaBuilder.createQuery(ModuleConfig.class);
		Root<ModuleConfig> moduleRoot = moduleQuery.from(ModuleConfig.class);
		moduleQuery.select(moduleRoot);

		ModuleConfig moduleConfig = entityManager.createQuery(moduleQuery).getSingleResult();

		CriteriaQuery<Employee> query = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> employeeRoot = query.from(Employee.class);
		Join<Employee, EmployeeRole> roleJoin = employeeRoot.join(Employee_.employeeRole, JoinType.INNER);

		Predicate statusPredicate = employeeRoot.get(Employee_.accountStatus)
			.in(Arrays.asList(AccountStatus.ACTIVE, AccountStatus.PENDING));

		Predicate notInEmployeeIdsPredicate = employeeIds != null && !employeeIds.isEmpty()
				? criteriaBuilder.not(employeeRoot.get(Employee_.employeeId).in(employeeIds))
				: criteriaBuilder.conjunction();

		List<Predicate> rolePredicates = new ArrayList<>();

		rolePredicates.add(criteriaBuilder.isTrue(roleJoin.get(EmployeeRole_.isSuperAdmin)));

		if (moduleConfig.isAttendanceModule()) {
			rolePredicates.add(criteriaBuilder.or(
					criteriaBuilder.equal(roleJoin.get(EmployeeRole_.attendanceRole), Role.ATTENDANCE_MANAGER),
					criteriaBuilder.equal(roleJoin.get(EmployeeRole_.attendanceRole), Role.ATTENDANCE_ADMIN)));
		}

		if (moduleConfig.isLeaveModule()) {
			rolePredicates.add(
					criteriaBuilder.or(criteriaBuilder.equal(roleJoin.get(EmployeeRole_.leaveRole), Role.LEAVE_MANAGER),
							criteriaBuilder.equal(roleJoin.get(EmployeeRole_.leaveRole), Role.LEAVE_ADMIN)));
		}

		rolePredicates
			.add(criteriaBuilder.or(criteriaBuilder.equal(roleJoin.get(EmployeeRole_.peopleRole), Role.PEOPLE_MANAGER),
					criteriaBuilder.equal(roleJoin.get(EmployeeRole_.peopleRole), Role.PEOPLE_ADMIN)));

		if (moduleConfig.isEsignModule()) {
			rolePredicates
				.add(criteriaBuilder.or(criteriaBuilder.equal(roleJoin.get(EmployeeRole_.esignRole), Role.ESIGN_ADMIN),
						criteriaBuilder.equal(roleJoin.get(EmployeeRole_.esignRole), Role.ESIGN_SENDER)));
		}

		Predicate rolePredicate = criteriaBuilder.or(rolePredicates.toArray(new Predicate[0]));
		Predicate finalPredicate = criteriaBuilder.and(statusPredicate, notInEmployeeIdsPredicate, rolePredicate);

		query.where(finalPredicate);
		query.select(employeeRoot).distinct(true);

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public List<Employee> getAllGuestUsers(String email, List<AccountStatus> statuses) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> query = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> employeeRoot = query.from(Employee.class);
		Join<Employee, EmployeeRole> roleJoin = employeeRoot.join(Employee_.employeeRole, JoinType.INNER);
		Join<Employee, User> userJoin = employeeRoot.join(Employee_.user, JoinType.INNER);

		Predicate finalPredicate = criteriaBuilder.equal(roleJoin.get(EmployeeRole_.pmRole), Role.PM_GUEST_EMPLOYEE);

		Predicate notDeletedPredicate = criteriaBuilder.notEqual(employeeRoot.get(Employee_.accountStatus),
				AccountStatus.DELETED);
		finalPredicate = criteriaBuilder.and(finalPredicate, notDeletedPredicate);

		if (email != null && !email.isEmpty()) {
			Predicate emailPredicate = criteriaBuilder.like(criteriaBuilder.lower(userJoin.get(User_.email)),
					"%" + email.toLowerCase() + "%");
			finalPredicate = criteriaBuilder.and(finalPredicate, emailPredicate);
		}

		if (statuses != null && !statuses.isEmpty()) {
			Predicate statusPredicate = employeeRoot.get(Employee_.accountStatus).in(statuses);
			finalPredicate = criteriaBuilder.and(finalPredicate, statusPredicate);
		}

		query.where(finalPredicate);
		query.select(employeeRoot).distinct(true);

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	protected void buildEnterprisePredicates(CriteriaBuilder criteriaBuilder, Root<Employee> root,
			Join<Employee, User> userJoin, List<Predicate> predicates) {
		Join<Employee, EmployeeRole> employeeRoleJoin = root.join(Employee_.employeeRole);
		predicates.add(criteriaBuilder.notEqual(employeeRoleJoin.get(EmployeeRole_.PM_ROLE), Role.PM_GUEST_EMPLOYEE));
	}

}
