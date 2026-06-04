package com.skapp.enterprise.timeplanner.controller.v1;

import com.skapp.enterprise.timeplanner.service.AdmsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequiredArgsConstructor
// TEMP: ADMS external integration endpoints are temporary for the current rollout phase.
@RequestMapping("/external/adms/{tenantId}/iclock")
@Profile("!ep-prd")
public class AdmsController {

	private final AdmsService admsService;

	@GetMapping(value = "/cdata", produces = MediaType.TEXT_PLAIN_VALUE)
	public ResponseEntity<String> handshake(@PathVariable String tenantId,
			@RequestParam(value = "SN", required = false) String serialNumber, HttpServletRequest request) {
		String response = admsService.handleHandshake(tenantId, serialNumber, request);
		return ResponseEntity.ok(response);
	}

	@PostMapping(value = "/cdata", produces = MediaType.TEXT_PLAIN_VALUE)
	public ResponseEntity<String> receiveRecords(@PathVariable String tenantId,
			@RequestParam(value = "SN", required = false) String serialNumber,
			@RequestParam(value = "table", required = false) String table,
			@RequestParam(value = "Stamp", required = false) String stamp, HttpServletRequest request)
			throws IOException {
		String body = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
		String response = admsService.receiveRecords(tenantId, serialNumber, table, stamp, body, request);
		return ResponseEntity.ok(response);
	}

	@GetMapping(value = "/getrequest", produces = MediaType.TEXT_PLAIN_VALUE)
	public ResponseEntity<String> getRequest(@PathVariable String tenantId,
			@RequestParam(value = "SN", required = false) String serialNumber) {
		String response = admsService.getRequest(tenantId, serialNumber);
		return ResponseEntity.ok(response);
	}

}
