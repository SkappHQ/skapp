package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.SubscriptionRequestDto;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.StripeWebhookService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/stripe")
public class StripeController {

	private final StripeService stripeService;

	private final StripeWebhookService stripeWebhookService;

	@PostMapping("/webhook")
	public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
			@RequestHeader("Stripe-Signature") String sigHeader) throws StripeException {
		stripeWebhookService.handleStripeEvent(payload, sigHeader);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/subscription")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getSubscriptionDetails() throws StripeException {
		ResponseEntityDto response = stripeService.getSubscriptionDetails();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/pricing-plans")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getPricingPlans() throws StripeException {
		ResponseEntityDto response = stripeService.getPricingPlans();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/checkout-session")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> createCheckoutSession(
			@RequestBody SubscriptionRequestDto subscriptionRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.createCheckoutSession(subscriptionRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/customer-portal-session")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> createPortalSession() throws StripeException {
		ResponseEntityDto response = stripeService.createCustomerPortalSession();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/activate-tenant-after-trial")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> activateTenantAfterFreeTrial() {
		ResponseEntityDto response = stripeService.activateTenantAfterFreeTrial();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/upgrade-tier")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> upgradeTierSubscription(
			@RequestBody SubscriptionRequestDto subscriptionRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.upgradeTierSubscription(subscriptionRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
