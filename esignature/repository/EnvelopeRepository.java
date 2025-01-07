package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Envelope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnvelopeRepository extends JpaRepository<Envelope, Long> {

}
