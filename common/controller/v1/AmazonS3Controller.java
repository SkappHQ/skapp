package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.AmazonS3RequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/s3")
public class AmazonS3Controller {

	private final AmazonS3Service amazonS3Service;

	@PostMapping("/signed-url")
	public ResponseEntity<ResponseEntityDto> getSignedUrl(@Valid @RequestBody AmazonS3RequestDto amazonS3RequestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrl(amazonS3RequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
