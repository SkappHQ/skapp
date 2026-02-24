package com.skapp.enterprise.invoice.model;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Embeddable;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
public class ProjectKey {

	@Column(name = "project_id")
	private Long projectId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "customer_id")
	private Customer customer;

}
