package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.request.AnnouncementInteractRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.service.AnnouncementService;
import com.skapp.enterprise.common.type.AnnouncementTriggerType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/announcement")
public class AnnouncementController {

	private final AnnouncementService announcementService;

	@GetMapping("/eligible")
	public ResponseEntity<ResponseEntityDto> getEligibleAnnouncements(
			@RequestParam(required = false) AnnouncementTriggerType trigger,
			@RequestParam(required = false) String page) {
		ResponseEntityDto response = announcementService.getEligibleAnnouncements(trigger, page);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/{announcementId}/interact")
	public ResponseEntity<ResponseEntityDto> recordInteraction(@PathVariable String announcementId,
			@RequestBody AnnouncementInteractRequestDto requestDto) {
		ResponseEntityDto response = announcementService.recordInteraction(announcementId, requestDto.getType());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
