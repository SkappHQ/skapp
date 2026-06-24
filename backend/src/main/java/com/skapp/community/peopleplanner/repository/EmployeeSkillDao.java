package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.EmployeeSkill;
import com.skapp.community.peopleplanner.model.EmployeeSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeSkillDao extends JpaRepository<EmployeeSkill, EmployeeSkillId>, EmployeeSkillRepository {

	List<EmployeeSkill> findByEmployeeEmployeeId(Long employeeId);

}
