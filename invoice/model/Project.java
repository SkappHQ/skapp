package com.skapp.enterprise.invoice.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "in_customer_project")
public class Project extends Auditable<String> {

	@EmbeddedId
	private ProjectKey id;

	@Column(name = "project_key")
	private String projectKey;

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<BillableRate> billableRates;

}
