package com.skapp.enterprise.invoice.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.invoice.type.CurrencyType;
import com.skapp.enterprise.invoice.type.DiscountType;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
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

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "in_invoice")
public class Invoice extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "invoice_id")
	private String invoiceId;

	@Column(name = "project_id")
	private Long projectId;

	@Column(name = "invoice_date", nullable = false)
	private LocalDateTime invoiceDate;

	@Column(name = "due_date")
	private LocalDateTime dueDate;

	@Column(name = "billed_to")
	private String billedTo;

	@Column(name = "pay_to")
	private String payTo;

	@Enumerated(EnumType.STRING)
	@Column(name = "currency", nullable = false)
	private CurrencyType currency;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private InvoiceStatus status;

	@Enumerated(EnumType.STRING)
	@Column(name = "discount_type")
	private DiscountType discountType;

	@Column(name = "discount_value")
	private Double discountValue;

	@Column(name = "invoice_terms")
	private String invoiceTerms;

	@Column(name = "invoice_notes")
	private String invoiceNotes;

	@Column(name = "sub_total_amount")
	private Double subTotalAmount;

	@Column(name = "payable_total_amount")
	private Double payableTotalAmount;

	@Column(name = "invoice_logo")
	private String invoiceLogo;

	@ManyToOne(optional = false)
	@JoinColumn(name = "customer_id", updatable = false)
	private Customer customer;

	@OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<InvoiceItem> invoiceItems;

	@OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<InvoiceExpense> invoiceExpenses;

	@OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<InvoiceTax> invoiceTaxes;

}
