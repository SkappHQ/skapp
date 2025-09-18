package com.skapp.enterprise.invoice.model;

import com.skapp.enterprise.invoice.type.ExpenseCategory;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "in_expense")
public class InvoiceExpense {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(name = "category", nullable = false)
	private ExpenseCategory category;

	@Column(name = "date", nullable = false)
	private LocalDate date;

	@Column(name = "amount")
	private Double amount;

	@ManyToOne(optional = false)
	@JoinColumn(name = "invoice_id", nullable = false)
	private Invoice invoice;

	@OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<ExpenseAttachment> attachments;

}
