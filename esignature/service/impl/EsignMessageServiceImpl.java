package com.skapp.enterprise.esignature.service.impl;

import com.skapp.enterprise.common.service.EpMessageService;
import com.skapp.enterprise.esignature.service.EsignMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EsignMessageServiceImpl implements EsignMessageService {

	private final EpMessageService epMessageService;

	@Override
	public void sendOtpMessage(String target, String otp) {
		epMessageService.sendMessage(target, "Your OTP is: " + otp);
	}

}
