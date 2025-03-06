package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "es_document_version")
public class DocumentVersion extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "document_id", nullable = false)
	private Document document;

	@Column(name = "version_number")
	private int versionNumber;

	@Lob
	@Column(name = "document_hash")
	private String documentHash;

	@Column(name = "file_path")
	private String filePath;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "document_signature_id")
	private DocumentSignature signatures;

	@OneToOne
	@JoinColumn(name = "address_book_id")
	private AddressBook addressBook;

	@OneToMany(mappedBy = "documentVersion", cascade = CascadeType.ALL)
	private List<DocumentVersionField> fieldVersions;

}
