package com.skapp.enterprise.esignature.repository;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface EnvelopeRepository {

	long countNeedToSignEnvelopes(Long currentUserId);

	PageDto getAllUserEnvelopes(Long currentUserId, EnvelopeInboxFilterDto envelopeInboxFilterDto);

	PageDto getAllSentEnvelopes(Long currentUserId, EnvelopeSentFilterDto envelopeSentFilterDto,
			boolean isAllSentEnvelopes);

	Map<EnvelopeStatus, Long> countEnvelopesByStatus(Long userId);

}
