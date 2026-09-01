package com.skapp.community.common.repository;

import com.skapp.community.common.model.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessUnitDao extends JpaRepository<BusinessUnit, Long> {

	List<BusinessUnit> findAllByOrderByNameAsc();

	Optional<BusinessUnit> findByName(String name);

	List<BusinessUnit> findByNameIgnoreCase(String name);

}
