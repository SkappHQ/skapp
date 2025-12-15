package com.skapp.enterprise.invoice.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "in_tax")
public class InvoiceTax extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "tax_type", nullable = false)
	private String taxType;

	@Column(name = "tax_percentage")
	private Double taxPercentage;

	@Column(name = "tax_amount")
	private Double taxAmount;

	@ManyToOne(optional = false)
	@JoinColumn(name = "invoice_id", nullable = false)
	private Invoice invoice;

}
