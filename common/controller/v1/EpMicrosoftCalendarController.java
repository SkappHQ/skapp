package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftConsentUrlDto;
import com.skapp.enterprise.common.service.EpMicrosoftCalendarService;
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
@RequestMapping("/v1/microsoft-calendar")
public class EpMicrosoftCalendarController {

	private final EpMicrosoftCalendarService epMicrosoftCalendarService;

	@GetMapping(value = "/redirect", produces = MediaType.APPLICATION_JSON_VALUE)
	public RedirectView connectMicrosoftCalendar(@Valid EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		return new RedirectView(epMicrosoftCalendarService.connectMicrosoftCalendar(epMicrosoftAuthRedirectDto));
	}

	@PostMapping(value = "/redirect", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> saveMicrosoftCalendarConfig(
			@Valid @RequestBody EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		ResponseEntityDto response = epMicrosoftCalendarService.saveMicrosoftCalendarConfig(epMicrosoftAuthRedirectDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping(value = "/connect", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getMicrosoftAuthUrl(
			@Valid @RequestBody EpMicrosoftConsentUrlDto epMicrosoftConsentUrlDto) {
		ResponseEntityDto response = epMicrosoftCalendarService.getMicrosoftAuthUrl(epMicrosoftConsentUrlDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PatchMapping(value = "/disconnect", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> disconnectMicrosoftCalendar() {
		ResponseEntityDto response = epMicrosoftCalendarService.disconnectMicrosoftCalendar();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/is-connected", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> isMicrosoftCalendarConnected() {
		ResponseEntityDto response = epMicrosoftCalendarService.isMicrosoftCalendarConnected();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
