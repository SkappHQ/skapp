package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DeclineEnvelopeRequestDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.VoidEnvelopeRequestDto;

public interface EnvelopeService {

	ResponseEntityDto createNewEnvelope(EnvelopeDetailDto envelopeDetailDto);

	ResponseEntityDto updateEnvelope(Long id, EnvelopeUpdateDto envelopeUpdateDto);

	ResponseEntityDto getEmployeeNeedToSignEnvelopeCount(Long id);

	ResponseEntityDto voidEnvelope(Long id, VoidEnvelopeRequestDto voidEnvelopeRequestDto);

	ResponseEntityDto declineEnvelope(Long recipientId, DeclineEnvelopeRequestDto declineEnvelopeRequestDto);

}
