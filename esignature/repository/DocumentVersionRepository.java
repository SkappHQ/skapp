package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.DocumentVersion;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentVersionRepository {

	List<DocumentVersion> findByVersionNumberAndDocumentIdForUpdateOrdered(int versionNumber, Long documentId);

}
