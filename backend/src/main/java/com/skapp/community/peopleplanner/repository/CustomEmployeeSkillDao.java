package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.CustomEmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomEmployeeSkillDao extends JpaRepository<CustomEmployeeSkill, Long> {

	Optional<CustomEmployeeSkill> findByNameIgnoreCase(String name);

}
