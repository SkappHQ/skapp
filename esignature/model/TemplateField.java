package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "es_template_field")
public class TemplateField extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Enumerated(EnumType.STRING)
	private FieldType type;

	@Column(name = "page_number")
	private int pageNumber;

	@Column(name = "x_position")
	private float xPosition;

	@Column(name = "y_position")
	private float yPosition;

	@Column(name = "width")
	private float width;

	@Column(name = "height")
	private float height;

	@ManyToOne
	@JoinColumn(name = "template_document_id")
	private TemplateDocument templateDocument;

	@ManyToOne
	@JoinColumn(name = "template_recipient_id", nullable = false)
	private TemplateRecipient templateRecipient;

}
