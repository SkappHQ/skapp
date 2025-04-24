package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;

public interface EnvelopeService {

	ResponseEntityDto createNewEnvelope(EnvelopeDetailDto envelopeDetailDto);

	ResponseEntityDto updateEnvelope(Long id, EnvelopeUpdateDto envelopeUpdateDto);

	ResponseEntityDto getEmployeeNeedToSignEnvelopeCount(Long id);

	ResponseEntityDto getAllUserEnvelopes(EnvelopeInboxFilterDto envelopeInboxFilterDto);

	ResponseEntityDto getAllSentEnvelopes(EnvelopeSentFilterDto envelopeSentFilterDto);

	ResponseEntityDto getSenderKPI();

	ResponseEntityDto getEnvelopeForCurrentUser(Long id);

	ResponseEntityDto getEnvelopeForSender(Long id);

	ResponseEntityDto transferEnvelopeCustody(Long envelopeId, Long addressbookId);

	ResponseEntityDto getSignatureCertificate(Long envelopeId);

}
