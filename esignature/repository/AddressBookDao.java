package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.AddressBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressBookDao extends JpaRepository<AddressBook, Long>, AddressBookRepository {

	void deleteByInternalUserUserId(Long internalUserId);

}
