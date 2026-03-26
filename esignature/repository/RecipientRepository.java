package com.skapp.enterprise.esignature.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface RecipientRepository {

	String findPhoneByRecipientId(Long recipientId);

	Long countPendingDocumentsForUser(Long currentUserId);

	Long countPendingDocumentsForSendersAndAdmins();

}
