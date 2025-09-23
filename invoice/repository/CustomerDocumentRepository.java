package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerDocumentRepository {

	Page<CustomerDocument> findFilteredDocuments(CustomerDocumentFilterDto customerDocumentFilterDto,
			Pageable pageable);

}
