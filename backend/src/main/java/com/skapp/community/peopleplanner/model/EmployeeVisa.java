package com.skapp.community.peopleplanner.model;

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

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "employee_visa")
public class EmployeeVisa {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "visa_id", nullable = false, updatable = false)
	private Long visaId;

	@Column(name = "visa_type")
	private String visaType;

	@Column(name = "issuing_country")
	private String issuingCountry;

	@Column(name = "issued_date")
	private LocalDate issuedDate;

	@Column(name = "expiration_date")
	private LocalDate expirationDate;

	@ManyToOne(optional = false)
	@JoinColumn(name = "employee_id")
	private Employee employee;

}
