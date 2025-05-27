package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlRequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/s3")
public class AmazonS3Controller {

	private final AmazonS3Service amazonS3Service;

	@PostMapping("/files/signed-url")
	public ResponseEntity<ResponseEntityDto> getSignedUrl(
			@Valid @RequestBody AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrl(amazonS3SignedUrlRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@DeleteMapping("/files/{objectKey}")
	public ResponseEntity<ResponseEntityDto> deleteFileFromS3(@PathVariable String objectKey) {
		ResponseEntityDto response = amazonS3Service.deleteFileFromS3(objectKey);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
