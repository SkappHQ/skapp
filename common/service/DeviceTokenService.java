package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.RegisterDeviceTokenDto;

public interface DeviceTokenService {

	ResponseEntityDto registerDevice(RegisterDeviceTokenDto registerDeviceTokenDto);

}
