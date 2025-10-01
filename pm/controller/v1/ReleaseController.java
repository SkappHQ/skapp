package com.skapp.enterprise.pm.controller.v1;

import com.skapp.enterprise.pm.payload.ReleasePdfRequestDto;
import com.skapp.enterprise.pm.service.ReleaseService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/release")
public class ReleaseController {

	private final ReleaseService releaseService;

	@Operation(summary = "Generate release note PDF",
			description = "Generates and returns a PDF file for the release note")
	@PostMapping(value = "/generate-pdf", consumes = MediaType.APPLICATION_JSON_VALUE,
			produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> generateReleasePdf(@Valid @RequestBody ReleasePdfRequestDto requestDto,
			HttpServletRequest request) throws IOException {

		byte[] pdfBytes = releaseService.generateReleasePdf(requestDto.getReleaseId(), requestDto.getProjectKey(),
				request);

		String fileName = String.format("release_%s_%d.pdf", requestDto.getProjectKey(), requestDto.getReleaseId());

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_PDF);
		headers.setContentDispositionFormData("attachment", fileName);
		headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

		return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
	}

}