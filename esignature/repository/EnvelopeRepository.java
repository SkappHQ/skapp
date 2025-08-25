package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeNextData;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface EnvelopeRepository {

	long countNeedToSignEnvelopes(Long currentUserId);

	Page<Envelope> getAllUserEnvelopes(Long currentUserId, EnvelopeInboxFilterDto envelopeInboxFilterDto);

	Page<EnvelopeNextData> getCurrentUserEnvelopesByExpireDate(Long currentUserId, int page, int size);

	Page<Envelope> getAllSentEnvelopes(Long currentUserId, EnvelopeSentFilterDto envelopeSentFilterDto,
			boolean isAllSentEnvelopes);

	Map<EnvelopeStatus, Long> countEnvelopesByStatus(Long userId, boolean isAllCount);

	Envelope findByIdWithRecipientsForUpdate(Long envelopeId);

}
