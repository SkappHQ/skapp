package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Envelope;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface EnvelopeDao extends JpaRepository<Envelope, Long>, EnvelopeRepository {

	boolean existsByUuid(String uuid);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT e FROM Envelope e LEFT JOIN FETCH e.recipients WHERE e.id = :envelopeId")
	Envelope findByIdWithRecipientsForUpdate(@Param("envelopeId") Long envelopeId);

	long countBySentAtGreaterThanEqualAndSentAtLessThan(LocalDateTime start, LocalDateTime end);

}
