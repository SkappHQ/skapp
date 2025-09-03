package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.model.ExpenseAttachment;
import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.InvoiceExpense;
import com.skapp.enterprise.invoice.model.InvoiceItem;
import com.skapp.enterprise.invoice.payload.request.CreateExpenseAttachmentDto;
import com.skapp.enterprise.invoice.payload.request.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.CreateInvoiceRequestDto;
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
    public ResponseEntityDto createInvoice(CreateInvoiceRequestDto request) {

            Invoice invoice = createInvoiceEntity(request);

            // Create and set invoice items
            List<InvoiceItem> invoiceItems = createInvoiceItems(request.getInvoiceItems(), invoice);
            invoice.setInvoiceItems(invoiceItems);

            // Create and set invoice expenses if provided
            if (request.getInvoiceExpenses() != null && !request.getInvoiceExpenses().isEmpty()) {
                List<InvoiceExpense> invoiceExpenses = createInvoiceExpenses(request.getInvoiceExpenses(), invoice);
                invoice.setInvoiceExpenses(invoiceExpenses);
            }

            // Calculate totals
            calculateInvoiceTotals(invoice);

            // Save invoice
            Invoice savedInvoice = invoiceRepository.save(invoice);

            return new ResponseEntityDto(false, savedInvoice.getId());
    }

    private Invoice createInvoiceEntity(CreateInvoiceRequestDto request) {
        Invoice invoice = new Invoice();
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
        invoice.setTaxPercentage(request.getTaxPercentage());
        invoice.setInvoiceTerms(request.getInvoiceTerms());
        invoice.setInvoiceNotes(request.getInvoiceNotes());

        return invoice;
    }

    private List<InvoiceItem> createInvoiceItems(List<CreateInvoiceItemDto> itemDtos, Invoice invoice) {
        return itemDtos.stream().map(itemDto -> {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setInvoiceId(invoice.getId());
            item.setDescription(itemDto.getDescription());
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            item.setDiscountType(itemDto.getDiscountType());
            item.setDiscountValue(itemDto.getDiscountValue());
            item.setItemTaxPercentage(itemDto.getItemTaxPercentage());

            // Calculate item amount
            double itemTotal = itemDto.getQuantity() * itemDto.getUnitPrice();
            if (itemDto.getDiscountValue() != null && itemDto.getDiscountValue() > 0) {
                itemTotal -= itemDto.getDiscountValue();
            }
            item.setAmount(itemTotal);

            return item;
        }).collect(Collectors.toList());
    }

    private List<InvoiceExpense> createInvoiceExpenses(List<CreateInvoiceExpenseDto> expenseDtos, Invoice invoice) {
        return expenseDtos.stream().map(expenseDto -> {
            InvoiceExpense expense = new InvoiceExpense();
            expense.setInvoice(invoice);
            expense.setInvoiceId(invoice.getId());
            expense.setDescription(expenseDto.getDescription());
            expense.setCategory(expenseDto.getCategory());
            expense.setAmount(expenseDto.getAmount());

            // Create attachments if provided
            if (expenseDto.getAttachments() != null && !expenseDto.getAttachments().isEmpty()) {
                List<ExpenseAttachment> attachments = createExpenseAttachments(expenseDto.getAttachments(), expense);
                expense.setAttachments(attachments);
            }

            return expense;
        }).collect(Collectors.toList());
    }

    private List<ExpenseAttachment> createExpenseAttachments(List<CreateExpenseAttachmentDto> attachmentDtos, InvoiceExpense expense) {
        return attachmentDtos.stream().map(attachmentDto -> {
            ExpenseAttachment attachment = new ExpenseAttachment();
            attachment.setExpense(expense);
            attachment.setExpenseId(expense.getId());
            attachment.setAttachmentUrl(attachmentDto.getAttachmentUrl());
            return attachment;
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

        // Apply tax
        if (invoice.getTaxPercentage() != null && invoice.getTaxPercentage().doubleValue() > 0) {
            double taxAmount = subtotal * (invoice.getTaxPercentage().doubleValue() / 100);
            subtotal += taxAmount;
        }

        invoice.setTotalAmount(subtotal);
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
}