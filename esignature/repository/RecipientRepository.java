package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.type.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipientRepository {

	String findPhoneByRecipientId(Long recipientId);

}
