package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.type.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerDocumentDao extends JpaRepository<CustomerDocument, Long>, CustomerDocumentRepository {

	boolean existsByCustomerIdAndNameAndDocumentStatus(Long customerId, String documentName,
			DocumentStatus documentStatus);

	boolean existsByIdAndNameAndDocumentStatus(Long documentId, String documentName, DocumentStatus documentStatus);

}
