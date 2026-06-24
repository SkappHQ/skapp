package com.skapp.community.peopleplanner.repository.impl;

import com.skapp.community.peopleplanner.model.CustomEmployeeSkill;
import com.skapp.community.peopleplanner.model.CustomEmployeeSkill_;
import com.skapp.community.peopleplanner.model.EmployeeSkill;
import com.skapp.community.peopleplanner.model.EmployeeSkill_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.payload.response.EmployeeSkillResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeSkillRepository;
import com.skapp.community.peopleplanner.type.EmployeeSkillType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class EmployeeSkillRepositoryImpl implements EmployeeSkillRepository {

	private final EntityManager entityManager;

	@Override
	public List<EmployeeSkillResponseDto> getEmployeeSkills(Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeSkillResponseDto> criteriaQuery = criteriaBuilder
			.createQuery(EmployeeSkillResponseDto.class);
		Root<EmployeeSkill> root = criteriaQuery.from(EmployeeSkill.class);

		Join<EmployeeSkill, CustomEmployeeSkill> customSkillJoin = root.join(CustomEmployeeSkill.class, JoinType.LEFT);
		customSkillJoin.on(
				criteriaBuilder.equal(customSkillJoin.get(CustomEmployeeSkill_.id), root.get(EmployeeSkill_.skillId)),
				criteriaBuilder.equal(root.get(EmployeeSkill_.skillType), EmployeeSkillType.CUSTOM));

		criteriaQuery.select(criteriaBuilder.construct(EmployeeSkillResponseDto.class, root.get(EmployeeSkill_.skillId),
				customSkillJoin.get(CustomEmployeeSkill_.name), root.get(EmployeeSkill_.skillType)));
		criteriaQuery
			.where(criteriaBuilder.equal(root.get(EmployeeSkill_.employee).get(Employee_.employeeId), employeeId));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

}
