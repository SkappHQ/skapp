package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.CustomerDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerDocumentDao extends JpaRepository<CustomerDocument, Long>, CustomerDocumentRepository {

}
