package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.ReminderEmailRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateExpenseAttachmentDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto;
import com.skapp.enterprise.invoice.payload.request.invoice.InvoiceStatusUpdateRequestDto;
import com.skapp.enterprise.invoice.repository.InvoiceDao;
import com.skapp.enterprise.invoice.service.InvoiceValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceValidationServiceImpl implements InvoiceValidationService {

	private final InvoiceDao invoiceDao;

	private static final String[] ALLOWED_SORT_FIELDS = { "id", "invoiceId", "customerId", "projectId", "invoiceDate",
			"dueDate", "status", "subTotalAmount", "payableTotalAmount", "createdDate" };

	@Override
	public void validateCreateInvoiceRequest(CreateInvoiceRequestDto createInvoiceRequestDto) {
		validateRequiredFields(createInvoiceRequestDto);
		validateDateConstraints(createInvoiceRequestDto);
		validateDiscountValues(createInvoiceRequestDto);
		validateInvoiceCollections(createInvoiceRequestDto);
	}

	private void validateRequiredFields(CreateInvoiceRequestDto request) {
		if (request.getInvoiceId() == null || !request.getInvoiceId().matches(InvoiceCommonConstant.INVOICE_ID_REGEX)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_ID_INVALID);
		}

		if (request.getCustomerId() != null) {
			invoiceDao.findByCustomer_IdAndInvoiceId(request.getCustomerId(), request.getInvoiceId())
				.ifPresent(invoice -> {
					throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_ID_ALREADY_EXISTS);
				});
		}

		if (request.getCustomerId() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_ID_REQUIRED);
		}

		if (request.getInvoiceDate() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_DATE_REQUIRED);
		}

		if (request.getCurrency() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CURRENCY_REQUIRED);
		}

		if (request.getStatus() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_STATUS_REQUIRED);
		}
	}

	private void validateDateConstraints(CreateInvoiceRequestDto request) {
		LocalDate today = LocalDate.now();

		if (request.getInvoiceDate().isAfter(today)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FUTURE_DATE_NOT_ALLOWED);
		}

		if (request.getDueDate() != null && request.getDueDate().isBefore(request.getInvoiceDate())) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_DUE_DATE_BEFORE_INVOICE_DATE);
		}
	}

	private void validateDiscountValues(CreateInvoiceRequestDto request) {
		if (request.getDiscountValue() != null && request.getDiscountValue() < 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_NEGATIVE_DISCOUNT);
		}

		if (request.getDiscountType() != null && request.getDiscountValue() != null) {
			switch (request.getDiscountType()) {
				case PERCENTAGE:
					if (request.getDiscountValue() > 100) {
						throw new ValidationException(
								InvoiceMessageConstant.INVOICE_ERROR_DISCOUNT_PERCENTAGE_EXCEEDED);
					}
					break;
				case FLAT:
					// Additional validation for flat discount if needed
					break;
			}
		}
	}

	private void validateInvoiceCollections(CreateInvoiceRequestDto request) {
		if (CollectionUtils.isEmpty(request.getInvoiceItems())) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_ITEMS_REQUIRED);
		}
	}

	@Override
	public void validateCreateInvoiceItemsRequest(List<CreateInvoiceItemDto> invoiceItems) {
		invoiceItems.forEach(this::validateInvoiceItem);
	}

	private void validateInvoiceItem(CreateInvoiceItemDto item) {
		if (item.getItemName() == null || item.getItemName().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_ITEM_NAME_REQUIRED);
		}

		if (item.getQuantity() == null || item.getQuantity() <= 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_ITEM_QUANTITY_INVALID);
		}

		if (item.getUnitPrice() == null || item.getUnitPrice() < 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_ITEM_UNIT_PRICE_INVALID);
		}

		if (item.getDiscountType() != null && item.getDiscountValue() != null) {
			switch (item.getDiscountType()) {
				case PERCENTAGE:
					if (item.getDiscountValue() > 100) {
						throw new ValidationException(
								InvoiceMessageConstant.INVOICE_ERROR_ITEM_DISCOUNT_PERCENTAGE_EXCEEDED);
					}
					break;
				case FLAT:
					// Validate that flat discount doesn't exceed item total
					double itemTotal = item.getQuantity() * item.getUnitPrice();
					if (item.getDiscountValue() > itemTotal) {
						throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_ITEM_DISCOUNT_EXCEEDS_TOTAL);
					}
					break;
			}
		}
	}

	@Override
	public void validateCreateInvoiceExpensesRequest(List<CreateInvoiceExpenseDto> invoiceExpenses) {
		if (!CollectionUtils.isEmpty(invoiceExpenses)) {
			invoiceExpenses.forEach(expense -> {
				validateInvoiceExpense(expense);
				if (!CollectionUtils.isEmpty(expense.getAttachments())) {
					validateExpenseAttachments(expense.getAttachments());
				}
			});
		}
	}

	private void validateInvoiceExpense(CreateInvoiceExpenseDto expense) {
		if (expense.getName() == null || expense.getName().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_NAME_REQUIRED);
		}

		if (expense.getCategory() == null || expense.getCategory().toString().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_CATEGORY_REQUIRED);
		}

		if (expense.getDate() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_DATE_REQUIRED);
		}

		if (expense.getAmount() == null || expense.getAmount() <= 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_AMOUNT_INVALID);
		}

		LocalDate today = LocalDate.now();
		if (expense.getDate().isAfter(today)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_FUTURE_DATE_NOT_ALLOWED);
		}
	}

	private void validateExpenseAttachments(List<CreateExpenseAttachmentDto> attachments) {
		attachments.forEach(attachment -> {
			if (attachment.getAttachmentUrl() == null || attachment.getAttachmentUrl().isEmpty()) {
				throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_ATTACHMENT_URL_REQUIRED);
			}
		});
	}

	@Override
	public void validateCreateInvoiceTaxesRequest(List<CreateInvoiceTaxDto> invoiceTaxes) {
		if (!CollectionUtils.isEmpty(invoiceTaxes)) {
			invoiceTaxes.forEach(this::validateInvoiceTax);
		}
	}

	private void validateInvoiceTax(CreateInvoiceTaxDto tax) {
		if (tax.getTaxType() == null || tax.getTaxType().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_TAX_TYPE_REQUIRED);
		}

		if (tax.getTaxPercentage() == null || tax.getTaxPercentage() < 0 || tax.getTaxPercentage() > 100) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_TAX_PERCENTAGE_INVALID);
		}
	}

	@Override
	public void validateInvoiceFilterRequest(InvoiceFilterRequestDto invoiceFilterRequestDto) {
		if (invoiceFilterRequestDto == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_REQUEST_NULL);
		}

		if (invoiceFilterRequestDto.getSortBy() == null || invoiceFilterRequestDto.getSortBy().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_BY_INVALID);
		}

		boolean isValidSortField = false;
		for (String field : ALLOWED_SORT_FIELDS) {
			if (field.equalsIgnoreCase(invoiceFilterRequestDto.getSortBy())) {
				isValidSortField = true;
				break;
			}
		}

		if (!isValidSortField) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_BY_INVALID);
		}

		if (invoiceFilterRequestDto.getSortDirection() == null
				|| invoiceFilterRequestDto.getSortDirection().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_DIRECTION_INVALID);
		}

		String sortDirection = invoiceFilterRequestDto.getSortDirection().toUpperCase();
		if (!sortDirection.equals("ASC") && !sortDirection.equals("DESC")) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_DIRECTION_INVALID);
		}

		if (invoiceFilterRequestDto.getInvoiceDateFrom() != null
				&& invoiceFilterRequestDto.getInvoiceDateTo() != null) {
			if (invoiceFilterRequestDto.getInvoiceDateFrom().isAfter(invoiceFilterRequestDto.getInvoiceDateTo())) {
				throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_DATE_RANGE_INVALID);
			}
		}

		if (invoiceFilterRequestDto.getDueDateFrom() != null && invoiceFilterRequestDto.getDueDateTo() != null) {
			if (invoiceFilterRequestDto.getDueDateFrom().isAfter(invoiceFilterRequestDto.getDueDateTo())) {
				throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_DUE_DATE_RANGE_INVALID);
			}
		}

		if (invoiceFilterRequestDto.getCustomerId() != null
				&& invoiceFilterRequestDto.getCustomerId().toString().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_CUSTOMER_ID_INVALID);
		}

		if (invoiceFilterRequestDto.getProjectId() != null
				&& invoiceFilterRequestDto.getProjectId().toString().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_PROJECT_ID_INVALID);
		}
	}

	@Override
	public void validateInvoiceStatusUpdateRequest(InvoiceStatusUpdateRequestDto invoiceStatusUpdateRequestDto) {
		if (invoiceStatusUpdateRequestDto.getInvoiceId() == null
				|| invoiceStatusUpdateRequestDto.getInvoiceId().toString().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_ID_INVALID);
		}
	}

	@Override
	public void validateReminderEmailRequest(ReminderEmailRequestDto reminderEmailRequestDto) {
		if (reminderEmailRequestDto == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_REQUEST_NULL);
		}
		if (reminderEmailRequestDto.getInvoiceId() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_ID_INVALID);
		}
		if (reminderEmailRequestDto.getTo() != null || !reminderEmailRequestDto.getTo().isEmpty()) {
			Validations.validateEmail(reminderEmailRequestDto.getTo());
		}
		if (reminderEmailRequestDto.getSubject() == null || reminderEmailRequestDto.getSubject().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_REMINDER_SUBJECT_REQUIRED);
		}
		if (reminderEmailRequestDto.getBody() == null || reminderEmailRequestDto.getBody().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_REMINDER_BODY_REQUIRED);
		}
		if (reminderEmailRequestDto.getCcEmails() != null && !reminderEmailRequestDto.getCcEmails().isEmpty()) {
			reminderEmailRequestDto.getCcEmails().forEach(Validations::validateEmail);
		}
	}

}
