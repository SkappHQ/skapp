package com.skapp.community.peopleplanner.repository.impl;

import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.repository.EmployeeManagerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaDelete;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class EmployeeManagerRepositoryImpl implements EmployeeManagerRepository {

	private final EntityManager entityManager;

	@Override
	public void deleteByEmployeeAndManagerType(Employee employee, ManagerType managerType) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaDelete<EmployeeManager> criteriaDelete = criteriaBuilder.createCriteriaDelete(EmployeeManager.class);
		Root<EmployeeManager> root = criteriaDelete.from(EmployeeManager.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(EmployeeManager_.employee), employee));
		predicates.add(criteriaBuilder.equal(root.get(EmployeeManager_.managerType), managerType));

		criteriaDelete.where(predicates.toArray(new Predicate[0]));

		entityManager.createQuery(criteriaDelete).executeUpdate();
	}

	@Override
	public List<Long> findManagerSupervisingEmployee(Long managerId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<Employee> root = criteriaQuery.from(Employee.class);
		Join<Employee, EmployeeManager> employeeManagerJoin = root.join(Employee_.employeeManagers);

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder
			.equal(employeeManagerJoin.get(EmployeeManager_.manager).get(Employee_.employeeId), managerId));
		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray).distinct(true);
		Path<Long> employeeId = root.get(Employee_.employeeId);
		criteriaQuery.select(employeeId);

		TypedQuery<Long> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

}
