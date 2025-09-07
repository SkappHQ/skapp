package com.skapp.enterprise.invoice.payload.request.invoice;

import com.skapp.enterprise.invoice.type.ExpenseCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceExpenseDto {

	@NotBlank(message = "Name is required")
	private String name;

	@NotNull(message = "Category is required")
	private ExpenseCategory category;

	@NotNull(message = "Date is required")
	private LocalDateTime date;

	@NotNull(message = "Amount is required")
	@Positive(message = "Amount must be positive")
	private Double amount;

	@Valid
	private List<CreateExpenseAttachmentDto> attachments;

}
