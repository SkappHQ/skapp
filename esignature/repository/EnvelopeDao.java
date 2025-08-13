package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.Envelope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnvelopeDao extends JpaRepository<Envelope, Long>, EnvelopeRepository {

	boolean existsByUuid(String uuid);

	long countBySentAtGreaterThanEqualAndSentAtLessThan(LocalDateTime startDateTime, LocalDateTime endDateTime);

	List<Envelope> findByOwner(AddressBook owner);

}
