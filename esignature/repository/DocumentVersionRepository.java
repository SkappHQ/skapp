package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

	Optional<DocumentVersion> findByVersionNumberAndDocumentId(int versionNumber, Long documentId);

}
