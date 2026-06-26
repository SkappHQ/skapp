package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.leaveplanner.model.CarryForwardInfo;
import com.skapp.community.leaveplanner.model.CarryForwardInfo_;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.model.LeaveType_;
import com.skapp.community.leaveplanner.repository.CarryForwardInfoRepository;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CarryForwardInfoRepositoryImpl implements CarryForwardInfoRepository {

	@NonNull
	private EntityManager entityManager;

	@Override
	public Optional<CarryForwardInfo> findByEmployeeEmployeeIdAndLeaveTypeTypeIdAndCycleEndDate(Long employeeId,
			Long leaveTypeId, LocalDate leaveCycleEndDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<CarryForwardInfo> criteriaQuery = criteriaBuilder.createQuery(CarryForwardInfo.class);
		Root<CarryForwardInfo> root = criteriaQuery.from(CarryForwardInfo.class);
		Join<CarryForwardInfo, Employee> employee = root.join(CarryForwardInfo_.employee);
		Join<CarryForwardInfo, LeaveType> leaveType = root.join(CarryForwardInfo_.leaveType);

		List<Predicate> predicates = new ArrayList<>();
		if (leaveCycleEndDate != null) {
			predicates.add(criteriaBuilder.equal(root.get(CarryForwardInfo_.cycleEndDate), leaveCycleEndDate));
		}
		predicates.add(criteriaBuilder.equal(employee.get(Employee_.employeeId), employeeId));
		predicates.add(criteriaBuilder.equal(leaveType.get(LeaveType_.typeId), leaveTypeId));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<CarryForwardInfo> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList().stream().findFirst();
	}

}
