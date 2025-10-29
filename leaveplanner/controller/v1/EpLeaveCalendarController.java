package com.skapp.enterprise.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.leaveplanner.payload.request.EpOutOfOfficeEventRequestDto;
import com.skapp.enterprise.leaveplanner.service.EpLeaveCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/leave/calendar")
public class EpLeaveCalendarController {

	private final EpLeaveCalendarService epLeaveCalendarService;

	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getDateRangeAndWorkingHoursForLeave(@PathVariable Long id) {
		ResponseEntityDto response = epLeaveCalendarService.getDateRangeAndWorkingHoursForLeave(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/add-event", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> addOutOfOfficeEventsForLeave(
			@RequestBody EpOutOfOfficeEventRequestDto epOutOfOfficeEventRequestDto) {
		ResponseEntityDto response = epLeaveCalendarService.addOutOfOfficeEventsForLeave(epOutOfOfficeEventRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
