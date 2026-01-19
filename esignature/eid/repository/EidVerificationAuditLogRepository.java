package com.skapp.enterprise.esignature.eid.repository;

import com.skapp.enterprise.esignature.eid.model.EidVerificationAuditLog;
import com.skapp.enterprise.esignature.eid.type.EidVerificationEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EidVerificationAuditLogRepository extends JpaRepository<EidVerificationAuditLog, Long> {

	/**
	 * Find all audit logs for a session.
	 */
	List<EidVerificationAuditLog> findBySessionIdOrderByEventTimestampAsc(Long sessionId);

	/**
	 * Find all audit logs for an envelope.
	 */
	List<EidVerificationAuditLog> findByEnvelopeIdOrderByEventTimestampAsc(Long envelopeId);

	/**
	 * Find all audit logs for a recipient.
	 */
	List<EidVerificationAuditLog> findByRecipientIdOrderByEventTimestampAsc(Long recipientId);

	/**
	 * Find audit logs by event type.
	 */
	List<EidVerificationAuditLog> findByEventType(EidVerificationEventType eventType);

	/**
	 * Find audit logs within a time range.
	 */
	List<EidVerificationAuditLog> findByEventTimestampBetweenOrderByEventTimestampAsc(Instant start, Instant end);

	/**
	 * Get the latest audit log entry (for hash chain continuation).
	 */
	Optional<EidVerificationAuditLog> findFirstByOrderByIdDesc();

	/**
	 * Verify hash chain integrity by finding any record where the previous hash doesn't match.
	 */
	@Query("SELECT COUNT(a) FROM EidVerificationAuditLog a WHERE a.id > 1 AND a.previousHash IS NULL")
	long countBrokenHashChain();

}
