package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.EsignConfigDto;

public interface EsignConfigService {

	void setDefaultEsignConfigs();

	ResponseEntityDto updateEsignConfig(EsignConfigDto esignConfigDto);

	ResponseEntityDto getEsignConfig();

	ResponseEntityDto getExternalEsignConfig();

	void updateMfaEnabled(boolean enabled);

}
