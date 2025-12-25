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

	/**
	 * Indicates if this version has been signed with organization certificate (PDF
	 * digital signature)
	 */
	@Column(name = "is_pdf_signed", nullable = false)
	private Boolean isPdfSigned = false;

	/**
	 * Timestamp when PDF was signed with organization certificate
	 */
	@Column(name = "pdf_signed_at")
	private java.time.LocalDateTime pdfSignedAt;

	/**
	 * Certificate serial number used for PDF signing
	 */
	@Column(name = "certificate_serial_number")
	private String certificateSerialNumber;

	/**
	 * Signature algorithm used for PDF signing (e.g., SHA256withRSA)
	 */
	@Column(name = "signature_algorithm")
	private String signatureAlgorithm;

	/**
	 * TSA timestamp token (optional, for Long-Term Validation)
	 */
	@Lob
	@Column(name = "timestamp_token")
	private String timestampToken;

}
