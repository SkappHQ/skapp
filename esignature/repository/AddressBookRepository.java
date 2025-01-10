package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.AddressBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressBookRepository extends JpaRepository<AddressBook, Long> {

	void deleteByInternalUserUserId(Long internalUserId);

}
