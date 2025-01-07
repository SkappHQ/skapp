package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

}
