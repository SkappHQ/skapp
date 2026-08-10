package com.skapp.community.common.repository;

import com.skapp.community.common.model.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessUnitDao extends JpaRepository<BusinessUnit, Long> {

	List<BusinessUnit> findAllByOrderByNameAsc();

	boolean existsByName(String name);

	boolean existsByNameAndBusinessUnitIdNot(String name, Long businessUnitId);

}
