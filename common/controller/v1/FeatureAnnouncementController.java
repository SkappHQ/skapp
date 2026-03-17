package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.request.AnnouncementListRequestFilterDto;
import com.skapp.enterprise.common.payload.request.AnnouncementStatusUpdateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementCreateRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.service.FeatureAnnouncementService;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlRequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/announcement")
@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
public class FeatureAnnouncementController {

	private final FeatureAnnouncementService featureAnnouncementService;

 	private final AmazonS3Service amazonS3Service;

	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> createAnnouncement(
			@Valid @RequestBody FeatureAnnouncementCreateRequestDto requestDto) {
		ResponseEntityDto response = featureAnnouncementService.createAnnouncement(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping("/list")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> getAnnouncements(
			@ModelAttribute AnnouncementListRequestFilterDto filterDto) {
		ResponseEntityDto response = featureAnnouncementService.getAnnouncements(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> getAnnouncementById(@RequestParam Long id) {
		ResponseEntityDto response = featureAnnouncementService.getAnnouncementById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PutMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> updateAnnouncement(
			@Valid @RequestBody FeatureAnnouncementCreateRequestDto requestDto) {
		ResponseEntityDto response = featureAnnouncementService.updateAnnouncement(requestDto.getAnnouncementId(),
				requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/status")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> updateAnnouncementStatus(
			@Valid @RequestBody AnnouncementStatusUpdateRequestDto requestDto) {
		ResponseEntityDto response = featureAnnouncementService.updateAnnouncementStatus(requestDto.getAnnouncementId(),
				requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/image/signed-url")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> getAnnouncementImageSignedUrl(
			@Valid @RequestBody AmazonS3SignedUrlRequestDto requestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrl(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
