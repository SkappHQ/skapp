package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.TemporaryLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TemporaryLinkRepository extends JpaRepository<TemporaryLink, Long> {

	Optional<TemporaryLink> findByToken(String token);

	Optional<TemporaryLink> findByTokenAndTenantId(String token, String tenantId);

	@Query("SELECT tl FROM TemporaryLink tl WHERE tl.documentId = :documentId AND tl.tenantId = :tenantId AND tl.active = true")
	List<TemporaryLink> findActiveByDocumentIdAndTenantId(@Param("documentId") Long documentId,
			@Param("tenantId") String tenantId);

	@Query("SELECT tl FROM TemporaryLink tl WHERE tl.expiresAt < :now")
	List<TemporaryLink> findExpiredLinks(@Param("now") LocalDateTime now);

	@Query("SELECT tl FROM TemporaryLink tl WHERE tl.clickCount >= tl.maxClicks")
	List<TemporaryLink> findLinksWithMaxClicksReached();

}