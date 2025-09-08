package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateExpenseAttachmentDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSearchRequestDto;
import com.skapp.enterprise.invoice.service.InvoiceValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceValidationServiceImpl implements InvoiceValidationService {

	@Override
	public void validateCreateInvoiceRequest(CreateInvoiceRequestDto createInvoiceRequestDto) {
		validateRequiredFields(createInvoiceRequestDto);
		validateDateConstraints(createInvoiceRequestDto);
		validateDiscountValues(createInvoiceRequestDto);
		validateInvoiceCollections(createInvoiceRequestDto);
	}

	private void validateRequiredFields(CreateInvoiceRequestDto request) {
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
		LocalDateTime now = LocalDateTime.now();

		if (request.getInvoiceDate().isAfter(now.plusDays(1))) {
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
		if (CollectionUtils.isEmpty(invoiceItems)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_ITEMS_REQUIRED);
		}

		for (int i = 0; i < invoiceItems.size(); i++) {
			CreateInvoiceItemDto item = invoiceItems.get(i);
			validateInvoiceItem(item);
		}
	}

	private void validateInvoiceItem(CreateInvoiceItemDto item) {
		if (item.getItemName() == null || item.getItemName().trim().isEmpty()) {
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
			for (int i = 0; i < invoiceExpenses.size(); i++) {
				CreateInvoiceExpenseDto expense = invoiceExpenses.get(i);
				validateInvoiceExpense(expense);
				if (!CollectionUtils.isEmpty(expense.getAttachments())) {
					validateExpenseAttachments(expense.getAttachments(), i);
				}
			}
		}
	}

	private void validateInvoiceExpense(CreateInvoiceExpenseDto expense) {
		if (expense.getName() == null || expense.getName().trim().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_NAME_REQUIRED);
		}

		if (expense.getCategory() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_CATEGORY_REQUIRED);
		}

		if (expense.getDate() == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_DATE_REQUIRED);
		}

		if (expense.getAmount() == null || expense.getAmount() <= 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_AMOUNT_INVALID);
		}

		LocalDateTime now = LocalDateTime.now();
		if (expense.getDate().isAfter(now.plusDays(1))) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_FUTURE_DATE_NOT_ALLOWED);
		}
	}

	private void validateExpenseAttachments(List<CreateExpenseAttachmentDto> attachments, int expenseIndex) {
		for (int i = 0; i < attachments.size(); i++) {
			CreateExpenseAttachmentDto attachment = attachments.get(i);
			if (attachment.getAttachmentUrl() == null || attachment.getAttachmentUrl().trim().isEmpty()) {
				throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_EXPENSE_ATTACHMENT_URL_REQUIRED);
			}
		}
	}

	@Override
	public void validateCreateInvoiceTaxesRequest(List<CreateInvoiceTaxDto> invoiceTaxes) {
		if (!CollectionUtils.isEmpty(invoiceTaxes)) {
			for (int i = 0; i < invoiceTaxes.size(); i++) {
				CreateInvoiceTaxDto tax = invoiceTaxes.get(i);
				validateInvoiceTax(tax);
			}
		}
	}

	private void validateInvoiceTax(CreateInvoiceTaxDto tax) {
		if (tax.getTaxType() == null || tax.getTaxType().trim().isEmpty()) {
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

		if (invoiceFilterRequestDto.getPage() < 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_PAGE_NEGATIVE);
		}

		if (invoiceFilterRequestDto.getSize() <= 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SIZE_INVALID);
		}

		if (invoiceFilterRequestDto.getSize() > 100) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SIZE_EXCEEDED);
		}

		if (invoiceFilterRequestDto.getSortBy() == null || invoiceFilterRequestDto.getSortBy().trim().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_BY_INVALID);
		}

		String[] allowedSortFields = { "id", "invoiceId", "customerId", "projectId", "invoiceDate", "dueDate", "status",
				"subTotalAmount", "payableTotalAmount", "createdDate" };

		boolean isValidSortField = false;
		for (String field : allowedSortFields) {
			if (field.equalsIgnoreCase(invoiceFilterRequestDto.getSortBy().trim())) {
				isValidSortField = true;
				break;
			}
		}

		if (!isValidSortField) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_BY_INVALID);
		}

		if (invoiceFilterRequestDto.getSortDirection() == null
				|| invoiceFilterRequestDto.getSortDirection().trim().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_DIRECTION_INVALID);
		}

		String sortDirection = invoiceFilterRequestDto.getSortDirection().trim().toUpperCase();
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

		// Validate that filter dates are not too far in the future
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime maxFutureDate = now.plusYears(10);

		if (invoiceFilterRequestDto.getInvoiceDateFrom() != null
				&& invoiceFilterRequestDto.getInvoiceDateFrom().isAfter(maxFutureDate)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_DATE_RANGE_INVALID);
		}

		if (invoiceFilterRequestDto.getInvoiceDateTo() != null
				&& invoiceFilterRequestDto.getInvoiceDateTo().isAfter(maxFutureDate)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_DATE_RANGE_INVALID);
		}

		if (invoiceFilterRequestDto.getDueDateFrom() != null
				&& invoiceFilterRequestDto.getDueDateFrom().isAfter(maxFutureDate)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_DUE_DATE_RANGE_INVALID);
		}

		if (invoiceFilterRequestDto.getDueDateTo() != null
				&& invoiceFilterRequestDto.getDueDateTo().isAfter(maxFutureDate)) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_DUE_DATE_RANGE_INVALID);
		}

		if (invoiceFilterRequestDto.getCustomerId() != null && invoiceFilterRequestDto.getCustomerId() <= 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_CUSTOMER_ID_INVALID);
		}

		if (invoiceFilterRequestDto.getProjectId() != null && invoiceFilterRequestDto.getProjectId() <= 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_PROJECT_ID_INVALID);
		}
	}

	@Override
	public void validateInvoiceSearchRequest(InvoiceSearchRequestDto invoiceSearchRequestDto) {
		if (invoiceSearchRequestDto.getInvoiceId() != null && invoiceSearchRequestDto.getInvoiceId().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_SEARCH_INVOICE_ID_INVALID);
		}
	}

	@Override
	public void validateInvoiceGetRequest(int page, int size, String sortBy, String sortDirection) {
		if (page < 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_PAGE_NEGATIVE);
		}
		if (size <= 0) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SIZE_INVALID);
		}
		if (size > 100) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SIZE_EXCEEDED);
		}
		if (sortBy == null || sortBy.trim().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_BY_INVALID);
		}
		String[] allowedSortFields = { "id", "invoiceId", "customerId", "projectId", "invoiceDate", "dueDate", "status",
				"subTotalAmount", "payableTotalAmount", "createdDate" };
		boolean isValidSortField = false;
		for (String field : allowedSortFields) {
			if (field.equalsIgnoreCase(sortBy.trim())) {
				isValidSortField = true;
				break;
			}
		}
		if (!isValidSortField) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_BY_INVALID);
		}
		if (sortDirection == null || sortDirection.trim().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_DIRECTION_INVALID);
		}
		String dir = sortDirection.trim().toUpperCase();
		if (!dir.equals("ASC") && !dir.equals("DESC")) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_FILTER_SORT_DIRECTION_INVALID);
		}
	}

}
