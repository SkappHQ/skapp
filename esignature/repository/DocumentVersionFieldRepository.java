package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.DocumentVersionField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentVersionFieldRepository extends JpaRepository<DocumentVersionField, Long> {

}
