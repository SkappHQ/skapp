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
import com.skapp.enterprise.common.util.TierStartEndExtractor;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.InvoiceMapper;
import com.skapp.enterprise.invoice.model.ExpenseAttachment;
import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.InvoiceExpense;
import com.skapp.enterprise.invoice.model.InvoiceItem;
import com.skapp.enterprise.invoice.model.InvoiceTax;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceKPIResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceListResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceTierLimitationResponseDto;
import com.skapp.enterprise.invoice.repository.InvoiceDao;
import com.skapp.enterprise.invoice.service.InvoiceService;
import com.skapp.enterprise.invoice.service.InvoiceValidationService;
import com.skapp.enterprise.invoice.type.DiscountType;
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
import org.springframework.util.CollectionUtils;

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

	@Value("${invoice.allocated-pro-tier-invoice-count}")
	private long allocatedProTierInvoiceCount;

	private final InvoiceDao invoiceDao;

	private final InvoiceMapper invoiceMapper;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final InvoiceValidationService invoiceValidationService;

	@Override
	@Transactional
	public ResponseEntityDto createInvoice(CreateInvoiceRequestDto createInvoiceRequestDto) {

		InvoiceTierLimitationResponseDto invoiceTierLimitationResponseDto = processInvoiceTierLimitation();

		if (invoiceTierLimitationResponseDto.isLimitedReached()) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_LIMIT_REACHED);
		}

		invoiceValidationService.validateCreateInvoiceRequest(createInvoiceRequestDto);
		invoiceValidationService.validateCreateInvoiceItemsRequest(createInvoiceRequestDto.getInvoiceItems());
		if (!CollectionUtils.isEmpty(createInvoiceRequestDto.getInvoiceExpenses())) {
			invoiceValidationService.validateCreateInvoiceExpensesRequest(createInvoiceRequestDto.getInvoiceExpenses());
		}
		if (!CollectionUtils.isEmpty(createInvoiceRequestDto.getInvoiceTaxes())) {
			invoiceValidationService.validateCreateInvoiceTaxesRequest(createInvoiceRequestDto.getInvoiceTaxes());
		}

		Invoice invoice = createInvoiceEntity(createInvoiceRequestDto);

		List<InvoiceItem> invoiceItems = createInvoiceItems(createInvoiceRequestDto.getInvoiceItems(), invoice);
		invoice.setInvoiceItems(invoiceItems);

		if (!CollectionUtils.isEmpty(createInvoiceRequestDto.getInvoiceExpenses())) {
			List<InvoiceExpense> invoiceExpenses = createInvoiceExpenses(createInvoiceRequestDto.getInvoiceExpenses(),
					invoice);
			invoice.setInvoiceExpenses(invoiceExpenses);
		}

		if (!CollectionUtils.isEmpty(createInvoiceRequestDto.getInvoiceTaxes())) {
			List<InvoiceTax> invoiceTaxes = createInvoiceTaxes(createInvoiceRequestDto.getInvoiceTaxes(), invoice);
			invoice.setInvoiceTaxes(invoiceTaxes);
		}

		calculateInvoiceTotals(invoice);
		invoiceDao.save(invoice);

		InvoiceResponseDto responseDto = invoiceMapper.invoiceToInvoiceResponseDto(invoice);

		return new ResponseEntityDto(false, responseDto);
	}

	private Invoice createInvoiceEntity(CreateInvoiceRequestDto request) {
		Invoice invoice = new Invoice();

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
		String year = String.valueOf(java.time.LocalDate.now().getYear());
		long timestamp = System.currentTimeMillis();
		String uniqueNumber = String.format("%06d", timestamp % 1000000);
		return "INV-" + year + "-" + uniqueNumber;
	}

	private List<InvoiceItem> createInvoiceItems(List<CreateInvoiceItemDto> itemDtos, Invoice invoice) {
		return itemDtos.stream().map(itemDto -> {
			InvoiceItem item = new InvoiceItem();
			item.setInvoice(invoice);
			item.setItemName(itemDto.getItemName());
			item.setDescription(itemDto.getDescription());
			item.setQuantity(itemDto.getQuantity());
			item.setUnitPrice(itemDto.getUnitPrice());
			item.setDiscountType(itemDto.getDiscountType());
			item.setDiscountValue(itemDto.getDiscountValue());

			double itemTotal = itemDto.getQuantity() * itemDto.getUnitPrice();
			if (itemDto.getDiscountValue() != null && itemDto.getDiscountValue() > 0) {
				if (itemDto.getDiscountType() == DiscountType.PERCENTAGE) {
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

	private List<InvoiceExpense> createInvoiceExpenses(List<CreateInvoiceExpenseDto> expenseDtos, Invoice invoice) {
		return expenseDtos.stream().map(expenseDto -> {
			InvoiceExpense expense = new InvoiceExpense();
			expense.setInvoice(invoice);
			expense.setName(expenseDto.getName());
			expense.setCategory(expenseDto.getCategory());
			expense.setDate(expenseDto.getDate());
			expense.setAmount(expenseDto.getAmount());

			if (!CollectionUtils.isEmpty(expenseDto.getAttachments())) {
				List<ExpenseAttachment> attachments = expenseDto.getAttachments().stream().map(attachmentDto -> {
					ExpenseAttachment attachment = new ExpenseAttachment();
					attachment.setExpense(expense);
					attachment.setAttachmentUrl(attachmentDto.getAttachmentUrl());
					return attachment;
				}).collect(Collectors.toList());
				expense.setAttachments(attachments);
			}

			return expense;
		}).collect(Collectors.toList());
	}

	private List<InvoiceTax> createInvoiceTaxes(List<CreateInvoiceTaxDto> taxDtos, Invoice invoice) {
		return taxDtos.stream().map(taxDto -> {
			InvoiceTax tax = new InvoiceTax();
			tax.setInvoice(invoice);
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

		if (invoice.getDiscountValue() != null && invoice.getDiscountValue() > 0) {
			if (invoice.getDiscountType() == DiscountType.PERCENTAGE) {
				subtotal -= (subtotal * invoice.getDiscountValue() / 100.0);
			}
			else {
				subtotal -= invoice.getDiscountValue();
			}
		}

		double totalTaxAmount = 0.0;
		if (invoice.getInvoiceTaxes() != null) {
			final double finalSubtotal = subtotal;
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

	@Override
	public ResponseEntityDto getFilteredInvoices(InvoiceFilterRequestDto invoiceFilterRequestDto) {

		invoiceValidationService.validateInvoiceFilterRequest(invoiceFilterRequestDto);

		int page = invoiceFilterRequestDto.getPage();
		int size = invoiceFilterRequestDto.getSize();
		String sortBy = invoiceFilterRequestDto.getSortBy();
		String sortDirection = invoiceFilterRequestDto.getSortDirection();

		Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
		Sort sort = Sort.by(direction, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<Invoice> invoicePage = invoiceDao.findInvoicesWithFilters(invoiceFilterRequestDto, pageable);

		List<InvoiceResponseDto> invoiceResponseDtos = invoiceMapper
			.invoicesToInvoiceResponseDtos(invoicePage.getContent());

		InvoiceListResponseDto invoiceListResponse = new InvoiceListResponseDto(invoiceResponseDtos,
				invoicePage.getTotalElements(), invoicePage.getTotalPages(), invoicePage.getNumber(),
				invoicePage.getSize());

		return new ResponseEntityDto(false, invoiceListResponse);

	}

	@Override
	public ResponseEntityDto getInvoiceKPI() {

		long dueInvoices = invoiceDao.countByStatus(InvoiceStatus.DUE);
		long overdueInvoices = invoiceDao.countByStatus(InvoiceStatus.OVERDUE);

		InvoiceKPIResponseDto summary = new InvoiceKPIResponseDto(dueInvoices, overdueInvoices);

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
				startDateTime = TierStartEndExtractor.getYearlyTierStartDate(tierStartedDate);
				endDateTime = TierStartEndExtractor.getYearlyTierEndDate(startDateTime, tierStartedDate);
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
				startDateTime = TierStartEndExtractor.getYearlyTierStartDate(tierStartedDate);
				endDateTime = TierStartEndExtractor.getYearlyTierEndDate(startDateTime, tierStartedDate);
				usedInvoiceCount = invoiceDao.countByCreatedDateBetween(startDateTime, endDateTime);
				allocatedInvoiceCount = allocatedProTierInvoiceCount;
				remainingCount = Math.max(allocatedInvoiceCount - usedInvoiceCount, 0);
				limitedReached = usedInvoiceCount >= allocatedInvoiceCount;
			}
			else {
				startDateTime = null;
				endDateTime = null;
				allocatedInvoiceCount = -1;
				usedInvoiceCount = invoiceDao.count();
				remainingCount = -1;
				limitedReached = false;
			}

			invoiceTierLimitationResponseDto.setAllocatedCount(allocatedInvoiceCount);
			invoiceTierLimitationResponseDto.setRemainingCount(remainingCount);
			invoiceTierLimitationResponseDto.setLimitedReached(limitedReached);

			return invoiceTierLimitationResponseDto;
		}
		catch (Exception e) {
			log.error("Error in processInvoiceTierLimitation: {}", e.getMessage(), e);
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FETCHING_INVOICE_TIER_LIMITATIONS);
		}
	}

}
