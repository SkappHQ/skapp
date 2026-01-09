package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.EpMessageService;
import com.skapp.enterprise.esignature.constant.EsignConstants;
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

		if (target == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR_TARGET_NOT_AVAILABLE);
		}

		if (otp == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR_CONTENT_NOT_AVAILABLE);

		}

		epMessageService.sendMessage(target, otp);
	}

}
