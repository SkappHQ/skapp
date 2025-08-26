package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentVersionDao extends JpaRepository<DocumentVersion, Long>, DocumentVersionRepository {

	Optional<DocumentVersion> findByVersionNumberAndDocumentId(int versionNumber, Long documentId);

	Optional<DocumentVersion> findFirstByVersionNumberAndDocumentIdOrderByIdDesc(int versionNumber, Long documentId);

}
