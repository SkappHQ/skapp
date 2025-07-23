package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.model.SupportRequest;
import com.skapp.enterprise.common.model.SupportRequestAttachment;
import com.skapp.enterprise.common.payload.request.ApplySupportRequestDto;
import com.skapp.enterprise.common.payload.response.ApplySupportResponseDto;
import com.skapp.enterprise.common.repository.SupportRequestDao;
import com.skapp.enterprise.common.service.SupportRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportRequestServiceImpl implements SupportRequestService {

	private final EpCommonMapper epCommonMapper;

	private final SupportRequestDao supportRequestDao;

	@Override
	public ResponseEntityDto applySupportRequest(ApplySupportRequestDto applySupportRequestDto) {
		log.info("applySupportRequest: execution started");

		SupportRequest supportRequest = epCommonMapper.applySupportRequestDtoToSupportRequest(applySupportRequestDto);

		if (applySupportRequestDto.getAttachments() != null) {
			SupportRequest finalSupportRequest = supportRequest;
			Set<SupportRequestAttachment> supportRequestAttachments = applySupportRequestDto.getAttachments()
				.stream()
				.map(url -> new SupportRequestAttachment(url, finalSupportRequest))
				.collect(Collectors.toSet());
			supportRequest.setAttachments(supportRequestAttachments);
		}

		supportRequest = supportRequestDao.save(supportRequest);

		ApplySupportResponseDto applySupportResponseDto = epCommonMapper
			.supportRequestToApplySupportResponseDto(supportRequest);

		log.info("applySupportRequest: execution ended");

		return new ResponseEntityDto(false, applySupportResponseDto);

	}

}
