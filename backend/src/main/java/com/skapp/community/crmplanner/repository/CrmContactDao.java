package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CrmContactDao extends JpaRepository<CrmContact, Long>, CrmContactRepository {

	boolean existsByEmailIgnoreCaseAndIsDeletedFalse(String email);

	Optional<CrmContact> findByIdAndIsDeletedFalse(Long id);

}
