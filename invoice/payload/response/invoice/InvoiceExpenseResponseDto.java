package com.skapp.enterprise.invoice.payload.response.invoice;

import com.skapp.enterprise.invoice.type.ExpenseCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceExpenseResponseDto {

	private Long id;

	private String name;

	private ExpenseCategory category;

	private LocalDate date;

	private Double amount;

}
