package com.skapp.enterprise.invoice.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.invoice.type.CurrencyType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "in_config")
public class InvoiceConfig extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "invoice_logo")
	private String invoiceLogo;

	@Column(name = "currency")
	@Enumerated(EnumType.STRING)
	private CurrencyType currency;

	@Column(name = "country")
	private String country;

	@Column(name = "payment_terms")
	private String paymentTerms;

	@Column(name = "pay_to_address")
	private String payToAddress;

}
