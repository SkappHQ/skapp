package com.skapp.enterprise.invoice.model;

import com.skapp.enterprise.invoice.type.DiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "in_item")
public class InvoiceItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "item_name", nullable = false)
	private String itemName;

	@Column(name = "description")
	private String description;

	@Column(name = "quantity")
	private Integer quantity;

	@Column(name = "quantity_type")
	private String quantityType;

	@Column(name = "unit_price")
	private Double unitPrice;

	@Enumerated(EnumType.STRING)
	@Column(name = "discount_type")
	private DiscountType discountType;

	@Column(name = "discount_value")
	private Double discountValue;

	@Column(name = "amount")
	private Double amount;

	@ManyToOne(optional = false)
	@JoinColumn(name = "invoice_id", nullable = false)
	private Invoice invoice;

}
