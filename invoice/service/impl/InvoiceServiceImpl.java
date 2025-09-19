package com.skapp.enterprise.invoice.service.impl;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.common.util.TierStartEndDateExtractor;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.InvoiceMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.ExpenseAttachment;
import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.InvoiceExpense;
import com.skapp.enterprise.invoice.model.InvoiceItem;
import com.skapp.enterprise.invoice.model.InvoiceTax;
import com.skapp.enterprise.invoice.payload.email.InvoiceReminderEmailDynamicFields;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto;
import com.skapp.enterprise.invoice.payload.request.invoice.InvoiceStatusUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceKPIResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceListResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceTierLimitationResponseDto;
import com.skapp.enterprise.invoice.payload.response.invoice.InvoiceDetailResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
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

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

	private final CustomerDao customerDao;

	private final EmailService emailService;

	@Override
	@Transactional
	public ResponseEntityDto createInvoice(CreateInvoiceRequestDto createInvoiceRequestDto) {

		InvoiceTierLimitationResponseDto invoiceTierLimitationResponseDto = processInvoiceTierLimitation();

		if (invoiceTierLimitationResponseDto.isLimitedReached()) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_LIMIT_REACHED);
		}

		Optional<Customer> optionalCustomer = customerDao.findById(createInvoiceRequestDto.getCustomerId());

		if (optionalCustomer.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND);
		}

		Customer customer = optionalCustomer.get();

		invoiceValidationService.validateCreateInvoiceRequest(createInvoiceRequestDto);
		invoiceValidationService.validateCreateInvoiceItemsRequest(createInvoiceRequestDto.getInvoiceItems());
		if (!CollectionUtils.isEmpty(createInvoiceRequestDto.getInvoiceExpenses())) {
			invoiceValidationService.validateCreateInvoiceExpensesRequest(createInvoiceRequestDto.getInvoiceExpenses());
		}
		if (!CollectionUtils.isEmpty(createInvoiceRequestDto.getInvoiceTaxes())) {
			invoiceValidationService.validateCreateInvoiceTaxesRequest(createInvoiceRequestDto.getInvoiceTaxes());
		}

		Invoice invoice = invoiceMapper.CreateInvoiceRequestDtoToInvoice(createInvoiceRequestDto);
		invoice.setCustomer(customer);

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

	private List<InvoiceItem> createInvoiceItems(List<CreateInvoiceItemDto> itemDtos, Invoice invoice) {
		return itemDtos.stream().map(itemDto -> {
			double itemTotal = itemDto.getQuantity() * itemDto.getUnitPrice();
			if (itemDto.getDiscountValue() != null && itemDto.getDiscountValue() > 0) {
				if (itemDto.getDiscountType() == DiscountType.PERCENTAGE) {
					itemTotal = itemTotal - (itemTotal * itemDto.getDiscountValue() / 100);
				}
				else {
					itemTotal -= itemDto.getDiscountValue();
				}
			}
			itemDto.setAmount(itemTotal);
			InvoiceItem item = invoiceMapper.CreateInvoiceItemDtoToInvoiceItem(itemDto);
			item.setInvoice(invoice);
			return item;
		}).collect(Collectors.toList());
	}

	private List<InvoiceExpense> createInvoiceExpenses(List<CreateInvoiceExpenseDto> expenseDtos, Invoice invoice) {
		return expenseDtos.stream().map(expenseDto -> {
			InvoiceExpense expense = invoiceMapper.CreateInvoiceExpenseDtoToInvoiceExpense(expenseDto);
			expense.setInvoice(invoice);

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
			InvoiceTax tax = invoiceMapper.CreateInvoiceTaxDtoToInvoiceTax(taxDto);
			tax.setInvoice(invoice);
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

		Boolean hasNext = invoicePage.getNumber() < invoicePage.getTotalPages() - 1;

		Boolean hasPrevious = invoicePage.getNumber() > 0;

		InvoiceListResponseDto invoiceListResponse = new InvoiceListResponseDto(invoiceResponseDtos,
				invoicePage.getTotalElements(), invoicePage.getTotalPages(), invoicePage.getNumber(),
				invoicePage.getSize(), hasNext, hasPrevious);

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
			startDateTime = TierStartEndDateExtractor.getYearlyTierStartDate(tierStartedDate);
			endDateTime = TierStartEndDateExtractor.getYearlyTierEndDate(startDateTime, tierStartedDate);
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
			startDateTime = TierStartEndDateExtractor.getYearlyTierStartDate(tierStartedDate);
			endDateTime = TierStartEndDateExtractor.getYearlyTierEndDate(startDateTime, tierStartedDate);
			usedInvoiceCount = invoiceDao.countByCreatedDateBetween(startDateTime, endDateTime);
			allocatedInvoiceCount = allocatedProTierInvoiceCount;
			remainingCount = Math.max(allocatedInvoiceCount - usedInvoiceCount, 0);
			limitedReached = usedInvoiceCount >= allocatedInvoiceCount;
		}
		else {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FETCHING_INVOICE_TIER_LIMITATIONS);
		}

		invoiceTierLimitationResponseDto.setAllocatedCount(allocatedInvoiceCount);
		invoiceTierLimitationResponseDto.setRemainingCount(remainingCount);
		invoiceTierLimitationResponseDto.setLimitedReached(limitedReached);

		return invoiceTierLimitationResponseDto;
	}

	@Override
	public ResponseEntityDto getInvoiceId(Long customerId) {
		Optional<Invoice> latestInvoice = invoiceDao.findFirstByCustomer_IdOrderByCreatedDateDesc(customerId);

		int currentYear = LocalDate.now().getYear();
		String nextInvoiceId;

		if (latestInvoice.isEmpty() || latestInvoice.get().getInvoiceId() == null
				|| latestInvoice.get().getInvoiceId().isEmpty()) {
			nextInvoiceId = String.format(InvoiceCommonConstant.INVOICE_STANDARD_START_ID_FORMAT, currentYear);
		}
		else {
			String lastInvoiceId = latestInvoice.get().getInvoiceId();
			Pattern pattern = Pattern.compile(InvoiceCommonConstant.INVOICE_STANDARD_ID_REGEX);
			Matcher matcher = pattern.matcher(lastInvoiceId);

			if (matcher.matches()) {
				String prefix = matcher.group(1);
				int latestInvoiceYear = Integer.parseInt(matcher.group(2));
				String sequenceStr = matcher.group(3);

				if (latestInvoiceYear < currentYear) {
					String resetSequence = String.format("%0" + sequenceStr.length() + "d", 1);
					nextInvoiceId = String.format(InvoiceCommonConstant.INVOICE_START_ID_TEMPLATE, prefix, currentYear,
							resetSequence);
				}
				else {
					int currentSequence = Integer.parseInt(sequenceStr);
					int nextSequence = currentSequence + 1;
					String formattedSequence = String.format("%0" + sequenceStr.length() + "d", nextSequence);
					nextInvoiceId = String.format("%s-%d-%s", prefix, latestInvoiceYear, formattedSequence);
				}
			}
			else {
				nextInvoiceId = generateNextInvoiceId(lastInvoiceId);
			}
		}

		return new ResponseEntityDto(false, nextInvoiceId);
	}

	private String generateNextInvoiceId(String lastInvoiceId) {

		Pattern pattern = Pattern.compile("\\d+");
		Matcher matcher = pattern.matcher(lastInvoiceId);

		if (matcher.find()) {
			String digits = matcher.group();
			int currentNumber = Integer.parseInt(digits);
			int nextNumber = currentNumber + 1;

			String formattedNumber = String.format("%0" + digits.length() + "d", nextNumber);

			StringBuilder sb = new StringBuilder();
			sb.append(lastInvoiceId, 0, matcher.start());
			sb.append(formattedNumber);
			sb.append(lastInvoiceId.substring(matcher.end()));

			return sb.toString();
		}
		else {
			return lastInvoiceId + InvoiceCommonConstant.INVOICE_NUMBER_SUFFIX;
		}
	}

	@Override
	public ResponseEntityDto getInvoiceById(Long invoiceId) {
		Optional<Invoice> optionalInvoice = invoiceDao.findById(invoiceId);

		if (optionalInvoice.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_NOT_FOUND);
		}

		Invoice invoice = optionalInvoice.get();
		InvoiceDetailResponseDto invoiceDetailResponseDto = invoiceMapper.invoiceToInvoiceDetailResponseDto(invoice);
		return new ResponseEntityDto(false, invoiceDetailResponseDto);
	}

	@Override
	public ResponseEntityDto updateInvoiceStatus(InvoiceStatusUpdateRequestDto invoiceStatusUpdateRequestDto) {

		invoiceValidationService.validateInvoiceStatusUpdateRequest(invoiceStatusUpdateRequestDto);
		Optional<Invoice> optionalInvoice = invoiceDao.findById(invoiceStatusUpdateRequestDto.getInvoiceId());

		Invoice invoice = optionalInvoice.get();
		invoice.setStatus(invoiceStatusUpdateRequestDto.getStatus());

		invoiceDao.save(invoice);

		InvoiceResponseDto invoiceResponseDto = invoiceMapper.invoiceToInvoiceResponseDto(invoice);

		return new ResponseEntityDto(false, invoiceResponseDto);
	}

	@Override
	public ResponseEntityDto sendReminder(Long invoiceId) {
		Invoice invoice = invoiceDao.findById(invoiceId)
			.orElseThrow(() -> new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_INVOICE_NOT_FOUND));

		Customer customer = invoice.getCustomer();

		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		String formattedInvoiceDate = invoice.getInvoiceDate().format(dateFormatter);
		String formattedDueDate = invoice.getDueDate().format(dateFormatter);

		NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US);
		String formattedAmount = currencyFormatter.format(invoice.getPayableTotalAmount());

		InvoiceReminderEmailDynamicFields emailData = new InvoiceReminderEmailDynamicFields(customer.getName(),
				invoice.getInvoiceId(), formattedInvoiceDate, formattedDueDate, formattedAmount,
				invoice.getCurrency().name(), "Invoice Payment Reminder");

		try {
			String html = generateInvoiceHtml(invoice);

			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			PdfRendererBuilder builder = new PdfRendererBuilder();
			builder.withHtmlContent(html, null);
			builder.toStream(baos);
			builder.run();

			byte[] pdfBytes = baos.toByteArray();

			// Generate PDF filename with invoice ID
			String pdfFileName = String.format("Invoice_%s.pdf", invoice.getInvoiceId());

			emailService.sendEmailWithAttachment(EpEmailMainTemplates.INVOICE_MAIN_TEMPLATE_V1,
					EpEmailBodyTemplates.INVOICE_MODULE_INVOICE_CREATED_FOR_CUSTOMER, emailData, customer.getEmail(),
					pdfBytes, pdfFileName, "application/pdf");

			log.info("Invoice reminder email sent successfully for invoice ID: {} to customer: {} with PDF attachment",
					invoiceId, customer.getEmail());

			return new ResponseEntityDto(false, InvoiceMessageConstant.INVOICE_SUCCESS_EMAIL_REMINDER_SENT);
		}
		catch (Exception e) {
			log.error("Failed to send invoice reminder email for invoice ID: {}", invoiceId, e);
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_SENDING_EMAIL_REMINDER);
		}
	}

	private String generateInvoiceHtml(Invoice invoice) {
		StringBuilder html = new StringBuilder();
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

		html.append("<!DOCTYPE html>");
		html.append("<html><head>");
		html.append("<meta charset='UTF-8'/>");
		html.append("<style>");

		// General
		html.append("body { font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 20px; }");
		html.append("h1,h2,h3,h4,h5 { margin: 0; }");
		html.append("table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }");
		html.append("th, td { padding: 8px; border-bottom: 1px solid #eee; }");
		html.append("th { background: #f8f9fa; font-weight: bold; font-size: 12px; }");
		html.append("td { font-size: 12px; }");
		html.append(".header-table td { border: none; padding: 0; }");
		html.append(".invoice-title { font-size: 20px; font-weight: bold; }");
		html.append(".section-title { font-size: 14px; font-weight: bold; margin-bottom: 5px; }");
		html.append(".summary-table td { border: none; padding: 4px; font-size: 12px; }");
		html.append(".summary-table tr td:last-child { text-align: right; }");
		html.append(".total { font-size: 16px; font-weight: bold; }");
		html.append(".amount-due { font-size: 14px; font-weight: bold; margin: 10px 0; }");
		html.append("</style>");
		html.append("</head><body>");

		// Header with logo + Invoice info
		html.append("<table class='header-table'>");
		html.append("<tr>");
		html.append("<td><div class='invoice-title'>Invoice</div></td>");
		if (invoice.getInvoiceLogo() != null) {
			html.append("<td style='text-align:right'><img src='")
				.append("<img alt='Skapp Logo' src='http://images.skapp.com/logo-with-name-1.png' style='width: 101px; height: 55'/>")
				.append("' style='height:60px'/></td>");
		}
		html.append("</tr>");
		html.append("</table>");

		// Invoice metadata
		html.append("<table>");
		html.append("<tr><td><strong>Invoice ID:</strong> ").append(invoice.getInvoiceId()).append("</td></tr>");
		html.append("<tr><td><strong>Issued Date:</strong> ")
			.append(invoice.getInvoiceDate().format(dateFormatter))
			.append("</td></tr>");
		html.append("<tr><td><strong>Due Date:</strong> ")
			.append(invoice.getDueDate().format(dateFormatter))
			.append("</td></tr>");
		html.append("</table>");

		// From / Billed To
		html.append("<table>");
		html.append("<tr>");
		html.append("<td valign='top'><div class='section-title'>From</div>")
			.append(invoice.getPayTo() != null ? invoice.getPayTo() : "Your Company")
			.append("</td>");
		html.append("<td valign='top'><div class='section-title'>Billed To</div>")
			.append(invoice.getBilledTo() != null ? invoice.getBilledTo() : invoice.getCustomer().getName())
			.append("</td>");
		html.append("</tr>");
		html.append("</table>");

		// Amount due highlight
		html.append("<div class='amount-due'>")
			.append(invoice.getCurrency())
			.append(" ")
			.append(String.format("%.2f", invoice.getPayableTotalAmount()))
			.append(" due ")
			.append(invoice.getDueDate().format(dateFormatter))
			.append("</div>");

		// Items table
		html.append("<table>");
		html.append("<thead><tr>");
		html.append("<th>Description</th><th>Qty</th><th>Unit Type</th><th>Unit Price</th><th>Amount</th>");
		html.append("</tr></thead><tbody>");
		if (invoice.getInvoiceItems() != null) {
			for (InvoiceItem item : invoice.getInvoiceItems()) {
				html.append("<tr>")
					.append("<td>")
					.append(item.getDescription() != null ? item.getDescription() : item.getItemName())
					.append("</td>")
					.append("<td>")
					.append(item.getQuantity() != null ? item.getQuantity() : 0)
					.append("</td>")
					.append("<td>")
					.append(item.getQuantityType() != null ? item.getQuantityType() : "Units")
					.append("</td>")
					.append("<td>")
					.append(invoice.getCurrency())
					.append(" ")
					.append(String.format("%.2f", item.getUnitPrice() != null ? item.getUnitPrice() : 0.0))
					.append("</td>")
					.append("<td>")
					.append(invoice.getCurrency())
					.append(" ")
					.append(String.format("%.2f", item.getAmount() != null ? item.getAmount() : 0.0))
					.append("</td>")
					.append("</tr>");
			}
		}
		html.append("</tbody></table>");

		// Summary
		html.append("<table class='summary-table'>");
		html.append("<tr><td>Subtotal</td><td>")
			.append(invoice.getCurrency())
			.append(" ")
			.append(String.format("%.2f", invoice.getSubTotalAmount() != null ? invoice.getSubTotalAmount() : 0.0))
			.append("</td></tr>");

		if (invoice.getDiscountValue() != null && invoice.getDiscountValue() > 0) {
			html.append("<tr><td>Discount</td><td>-")
				.append(invoice.getCurrency())
				.append(" ")
				.append(String.format("%.2f", invoice.getDiscountValue()))
				.append("</td></tr>");
		}

		if (invoice.getInvoiceTaxes() != null && !invoice.getInvoiceTaxes().isEmpty()) {
			double taxTotal = invoice.getInvoiceTaxes().stream().mapToDouble(tax -> {
				if (tax.getTaxPercentage() != null && invoice.getSubTotalAmount() != null) {
					return (invoice.getSubTotalAmount() * tax.getTaxPercentage()) / 100.0;
				}
				return 0.0;
			}).sum();
			html.append("<tr><td>Tax</td><td>")
				.append(invoice.getCurrency())
				.append(" ")
				.append(String.format("%.2f", taxTotal))
				.append("</td></tr>");
		}

		html.append("<tr class='total'><td>Total</td><td>")
			.append(invoice.getCurrency())
			.append(" ")
			.append(String.format("%.2f",
					invoice.getPayableTotalAmount() != null ? invoice.getPayableTotalAmount() : 0.0))
			.append("</td></tr>");
		html.append("</table>");

		// Notes & Terms
		if (invoice.getInvoiceNotes() != null) {
			html.append("<div class='section-title'>Notes</div>");
			html.append("<p>").append(invoice.getInvoiceNotes()).append("</p>");
		}

		if (invoice.getInvoiceTerms() != null) {
			html.append("<div class='section-title'>Payment Terms</div>");
			html.append("<p>").append(invoice.getInvoiceTerms()).append("</p>");
		}

		// Footer
		html.append(
				"<hr/><p style='font-size:10px;text-align:center'>Made with <img alt='Skapp Logo' src='http://images.skapp.com/logo-with-name-1.png' style='width: 101px; height: 55'/> </p>");

		html.append("</body></html>");

		return html.toString();
	}

}
