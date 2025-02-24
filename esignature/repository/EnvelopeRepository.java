package com.skapp.enterprise.esignature.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface EnvelopeRepository {

	long countNeedToSignEnvelopes(Long currentUserId);

}
