package com.skapp.enterprise.invoice.payload.request.invoice;

import com.skapp.enterprise.invoice.type.ExpenseCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceExpenseDto {

	private String name;

	private ExpenseCategory category;

	private LocalDate date;

	private Double amount;

	private List<CreateExpenseAttachmentDto> attachments;

}
