package com.skapp.enterprise.invoice.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "in_customer_project")
public class Project extends Auditable<String> {

	@EmbeddedId
	private ProjectKey id;

	@Column(name = "project_key")
	private String projectKey;

}
