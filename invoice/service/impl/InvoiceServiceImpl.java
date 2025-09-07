package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.model.ExpenseAttachment;
import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.InvoiceExpense;
import com.skapp.enterprise.invoice.model.InvoiceItem;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateExpenseAttachmentDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSearchRequestDto;
import com.skapp.enterprise.invoice.repository.InvoiceRepository;
import com.skapp.enterprise.invoice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional
    public ResponseEntityDto createInvoice(CreateInvoiceRequestDto createInvoiceRequestDto) {

            Invoice invoice = createInvoiceEntity(createInvoiceRequestDto);

            // Save invoice first to get the generated ID
            Invoice savedInvoice = invoiceRepository.save(invoice);

            // Create and set invoice itemss
            List<InvoiceItem> invoiceItems = createInvoiceItems(createInvoiceRequestDto.getInvoiceItems(), savedInvoice);
            savedInvoice.setInvoiceItems(invoiceItems);

            // Create and set invoice expenses if provided (without attachments first)
            if (createInvoiceRequestDto.getInvoiceExpenses() != null && !createInvoiceRequestDto.getInvoiceExpenses().isEmpty()) {
                List<InvoiceExpense> invoiceExpenses = createInvoiceExpensesWithoutAttachments(createInvoiceRequestDto.getInvoiceExpenses(), savedInvoice);
                savedInvoice.setInvoiceExpenses(invoiceExpenses);
            }

            // Create and set invoice taxes if provided
            if (createInvoiceRequestDto.getInvoiceTaxes() != null && !createInvoiceRequestDto.getInvoiceTaxes().isEmpty()) {
                List<com.skapp.enterprise.invoice.model.InvoiceTax> invoiceTaxes = createInvoiceTaxes(createInvoiceRequestDto.getInvoiceTaxes(), savedInvoice);
                savedInvoice.setInvoiceTaxes(invoiceTaxes);
            }

            // Calculate totals
            calculateInvoiceTotals(savedInvoice);

            // Save invoice with all child entities to get their IDs
            Invoice invoiceWithChildIds = invoiceRepository.save(savedInvoice);

            // Now add attachments to expenses that have IDs
            if (createInvoiceRequestDto.getInvoiceExpenses() != null && !createInvoiceRequestDto.getInvoiceExpenses().isEmpty()) {
                addAttachmentsToExpenses(createInvoiceRequestDto.getInvoiceExpenses(), invoiceWithChildIds.getInvoiceExpenses());
            }

            // Final save with attachments
            Invoice finalInvoice = invoiceRepository.save(invoiceWithChildIds);

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
                } else {
                    itemTotal -= itemDto.getDiscountValue();
                }
            }
            item.setAmount(itemTotal);

            return item;
        }).collect(Collectors.toList());
    }

    private List<InvoiceExpense> createInvoiceExpensesWithoutAttachments(List<CreateInvoiceExpenseDto> expenseDtos, Invoice invoice) {
        return expenseDtos.stream().map(expenseDto -> {
            InvoiceExpense expense = new InvoiceExpense();
            expense.setInvoice(invoice);
            expense.setInvoiceId(invoice.getId()); // Explicitly set the invoice_id
            expense.setName(expenseDto.getName());
            expense.setCategory(expenseDto.getCategory());
            expense.setDate(expenseDto.getDate());
            expense.setAmount(expenseDto.getAmount());

            return expense;
        }).collect(Collectors.toList());
    }

    private List<com.skapp.enterprise.invoice.model.InvoiceTax> createInvoiceTaxes(List<com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto> taxDtos, Invoice invoice) {
        return taxDtos.stream().map(taxDto -> {
            com.skapp.enterprise.invoice.model.InvoiceTax tax = new com.skapp.enterprise.invoice.model.InvoiceTax();
            tax.setInvoice(invoice);
            tax.setInvoiceId(invoice.getId()); // Explicitly set the invoice_id
            tax.setTaxType(taxDto.getTaxType());
            tax.setTaxPercentage(taxDto.getTaxPercentage());
            return tax;
        }).collect(Collectors.toList());
    }

    private void calculateInvoiceTotals(Invoice invoice) {
        double itemsTotal = invoice.getInvoiceItems().stream()
                .mapToDouble(InvoiceItem::getAmount)
                .sum();

        double expensesTotal = 0.0;
        if (invoice.getInvoiceExpenses() != null) {
            expensesTotal = invoice.getInvoiceExpenses().stream()
                    .mapToDouble(InvoiceExpense::getAmount)
                    .sum();
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
            totalTaxAmount = invoice.getInvoiceTaxes().stream()
                    .mapToDouble(tax -> {
                        if (tax.getTaxPercentage() != null) {
                            return finalSubtotal * (tax.getTaxPercentage() / 100);
                        }
                        return 0.0;
                    })
                    .sum();
        }

        double finalTotal = subtotal + totalTaxAmount;
        invoice.setSubTotalAmount(subtotal);
        invoice.setPayableTotalAmount(finalTotal);
    }

    private void addAttachmentsToExpenses(List<CreateInvoiceExpenseDto> expenseDtos, List<InvoiceExpense> savedExpenses) {
        for (int i = 0; i < expenseDtos.size(); i++) {
            CreateInvoiceExpenseDto expenseDto = expenseDtos.get(i);
            InvoiceExpense savedExpense = savedExpenses.get(i);

            // Create attachments for the saved expense
            if (expenseDto.getAttachments() != null && !expenseDto.getAttachments().isEmpty()) {
                List<ExpenseAttachment> attachments = expenseDto.getAttachments().stream().map(attachmentDto -> {
                    ExpenseAttachment attachment = new ExpenseAttachment();
                    attachment.setExpense(savedExpense);
                    attachment.setExpenseId(savedExpense.getId()); // Explicitly set the expense_id
                    attachment.setAttachmentUrl(attachmentDto.getAttachmentUrl());
                    return attachment;
                }).collect(Collectors.toList());
                savedExpense.setAttachments(attachments);
            }
        }
    }
    // Other method implementations remain the same...
    @Override
    public ResponseEntityDto getInvoices() {
        return null;
    }

    @Override
    public ResponseEntityDto getFilteredInvoices(InvoiceFilterRequestDto invoiceFilterRequestDto) {
        return null;
    }

    @Override
    public ResponseEntityDto getInvoiceTierLimitations() {
        return null;
    }

    @Override
    public ResponseEntityDto searchInvoicesByName(InvoiceSearchRequestDto invoiceSearchRequestDto) {
        return null;
    }

    @Override
    public ResponseEntityDto getInvoicesSummary() {
        return null;
    }
}
