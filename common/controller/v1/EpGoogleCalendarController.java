package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleConsentUrlDto;
import com.skapp.enterprise.common.service.EpGoogleCalenderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/google-calendar")
public class EpGoogleCalendarController {

	private final EpGoogleCalenderService epGoogleCalenderService;

	@GetMapping(value = "/redirect", produces = MediaType.APPLICATION_JSON_VALUE)
	public RedirectView connectGoogleCalendar(@Valid EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		return new RedirectView(epGoogleCalenderService.connectGoogleCalendar(epGoogleAuthRedirectDto));
	}

	@PostMapping(value = "/redirect", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> saveGoogleCalendarConfig(
			@Valid @RequestBody EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		ResponseEntityDto response = epGoogleCalenderService.saveGoogleCalendarConfig(epGoogleAuthRedirectDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping(value = "/connect", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getGoogleAuthUrl(
			@Valid @RequestBody EpGoogleConsentUrlDto epGoogleConsentUrlDto) {
		ResponseEntityDto response = epGoogleCalenderService.getGoogleAuthUrl(epGoogleConsentUrlDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PatchMapping(value = "/disconnect", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> disconnectGoogleCalendar() {
		ResponseEntityDto response = epGoogleCalenderService.disconnectGoogleCalendar();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping(value = "/is-connected", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> isGoogleCalendarConnected() {
		ResponseEntityDto response = epGoogleCalenderService.isGoogleCalendarConnected();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
