package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.InvoiceMapper;
import com.skapp.enterprise.invoice.model.ExpenseAttachment;
import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.InvoiceExpense;
import com.skapp.enterprise.invoice.model.InvoiceItem;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceListResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSearchRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSummaryResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceTierLimitationResponseDto;
import com.skapp.enterprise.invoice.repository.InvoiceDao;
import com.skapp.enterprise.invoice.service.InvoiceService;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

	@Value("${invoice.allocated-free-tier-invoice-count}")
	private long allocatedFreeTierInvoiceCount;

	private final InvoiceDao invoiceDao;

	private final InvoiceMapper invoiceMapper;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	@Override
	@Transactional
	public ResponseEntityDto createInvoice(CreateInvoiceRequestDto createInvoiceRequestDto) {

		InvoiceTierLimitationResponseDto invoiceTierLimitationResponseDto = processInvoiceTierLimitation();

		if (invoiceTierLimitationResponseDto.isLimitedReached()) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_ENVELOPE_LIMIT_REACHED);
		}

		Invoice invoice = createInvoiceEntity(createInvoiceRequestDto);

		// Save invoice first to get the generated ID
		Invoice savedInvoice = invoiceDao.save(invoice);

		// Create and set invoice itemss
		List<InvoiceItem> invoiceItems = createInvoiceItems(createInvoiceRequestDto.getInvoiceItems(), savedInvoice);
		savedInvoice.setInvoiceItems(invoiceItems);

		// Create and set invoice expenses if provided (without attachments first)
		if (createInvoiceRequestDto.getInvoiceExpenses() != null
				&& !createInvoiceRequestDto.getInvoiceExpenses().isEmpty()) {
			List<InvoiceExpense> invoiceExpenses = createInvoiceExpensesWithoutAttachments(
					createInvoiceRequestDto.getInvoiceExpenses(), savedInvoice);
			savedInvoice.setInvoiceExpenses(invoiceExpenses);
		}

		// Create and set invoice taxes if provided
		if (createInvoiceRequestDto.getInvoiceTaxes() != null && !createInvoiceRequestDto.getInvoiceTaxes().isEmpty()) {
			List<com.skapp.enterprise.invoice.model.InvoiceTax> invoiceTaxes = createInvoiceTaxes(
					createInvoiceRequestDto.getInvoiceTaxes(), savedInvoice);
			savedInvoice.setInvoiceTaxes(invoiceTaxes);
		}

		// Calculate totals
		calculateInvoiceTotals(savedInvoice);

		// Save invoice with all child entities to get their IDs
		Invoice invoiceWithChildIds = invoiceDao.save(savedInvoice);

		// Now add attachments to expenses that have IDs
		if (createInvoiceRequestDto.getInvoiceExpenses() != null
				&& !createInvoiceRequestDto.getInvoiceExpenses().isEmpty()) {
			addAttachmentsToExpenses(createInvoiceRequestDto.getInvoiceExpenses(),
					invoiceWithChildIds.getInvoiceExpenses());
		}

		// Final save with attachments
		Invoice finalInvoice = invoiceDao.save(invoiceWithChildIds);

		return new ResponseEntityDto(false, finalInvoice.getId());
	}

	private Invoice createInvoiceEntity(CreateInvoiceRequestDto request) {
		Invoice invoice = new Invoice();

		// Generate a unique invoice ID
		String generatedInvoiceId = generateInvoiceId();
		invoice.setInvoiceId(generatedInvoiceId);

		invoice.setCustomerId(request.getCustomerId());
		invoice.setProjectId(request.getProjectId());
		invoice.setInvoiceDate(request.getInvoiceDate());
		invoice.setDueDate(request.getDueDate());
		invoice.setBilledTo(request.getBilledTo());
		invoice.setPayTo(request.getPayTo());
		invoice.setCurrency(request.getCurrency());
		invoice.setStatus(request.getStatus());
		invoice.setDiscountType(request.getDiscountType());
		invoice.setDiscountValue(request.getDiscountValue());
		invoice.setInvoiceTerms(request.getInvoiceTerms());
		invoice.setInvoiceNotes(request.getInvoiceNotes());
		invoice.setSubTotalAmount(request.getSubTotalAmount());
		invoice.setPayableTotalAmount(request.getPayableTotalAmount());

		return invoice;
	}

	private String generateInvoiceId() {
		// Generate invoice ID in format: INV-YYYY-NNNNNN (e.g., INV-2024-000001)
		String year = String.valueOf(java.time.LocalDate.now().getYear());
		long timestamp = System.currentTimeMillis();
		String uniqueNumber = String.format("%06d", timestamp % 1000000);
		return "INV-" + year + "-" + uniqueNumber;
	}

	private List<InvoiceItem> createInvoiceItems(List<CreateInvoiceItemDto> itemDtos, Invoice invoice) {
		return itemDtos.stream().map(itemDto -> {
			InvoiceItem item = new InvoiceItem();
			item.setInvoice(invoice);
			item.setInvoiceId(invoice.getId()); // Explicitly set the invoice_id
			item.setItemName(itemDto.getItemName());
			item.setDescription(itemDto.getDescription());
			item.setQuantity(itemDto.getQuantity());
			item.setUnitPrice(itemDto.getUnitPrice());
			item.setDiscountType(itemDto.getDiscountType());
			item.setDiscountValue(itemDto.getDiscountValue());

			// Calculate item amount
			double itemTotal = itemDto.getQuantity() * itemDto.getUnitPrice();
			if (itemDto.getDiscountValue() != null && itemDto.getDiscountValue() > 0) {
				if (itemDto.getDiscountType() == com.skapp.enterprise.invoice.type.DiscountType.PERCENTAGE) {
					itemTotal = itemTotal - (itemTotal * itemDto.getDiscountValue() / 100);
				}
				else {
					itemTotal -= itemDto.getDiscountValue();
				}
			}
			item.setAmount(itemTotal);

			return item;
		}).collect(Collectors.toList());
	}

	private List<InvoiceExpense> createInvoiceExpensesWithoutAttachments(List<CreateInvoiceExpenseDto> expenseDtos,
			Invoice invoice) {
		return expenseDtos.stream().map(expenseDto -> {
			InvoiceExpense expense = new InvoiceExpense();
			expense.setInvoice(invoice);
			expense.setInvoiceId(invoice.getId());
			expense.setName(expenseDto.getName());
			expense.setCategory(expenseDto.getCategory());
			expense.setDate(expenseDto.getDate());
			expense.setAmount(expenseDto.getAmount());

			return expense;
		}).collect(Collectors.toList());
	}

	private List<com.skapp.enterprise.invoice.model.InvoiceTax> createInvoiceTaxes(
			List<com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto> taxDtos, Invoice invoice) {
		return taxDtos.stream().map(taxDto -> {
			com.skapp.enterprise.invoice.model.InvoiceTax tax = new com.skapp.enterprise.invoice.model.InvoiceTax();
			tax.setInvoice(invoice);
			tax.setInvoiceId(invoice.getId());
			tax.setTaxType(taxDto.getTaxType());
			tax.setTaxPercentage(taxDto.getTaxPercentage());
			return tax;
		}).collect(Collectors.toList());
	}

	private void calculateInvoiceTotals(Invoice invoice) {
		double itemsTotal = invoice.getInvoiceItems().stream().mapToDouble(InvoiceItem::getAmount).sum();

		double expensesTotal = 0.0;
		if (invoice.getInvoiceExpenses() != null) {
			expensesTotal = invoice.getInvoiceExpenses().stream().mapToDouble(InvoiceExpense::getAmount).sum();
		}

		double subtotal = itemsTotal + expensesTotal;

		// Apply invoice-level discount
		if (invoice.getDiscountValue() != null && invoice.getDiscountValue() > 0) {
			subtotal -= invoice.getDiscountValue();
		}

		// Apply taxes from the separate tax table
		double totalTaxAmount = 0.0;
		if (invoice.getInvoiceTaxes() != null) {
			final double finalSubtotal = subtotal; // Make it effectively final for lambda
			totalTaxAmount = invoice.getInvoiceTaxes().stream().mapToDouble(tax -> {
				if (tax.getTaxPercentage() != null) {
					return finalSubtotal * (tax.getTaxPercentage() / 100);
				}
				return 0.0;
			}).sum();
		}

		double finalTotal = subtotal + totalTaxAmount;
		invoice.setSubTotalAmount(subtotal);
		invoice.setPayableTotalAmount(finalTotal);
	}

	private void addAttachmentsToExpenses(List<CreateInvoiceExpenseDto> expenseDtos,
			List<InvoiceExpense> savedExpenses) {
		for (int i = 0; i < expenseDtos.size(); i++) {
			CreateInvoiceExpenseDto expenseDto = expenseDtos.get(i);
			InvoiceExpense savedExpense = savedExpenses.get(i);

			// Create attachments for the saved expense
			if (expenseDto.getAttachments() != null && !expenseDto.getAttachments().isEmpty()) {
				List<ExpenseAttachment> attachments = expenseDto.getAttachments().stream().map(attachmentDto -> {
					ExpenseAttachment attachment = new ExpenseAttachment();
					attachment.setExpense(savedExpense);
					attachment.setExpenseId(savedExpense.getId());
					attachment.setAttachmentUrl(attachmentDto.getAttachmentUrl());
					return attachment;
				}).collect(Collectors.toList());
				savedExpense.setAttachments(attachments);
			}
		}
	}

	// Other method implementations remain the same...
	@Override
	public ResponseEntityDto getInvoices(int page, int size, String sortBy, String sortDirection) {
		try {
			// Validate pagination parameters
			if (page < 0)
				page = 0;
			if (size < 1)
				size = 20;
			if (size > 100)
				size = 100; // Maximum page size limit

			// Create pageable with user-provided parameters
			Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
			Sort sort = Sort.by(direction, sortBy);
			Pageable pageable = PageRequest.of(page, size, sort);

			// Fetch paginated invoices from repository
			Page<Invoice> invoicePage = invoiceDao.findAll(pageable);

			// Enhanced debug logging
			System.out.println("=== PAGINATION DEBUG ===");
			System.out.println("Requested page: " + page + ", size: " + size + ", sortBy: " + sortBy + ", direction: "
					+ sortDirection);
			System.out.println("Total invoices in database: " + invoicePage.getTotalElements());
			System.out.println("Invoices returned in this page: " + invoicePage.getContent().size());
			System.out.println("Total pages: " + invoicePage.getTotalPages());
			System.out.println("Current page number: " + invoicePage.getNumber());
			System.out.println("Page size: " + invoicePage.getSize());

			// Log each invoice and its items count
			for (int i = 0; i < invoicePage.getContent().size(); i++) {
				Invoice inv = invoicePage.getContent().get(i);
				int itemsCount = inv.getInvoiceItems() != null ? inv.getInvoiceItems().size() : 0;
				System.out.println("Invoice " + (i + 1) + ": ID=" + inv.getId() + ", InvoiceID=" + inv.getInvoiceId()
						+ ", Items=" + itemsCount);
			}

			// Convert invoices to response DTOs using mapper
			List<InvoiceResponseDto> invoiceResponseDtos = invoiceMapper
				.invoicesToInvoiceResponseDtos(invoicePage.getContent());
			System.out.println("Mapped invoice DTOs count: " + invoiceResponseDtos.size());

			// Log each mapped DTO
			for (int i = 0; i < invoiceResponseDtos.size(); i++) {
				InvoiceResponseDto dto = invoiceResponseDtos.get(i);
				System.out.println("Mapped DTO " + (i + 1) + ": ID=" + dto.getId() + ", InvoiceID=" + dto.getInvoiceId()
						+ ", ItemCount=" + dto.getItemCount());
			}

			// Create paginated response
			InvoiceListResponseDto invoiceListResponse = new InvoiceListResponseDto(invoiceResponseDtos,
					invoicePage.getTotalElements(), invoicePage.getTotalPages(), invoicePage.getNumber(),
					invoicePage.getSize());

			System.out.println("Final response - Invoices in list: " + invoiceListResponse.getInvoices().size());
			System.out.println("=== END PAGINATION DEBUG ===");

			return new ResponseEntityDto(false, invoiceListResponse);
		}
		catch (Exception e) {
			System.err.println("Error in getInvoices: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	@Override
	public ResponseEntityDto getFilteredInvoices(InvoiceFilterRequestDto invoiceFilterRequestDto) {
		try {
			// Validate pagination parameters
			int page = invoiceFilterRequestDto.getPage();
			int size = invoiceFilterRequestDto.getSize();
			String sortBy = invoiceFilterRequestDto.getSortBy();
			String sortDirection = invoiceFilterRequestDto.getSortDirection();

			if (page < 0)
				page = 0;
			if (size < 1)
				size = 20;
			if (size > 100)
				size = 100; // Maximum page size limit

			// Create pageable with user-provided parameters
			Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
			Sort sort = Sort.by(direction, sortBy);
			Pageable pageable = PageRequest.of(page, size, sort);

			// Fetch filtered invoices from repository
			Page<Invoice> invoicePage = invoiceDao.findInvoicesWithFilters(invoiceFilterRequestDto.getInvoiceDateFrom(),
					invoiceFilterRequestDto.getInvoiceDateTo(), invoiceFilterRequestDto.getDueDateFrom(),
					invoiceFilterRequestDto.getDueDateTo(), invoiceFilterRequestDto.getCustomerId(),
					invoiceFilterRequestDto.getProjectId(), invoiceFilterRequestDto.getStatus(), pageable);

			// Enhanced debug logging
			System.out.println("=== FILTER DEBUG ===");
			System.out.println("Filters applied:");
			System.out.println("  Invoice Date From: " + invoiceFilterRequestDto.getInvoiceDateFrom());
			System.out.println("  Invoice Date To: " + invoiceFilterRequestDto.getInvoiceDateTo());
			System.out.println("  Due Date From: " + invoiceFilterRequestDto.getDueDateFrom());
			System.out.println("  Due Date To: " + invoiceFilterRequestDto.getDueDateTo());
			System.out.println("  Customer ID: " + invoiceFilterRequestDto.getCustomerId());
			System.out.println("  Project ID: " + invoiceFilterRequestDto.getProjectId());
			System.out.println("  Status: " + invoiceFilterRequestDto.getStatus());
			System.out.println("Pagination - page: " + page + ", size: " + size + ", sortBy: " + sortBy
					+ ", direction: " + sortDirection);
			System.out.println("Total filtered invoices: " + invoicePage.getTotalElements());
			System.out.println("Invoices in this page: " + invoicePage.getContent().size());
			System.out.println("Total pages: " + invoicePage.getTotalPages());

			// Convert invoices to response DTOs using mapper
			List<InvoiceResponseDto> invoiceResponseDtos = invoiceMapper
				.invoicesToInvoiceResponseDtos(invoicePage.getContent());

			// Create paginated response
			InvoiceListResponseDto invoiceListResponse = new InvoiceListResponseDto(invoiceResponseDtos,
					invoicePage.getTotalElements(), invoicePage.getTotalPages(), invoicePage.getNumber(),
					invoicePage.getSize());

			System.out
				.println("Final filtered response - Invoices in list: " + invoiceListResponse.getInvoices().size());
			System.out.println("=== END FILTER DEBUG ===");

			return new ResponseEntityDto(false, invoiceListResponse);
		}
		catch (Exception e) {
			System.err.println("Error in getFilteredInvoices: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	@Override
	public ResponseEntityDto searchInvoicesByName(InvoiceSearchRequestDto invoiceSearchRequestDto) {
		return null;
	}

	@Override
	public ResponseEntityDto getInvoicesSummary() {
		long totalInvoices = invoiceDao.count();
		long paidInvoices = invoiceDao.countByStatus(InvoiceStatus.PAID);
		long pendingInvoices = invoiceDao.countByStatus(InvoiceStatus.IN_PROGRESS);
		long draftInvoices = invoiceDao.countByStatus(InvoiceStatus.DRAFT);
		long cancelledInvoices = invoiceDao.countByStatus(InvoiceStatus.CANCELLED);
		long overdueInvoices = invoiceDao.countByStatus(InvoiceStatus.OVERDUE);
		long dueInvoices = invoiceDao.countDueInvoices();

		InvoiceSummaryResponseDto summary = new InvoiceSummaryResponseDto(totalInvoices, paidInvoices, pendingInvoices,
				draftInvoices, cancelledInvoices, dueInvoices, overdueInvoices);

		return new ResponseEntityDto(false, summary);
	}

	@Override
	public ResponseEntityDto getInvoiceTierLimitations() {
		InvoiceTierLimitationResponseDto invoiceTierLimitationResponseDto = processInvoiceTierLimitation();
		return new ResponseEntityDto(false, invoiceTierLimitationResponseDto);
	}

	private InvoiceTierLimitationResponseDto processInvoiceTierLimitation() {
		String currentTenant = TenantContext.getCurrentTenant();
		try {
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			Tenant tenant = tenantDao.findByTenantName(currentTenant);
			tenantContext.setTenantAndSwitchSchema(currentTenant);

			if (tenant == null) {
				log.error("getInvoiceTierLimitations: Tenant not found: {}", currentTenant);
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
						new String[] { currentTenant });
			}

			InvoiceTierLimitationResponseDto invoiceTierLimitationResponseDto = new InvoiceTierLimitationResponseDto();
			Tier tier = tenant.getTier();

			LocalDateTime startDateTime;
			LocalDateTime endDateTime;
			long allocatedInvoiceCount;
			long usedInvoiceCount;
			long remainingCount;
			boolean limitedReached = false;

			if (tier == Tier.FREE) {
				LocalDate tierStartedDate = DateTimeUtils.fromUtcInstantToLocaldate(tenant.getCreatedDate());
				startDateTime = getYearlyTierStartDate(tierStartedDate);
				endDateTime = getYearlyTierEndDate(startDateTime, tierStartedDate);
				usedInvoiceCount = invoiceDao.countByCreatedDateBetween(startDateTime, endDateTime);
				allocatedInvoiceCount = allocatedFreeTierInvoiceCount;
				remainingCount = Math.max(allocatedInvoiceCount - usedInvoiceCount, 0);
				limitedReached = usedInvoiceCount >= allocatedInvoiceCount;
			}
			else if (tier == Tier.PRO) {
				if (tenant.getStripeSubscription() == null
						|| tenant.getStripeSubscription().getSubscriptionStartDate() == null) {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
				}
				LocalDate tierStartedDate = DateTimeUtils
					.fromUtcInstantToLocaldate(tenant.getStripeSubscription().getSubscriptionStartDate());
				startDateTime = getYearlyTierStartDate(tierStartedDate);
				endDateTime = getYearlyTierEndDate(startDateTime, tierStartedDate);
				usedInvoiceCount = invoiceDao.countByCreatedDateBetween(startDateTime, endDateTime);
				allocatedInvoiceCount = 20;
				remainingCount = Math.max(allocatedInvoiceCount - usedInvoiceCount, 0);
				limitedReached = usedInvoiceCount >= allocatedInvoiceCount;
			}
			else {
				startDateTime = null;
				endDateTime = null;
				usedInvoiceCount = invoiceDao.count();
				allocatedInvoiceCount = Long.MAX_VALUE;
				remainingCount = Long.MAX_VALUE;
				limitedReached = false;
			}

			invoiceTierLimitationResponseDto.setAllocatedCount(allocatedInvoiceCount);
			invoiceTierLimitationResponseDto.setRemainingCount(remainingCount);
			invoiceTierLimitationResponseDto.setLimitedReached(limitedReached);

			return invoiceTierLimitationResponseDto;
		}
		catch (Exception e) {
			log.error("Error in processInvoiceTierLimitation: {}", e.getMessage(), e);
			throw e;
		}
	}

	private static final int LEAP_DAY = 29;

	private static final java.time.Month FEBRUARY = java.time.Month.FEBRUARY;

	private static final java.time.Month MARCH = java.time.Month.MARCH;

	private static final int FIRST_DAY = 1;

	private LocalDateTime getYearlyTierStartDate(LocalDate tierStartedDate) {
		LocalDate today = DateTimeUtils.getCurrentUtcDate();
		int year = today.getYear();
		LocalDate thisYearStart = getCurrentYearStartDate(tierStartedDate, year);
		if (today.isBefore(thisYearStart)) {
			thisYearStart = getCurrentYearStartDate(tierStartedDate, year - 1);
		}
		return thisYearStart.atStartOfDay();
	}

	private LocalDate getCurrentYearStartDate(LocalDate tierStartedDate, int year) {
		int month = tierStartedDate.getMonthValue();
		int day = tierStartedDate.getDayOfMonth();
		if (month == FEBRUARY.getValue() && day == LEAP_DAY) {
			return java.time.Year.isLeap(year) ? LocalDate.of(year, FEBRUARY, LEAP_DAY)
					: LocalDate.of(year, MARCH, FIRST_DAY);
		}
		else {
			return LocalDate.of(year, month, day);
		}
	}

	private LocalDateTime getYearlyTierEndDate(LocalDateTime startDateTime, LocalDate tierStartedDate) {
		int year = startDateTime.getYear() + 1;
		if (tierStartedDate.getMonthValue() == FEBRUARY.getValue() && tierStartedDate.getDayOfMonth() == LEAP_DAY) {
			if (java.time.Year.isLeap(year)) {
				return LocalDate.of(year, FEBRUARY, LEAP_DAY).atStartOfDay();
			}
			else {
				return LocalDate.of(year, MARCH, FIRST_DAY).atStartOfDay();
			}
		}
		else {
			return startDateTime.plusYears(1);
		}
	}

}
