package com.skapp.community.crmplanner.util;

import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.Team_;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.experimental.UtilityClass;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@UtilityClass
public class CrmActivityScopeUtil {

	public static final char LIKE_ESCAPE = '\\';

	public List<Predicate> buildScopePredicates(CriteriaBuilder cb, CriteriaQuery<?> query, Path<Long> ownerId,
			Path<Instant> dateField, CrmActivityListParams params) {
		List<Predicate> predicates = new ArrayList<>();

		boolean isOrganizationWide = Boolean.TRUE.equals(params.getIsSuperAdmin())
				|| params.getCrmRole() == Role.CRM_ADMIN;

		if (!isOrganizationWide && params.getCrmRole() != Role.CRM_SALES_MANAGER) {
			predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
		}
		else if (!isOrganizationWide) {
			Subquery<Long> directReports = query.subquery(Long.class);
			Root<EmployeeManager> employeeManager = directReports.from(EmployeeManager.class);
			directReports.select(employeeManager.get(EmployeeManager_.employee).get(Employee_.employeeId))
				.where(cb.equal(employeeManager.get(EmployeeManager_.manager).get(Employee_.employeeId),
						params.getCurrentEmployeeId()),
						cb.equal(employeeManager.get(EmployeeManager_.managerType), ManagerType.PRIMARY));

			Subquery<Long> supervisedTeams = query.subquery(Long.class);
			Root<EmployeeTeam> supervisor = supervisedTeams.from(EmployeeTeam.class);
			supervisedTeams.select(supervisor.get(EmployeeTeam_.team).get(Team_.teamId))
				.where(cb.equal(supervisor.get(EmployeeTeam_.employee).get(Employee_.employeeId),
						params.getCurrentEmployeeId()), cb.isTrue(supervisor.get(EmployeeTeam_.isSupervisor)),
						cb.isTrue(supervisor.get(EmployeeTeam_.team).get(Team_.isActive)));

			Subquery<Long> teamMembers = query.subquery(Long.class);
			Root<EmployeeTeam> member = teamMembers.from(EmployeeTeam.class);
			teamMembers.select(member.get(EmployeeTeam_.employee).get(Employee_.employeeId))
				.where(member.get(EmployeeTeam_.team).get(Team_.teamId).in(supervisedTeams));

			predicates.add(cb.or(cb.equal(ownerId, params.getCurrentEmployeeId()), ownerId.in(directReports),
					ownerId.in(teamMembers)));
		}

		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(ownerId, params.getOwnerId()));
		}

		if (params.getRangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(dateField, params.getRangeStart()));
		}

		if (params.getRangeEnd() != null) {
			predicates.add(cb.lessThan(dateField, params.getRangeEnd()));
		}

		return predicates;
	}

	public List<Order> buildOrders(CriteriaBuilder cb, boolean sortByOwner, Path<String> ownerFirstName,
			Path<String> ownerLastName, Path<Instant> dateField, Path<Long> id, CrmActivityListParams params) {
		boolean ascending = params.getSortOrder().isAscending();
		List<Order> orders = new ArrayList<>();

		if (sortByOwner) {
			orders.add(ascending ? cb.asc(ownerFirstName) : cb.desc(ownerFirstName));
			orders.add(ascending ? cb.asc(ownerLastName) : cb.desc(ownerLastName));
			orders.add(cb.desc(dateField));
			orders.add(cb.desc(id));
		}
		else {
			orders.add(ascending ? cb.asc(dateField) : cb.desc(dateField));
			orders.add(ascending ? cb.asc(id) : cb.desc(id));
		}

		return orders;
	}

}
