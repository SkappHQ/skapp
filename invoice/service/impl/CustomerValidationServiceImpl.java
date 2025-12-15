package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;
import com.skapp.enterprise.invoice.repository.CustomerContactDao;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.CustomerDocumentDao;
import com.skapp.enterprise.invoice.service.CustomerValidationService;
import com.skapp.enterprise.invoice.type.DocumentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerValidationServiceImpl implements CustomerValidationService {

	private final CustomerDao customerDao;

	private final CustomerContactDao customerContactDao;

	private final CustomerDocumentDao customerDocumentDao;

	private static final int CUSTOMER_DOCUMENT_NAME_MAX_LENGTH = 255;

	private static final String CUSTOMER_DOCUMENT_NAME_REGEX = "^[a-zA-Z0-9\\s._-]+$";

	private static final String CUSTOMER_DOCUMENT_NAME_SPECIAL_CHAR_REGEX = "^[._-].*|.*[._-]$";

	private static final String CUSTOMER_DOCUMENT_PATH = "invoice/customer-details/otherDocuments/invoice/";

	private static final String CUSTOMER_DOCUMENT_NAME_PATTERN = "^\\d+_[A-Za-z0-9]+_\\d+\\.pdf$";

	@Override
	public void validateCustomerName(String customerName) {

		if (customerName == null || customerName.trim().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NAME_REQUIRED);
		}

		if (customerName.length() > InvoiceCommonConstant.CUSTOMER_NAME_LENGTH) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NAME_MAX_LENGTH_EXCEEDED);
		}

	}

	@Override
	public void validateCustomerBillingDetails(CustomerBillingDetailsDto customerBillingDetails) {

		if (customerBillingDetails.getEmail() != null) {
			Validations.validateEmail(customerBillingDetails.getEmail());

			if (customerDao.existsByEmail(customerBillingDetails.getEmail())) {
				throw new ValidationException(
						InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_EMAIL_ALREADY_EXISTS);
			}
		}

		if (customerBillingDetails.getVatId() != null) {
			String vatId = customerBillingDetails.getVatId().trim();

			if (vatId.length() > InvoiceCommonConstant.CUSTOMER_VAT_ID_LENGTH) {
				throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_VAT_ID_MAX_LENGTH_EXCEEDED);
			}

			if (!vatId.matches(InvoiceCommonConstant.CUSTOMER_VAT_ID_REGEX)) {
				throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_VAT_ID_INVALID_CHARACTERS);
			}
		}

	}

	@Override
	public void validateCustomerContactRequiredFields(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact) {

		if ((customerContact == null || customerContact.getName() == null)
				&& (customerContactDetailsDto.getContactName() == null
						|| customerContactDetailsDto.getContactName().trim().isEmpty())) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_NAME_REQUIRED);
		}

		if (customerContactDetailsDto.getContactName() != null
				&& customerContactDetailsDto.getContactName().length() > InvoiceCommonConstant.CUSTOMER_NAME_LENGTH) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_NAME_MAX_LENGTH_EXCEEDED);
		}

		if ((customerContact == null || customerContact.getEmail() == null)
				&& (customerContactDetailsDto.getEmail() == null
						|| customerContactDetailsDto.getEmail().trim().isEmpty())) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_EMAIL_REQUIRED);
		}

	}

	@Override
	public void validateCustomerContactDetails(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact) {

		Validations.validateEmail(customerContactDetailsDto.getEmail());

		boolean emailExists;

		if (customerContact != null && customerContact.getId() != null) {
			emailExists = customerContactDao.existsByEmailAndIdNot(customerContactDetailsDto.getEmail(),
					customerContact.getId());
		}
		else {

			emailExists = customerContactDao.existsByEmailAndIsActive(customerContactDetailsDto.getEmail(), true);
		}

		if (emailExists) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_CONTACT_EMAIL_ALREADY_EXISTS);
		}

		if ((customerContact == null || customerContact.getContactNo() == null)
				&& customerContactDetailsDto.getContactNo() != null
				&& !customerContactDetailsDto.getContactNo().isEmpty()) {
			Validations.validateContactNo(customerContactDetailsDto.getContactNo());
		}

	}

	@Override
	public void validateCustomerDocumentCreateRequestDto(
			CustomerDocumentCreateRequestDto customerDocumentCreateRequestDto, Customer customer) {

		validateCustomerDocumentNamePattern(customerDocumentCreateRequestDto.getName());

		if (validateCustomerActiveDocumentName(customerDocumentCreateRequestDto.getCustomerId(),
				customerDocumentCreateRequestDto.getName())) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_DUPLICATE_NAME_PROVIDED);
		}

		if (customerDocumentCreateRequestDto.getDocumentUrl() == null
				|| customerDocumentCreateRequestDto.getDocumentUrl().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_URL_REQUIRED);
		}

		validateCustomerToDocument(customer, customerDocumentCreateRequestDto.getDocumentUrl());

		if (customerDocumentCreateRequestDto.getCustomerId() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_ID_REQUIRED);
		}
	}

	@Override
	public void validateCustomerDocumentFilterDto(CustomerDocumentFilterDto customerDocumentFilterDto) {
		if (customerDocumentFilterDto == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_FILTER_INVALID);
		}

	}

	@Override
	public void validateCustomerDocumentRenameRequestDto(Long customerId, Long documentId, String documentName) {

		validateCustomerDocumentNamePattern(documentName);

		if (validateCustomerActiveDocumentNameForRename(customerId, documentId, documentName)) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_DUPLICATE_NAME_PROVIDED);
		}

	}

	private boolean validateCustomerActiveDocumentName(Long customerId, String documentName) {
		return customerDocumentDao.existsByCustomerIdAndNameAndDocumentStatus(customerId, documentName,
				DocumentStatus.UPLOADED);

	}

	private boolean validateCustomerActiveDocumentNameForRename(Long customerId, Long documentId, String documentName) {
		boolean allCustomerDocsNameAvailable = customerDocumentDao
			.existsByCustomerIdAndNameAndDocumentStatus(customerId, documentName, DocumentStatus.UPLOADED);

		boolean customerDocIdNameAvailable = customerDocumentDao.existsByIdAndNameAndDocumentStatus(documentId,
				documentName, DocumentStatus.UPLOADED);

		if (customerDocIdNameAvailable) {
			return false;
		}
		return allCustomerDocsNameAvailable;
	}

	private void validateCustomerDocumentNamePattern(String documentName) {

		String trimmedName = documentName.trim();

		if (documentName == null || documentName.isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_REQUIRED);
		}

		if (trimmedName.isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_REQUIRED);
		}

		if (trimmedName.length() > CUSTOMER_DOCUMENT_NAME_MAX_LENGTH) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_MAX_LENGTH_EXCEEDED);
		}

		if (!trimmedName.matches(CUSTOMER_DOCUMENT_NAME_REGEX)) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_INVALID_CHARACTERS);
		}

		// Check for path traversal attempts
		if (trimmedName.contains("..") || trimmedName.contains("./") || trimmedName.contains("\\")) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_INVALID_PATH);
		}

		// Check for consecutive special characters
		if (trimmedName.matches(".*[._-]{2,}.*")) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_INVALID_FORMAT);
		}

		// Check if name starts or ends with special characters
		if (trimmedName.matches(CUSTOMER_DOCUMENT_NAME_SPECIAL_CHAR_REGEX)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_INVALID_FORMAT);
		}

	}

	private void validateCustomerToDocument(Customer customer, String documentUrl) {

		String[] parts = documentUrl.split(CUSTOMER_DOCUMENT_PATH);

		if (parts.length > 1) {
			if (!parts[1].matches(CUSTOMER_DOCUMENT_NAME_PATTERN)) {
				throw new ValidationException(
						InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_DOES_NOT_MATCH_PATTERN);
			}

			String value = parts[1].trim().replaceAll("_.*$", "");

			if (!value.equals(String.valueOf(customer.getId()))) {
				throw new ValidationException(
						InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NOT_MATCHED_TO_CUSTOMER);
			}
		}
	}

}
