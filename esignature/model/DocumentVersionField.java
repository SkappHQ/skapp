package com.skapp.enterprise.esignature.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "es_document_version_field")
public class DocumentVersionField {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "document_version_id", nullable = false)
	private DocumentVersion documentVersion;

	@OneToOne
	@JoinColumn(name = "field_id", nullable = false)
	private Field field;

	@Column(name = "field_value")
	private String value;

	@Column(name = "x_position")
	private float xPosition;

	@Column(name = "y_position")
	private float yPosition;

	@Column(name = "field_hash")
	private String fieldHash;

	@Column(name = "field_signature")
	private String fieldSignature;

	@Column(name = "width")
	private float width;

	@Column(name = "height")
	private float height;

	@Column(name = "width_percentage")
	private float widthPercentage;

	@Column(name = "height_percentage")
	private float heightPercentage;

}
