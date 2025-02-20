package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.BillingDetailsRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/stripe")
public class StripeController {

	private final StripeService stripeService;

	@PostMapping("/webhook")
	public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
			@RequestHeader("Stripe-Signature") String sigHeader) throws SignatureVerificationException {
		stripeService.handleStripeEvent(payload, sigHeader);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/subscription")
	public ResponseEntity<ResponseEntityDto> createSubscription(
			@Valid @RequestBody CreateSubscriptionRequestDto subscriptionRequestDto) {
		ResponseEntityDto response = null;
		try {
			response = stripeService.createSubscription(subscriptionRequestDto);
		}
		catch (StripeException e) {
			throw new RuntimeException(e);
		}
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping("/subscription")
	public ResponseEntity<ResponseEntityDto> getSubscriptionDetails() {
		ResponseEntityDto response = stripeService.getSubscriptionDetails();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/pricing-plans")
	public ResponseEntity<ResponseEntityDto> getPricingPlans() throws StripeException {
		ResponseEntityDto response = stripeService.getPricingPlans();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/billing-details")
	public ResponseEntity<ResponseEntityDto> getBillingDetails() throws StripeException {
		ResponseEntityDto response = stripeService.getBillingDetails();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/billing-details")
	public ResponseEntity<ResponseEntityDto> updateBillingDetails(
			@RequestBody BillingDetailsRequestDto billingDetailsRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.updateBillingDetails(billingDetailsRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/promotion-code/verify")
	public ResponseEntity<ResponseEntityDto> verifyPromotionCode(@RequestParam String promotionCode)
			throws StripeException {
		ResponseEntityDto response = stripeService.verifyPromotionCode(promotionCode);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
