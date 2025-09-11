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
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "in_customer_contact")
public class CustomerContact extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name")
	private String name;

	@Column(name = "email")
	private String email;

	@Column(name = "contact_no", length = 15)
	private String contactNo;

	@Column(name = "job_title")
	private String jobTitle;

	@Column(name = "is_active")
	private Boolean isActive;

	@ManyToOne(optional = false)
	@JoinColumn(name = "customer_id")
	private Customer customer;

}
