package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.BillingDetailsRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.PaymentMethodRequestDto;
import com.skapp.enterprise.common.payload.request.PromotionCodeRequestDto;
import com.skapp.enterprise.common.service.StripeService;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

	@PostMapping("/webhook")
	public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
			@RequestHeader("Stripe-Signature") String sigHeader) throws StripeException {
		stripeService.handleStripeEvent(payload, sigHeader);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/subscription")
	public ResponseEntity<ResponseEntityDto> createSubscription(
			@Valid @RequestBody CreateSubscriptionRequestDto subscriptionRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.createSubscription(subscriptionRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping("/subscription")
	public ResponseEntity<ResponseEntityDto> getSubscriptionDetails() throws StripeException {
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

	@PostMapping("/promotion-code/verify")
	public ResponseEntity<ResponseEntityDto> verifyPromotionCode(
			@RequestBody PromotionCodeRequestDto promotionCodeRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.verifyPromotionCode(promotionCodeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/payment-methods")
	public ResponseEntity<ResponseEntityDto> getPaymentMethods() throws StripeException {
		ResponseEntityDto response = stripeService.getPaymentMethods();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/payment-method")
	public ResponseEntity<ResponseEntityDto> attachPaymentMethodToCustomer(
			@RequestBody PaymentMethodRequestDto paymentMethodRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.attachPaymentMethodToCustomer(paymentMethodRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/payment-method/default")
	public ResponseEntity<ResponseEntityDto> setDefaultPaymentMethod(
			@RequestBody PaymentMethodRequestDto paymentMethodRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.setDefaultPaymentMethod(paymentMethodRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@DeleteMapping("/payment-method")
	public ResponseEntity<ResponseEntityDto> removePaymentMethod(
			@RequestBody PaymentMethodRequestDto paymentMethodRequestDto) throws StripeException {
		ResponseEntityDto response = stripeService.removePaymentMethod(paymentMethodRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
