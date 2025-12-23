package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.esignature.payload.request.DeclineEnvelopeRequestDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeNextFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.VoidEnvelopeRequestDto;
import org.springframework.http.HttpHeaders;

import java.util.List;

public interface EnvelopeService {

	ResponseEntityDto createNewEnvelope(EnvelopeDetailDto envelopeDetailDto);

	ResponseEntityDto updateEnvelope(Long id, EnvelopeUpdateDto envelopeUpdateDto);

	ResponseEntityDto getEmployeeNeedToSignEnvelopeCount(Long id);

	ResponseEntityDto getAllUserEnvelopes(EnvelopeInboxFilterDto envelopeInboxFilterDto);

	ResponseEntityDto getAllUserEnvelopesByUserId(EnvelopeInboxFilterDto envelopeInboxFilterDto, Long userId);

	ResponseEntityDto getAllSentEnvelopes(EnvelopeSentFilterDto envelopeSentFilterDto);

	ResponseEntityDto getSenderKPI();

	ResponseEntityDto getEnvelopeForCurrentUser(Long id);

	ResponseEntityDto getEnvelopeForSender(Long id);

	ResponseEntityDto transferEnvelopeCustody(Long envelopeId, Long addressbookId, String ipAddress);

	ResponseEntityDto getCurrentUserNextEnvelopes(EnvelopeNextFilterDto envelopeNextFilterDto);

	ResponseEntityDto voidEnvelope(Long envelopeId, VoidEnvelopeRequestDto voidEnvelopeRequestDto, String ipAddress);

	void transferEmployeeEnvelopes(List<Employee> employeeIds);

	ResponseEntityDto declineEnvelope(Long recipientId, DeclineEnvelopeRequestDto declineEnvelopeRequestDto,
			boolean isDocAccess, String ipAddress);

	byte[] getSignatureCertificate(Long envelopeId, HttpHeaders headers, boolean isDocAccess);

	byte[] generateCertificatePdfBytes(Long envelopeId, boolean isDocAccess);

	void expireEnvelope(Long envelopeId);

	ResponseEntityDto getEnvelopeTierLimitations();

}
