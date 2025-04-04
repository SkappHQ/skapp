package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.response.TemporaryLinkResponseDto;

public interface TemporarySignLinkService {

	TemporaryLinkResponseDto createTemporaryLink(Long envelopeId, Long recipientId);

	boolean isExpired(String token);

	ResponseEntityDto getSigningLinkData(Long envelopeId, Long recipientId);

}
