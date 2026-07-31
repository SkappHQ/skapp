package com.skapp.community.common.repository;

import com.skapp.community.common.model.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessUnitDao extends JpaRepository<BusinessUnit, Long> {

	List<BusinessUnit> findAllByOrderByNameAsc();

	List<BusinessUnit> findByNameIgnoreCase(String name);

	List<BusinessUnit> findByNameIgnoreCaseAndBusinessUnitIdNot(String name, Long businessUnitId);

}
