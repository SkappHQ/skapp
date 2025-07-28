package com.skapp.enterprise.common.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.common.type.SupportRequestIssueType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "support_request")
public class SupportRequest extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "support_req_id", updatable = false)
	private Long supportRequestId;

	@Enumerated(EnumType.STRING)
	@Column(name = "issue_type", nullable = false, columnDefinition = "varchar(255)")
	private SupportRequestIssueType issueType;

	@Column(name = "details")
	private String details;

	@OneToMany(mappedBy = "supportRequest", cascade = CascadeType.ALL)
	private Set<SupportRequestAttachment> attachments;

}
