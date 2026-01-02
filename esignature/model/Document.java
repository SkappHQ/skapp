package com.skapp.enterprise.esignature.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "es_document")
public class Document {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "document_id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name")
	private String name;

	@Column(name = "file_path")
	private String filePath;

	@ManyToOne
	@JoinColumn(name = "envelope_id")
	private Envelope envelope;

	@OneToMany(mappedBy = "document", cascade = CascadeType.ALL)
	private List<Field> fields;

	@Column(name = "current_version")
	private int currentVersion;

	@Column(name = "current_sign_order_number")
	private int currentSignOderNumber;

	@OneToMany(mappedBy = "document")
	private List<DocumentVersion> versions;

	@Column(name = "num_of_pages")
	private int numOfPages;

	@OneToOne(mappedBy = "document", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private EsignVerification esignVerification;

}
