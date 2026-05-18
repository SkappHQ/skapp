package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmContactDao extends JpaRepository<CrmContact, Long> {

	boolean existsByEmailIgnoreCaseAndIsDeletedFalse(String email);

	List<CrmContact> findByOwnerInAndIsDeletedFalse(List<Employee> owners);

	Optional<CrmContact> findByIdAndIsDeletedFalse(Long id);

}
