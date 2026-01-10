package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateDto;
import com.skapp.enterprise.esignature.service.EnvelopeTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnvelopeTemplateServiceImpl implements EnvelopeTemplateService {

	@Override
	public ResponseEntityDto createNewEnvelopeTemplate(EnvelopeTemplateDto envelopeTemplateDto) {
		return null;
	}

}
