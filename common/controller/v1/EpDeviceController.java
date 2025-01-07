package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.PushNotificationService;
import com.skapp.enterprise.common.payload.request.RegisterDeviceTokenDto;
import com.skapp.enterprise.common.service.DeviceTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/device")
@Tag(name = "EP device Controller", description = "Operations related enterprise to notification devices")
public class EpDeviceController {

	@NonNull
	private final DeviceTokenService notificationService;

	@NonNull
	private final PushNotificationService pushNotificationService;

	@PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE,
			produces = MediaType.APPLICATION_JSON_VALUE)
	@Operation(summary = "Register device", description = "Register a device to send notifications.")
	public ResponseEntity<ResponseEntityDto> registerDevice(@Valid @RequestBody RegisterDeviceTokenDto deviceTokenDto) {
		ResponseEntityDto response = notificationService.registerDevice(deviceTokenDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
