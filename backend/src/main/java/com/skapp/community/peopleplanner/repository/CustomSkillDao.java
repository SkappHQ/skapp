package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.CustomSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomSkillDao extends JpaRepository<CustomSkill, Long> {

	Optional<CustomSkill> findByNameIgnoreCase(String name);

}
