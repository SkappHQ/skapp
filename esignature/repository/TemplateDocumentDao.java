package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.TemplateDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateDocumentDao extends JpaRepository<TemplateDocument, Long> {

}
