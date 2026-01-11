package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "es_template_document")
public class TemplateDocument extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name")
	private String name;

	@Column(name = "file_path")
	private String filePath;

	@Column(name = "num_of_pages")
	private int numOfPages;

	@ManyToOne
	@JoinColumn(name = "template_envelope_id")
	private TemplateEnvelope templateEnvelope;

	@OneToMany(mappedBy = "templateDocument", cascade = CascadeType.ALL)
	private List<TemplateField> templateFields;

}
