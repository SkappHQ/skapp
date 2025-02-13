package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/stripe")
public class StripeController {

	private final StripeService stripeService;

	@PostMapping("/webhook")
	public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
			@RequestHeader("Stripe-Signature") String sigHeader) throws SignatureVerificationException {
		stripeService.handleStripeEvent(payload, sigHeader);
		return ResponseEntity.ok().build();
	}

}
