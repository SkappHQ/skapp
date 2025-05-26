package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.DocumentVersion;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

	Optional<DocumentVersion> findByVersionNumberAndDocumentId(int versionNumber, Long documentId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT d FROM DocumentVersion d WHERE d.versionNumber = :versionNumber AND d.document.id = :documentId")
	Optional<DocumentVersion> findByVersionNumberAndDocumentIdForUpdate(@Param("versionNumber") int versionNumber,
			@Param("documentId") Long documentId);

}
