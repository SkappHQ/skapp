package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.request.AnnouncementListRequestFilterDto;
import com.skapp.enterprise.common.payload.request.AnnouncementStatusUpdateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementCreateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementUpdateRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.service.FeatureAnnouncementService;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlRequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/announcement")
public class FeatureAnnouncementController {

	private final FeatureAnnouncementService featureAnnouncementService;

	@Autowired(required = false)
	private AmazonS3Service amazonS3Service;

	@PostMapping
	public ResponseEntity<ResponseEntityDto> createAnnouncement(
			@Valid @RequestBody FeatureAnnouncementCreateRequestDto requestDto) {
		ResponseEntityDto response = featureAnnouncementService.createAnnouncement(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping("/list")
	public ResponseEntity<ResponseEntityDto> getAnnouncements(
			@ModelAttribute AnnouncementListRequestFilterDto filterDto) {
		ResponseEntityDto response = featureAnnouncementService.getAnnouncements(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/{announcementId}")
	public ResponseEntity<ResponseEntityDto> getAnnouncementById(@PathVariable String announcementId) {
		ResponseEntityDto response = featureAnnouncementService.getAnnouncementById(announcementId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PutMapping("/{announcementId}")
	public ResponseEntity<ResponseEntityDto> updateAnnouncement(@PathVariable String announcementId,
			@Valid @RequestBody FeatureAnnouncementUpdateRequestDto requestDto) {
		ResponseEntityDto response = featureAnnouncementService.updateAnnouncement(announcementId, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/{announcementId}/status")
	public ResponseEntity<ResponseEntityDto> updateAnnouncementStatus(@PathVariable String announcementId,
			@Valid @RequestBody AnnouncementStatusUpdateRequestDto requestDto) {
		ResponseEntityDto response = featureAnnouncementService.updateAnnouncementStatus(announcementId, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/image/signed-url")
	public ResponseEntity<ResponseEntityDto> getAnnouncementImageSignedUrl(
			@Valid @RequestBody AmazonS3SignedUrlRequestDto requestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrl(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
