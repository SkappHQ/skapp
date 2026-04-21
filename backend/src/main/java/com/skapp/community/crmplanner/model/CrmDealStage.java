package com.skapp.community.crmplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_deal_stage")
public class CrmDealStage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "template_id", nullable = false)
	private CrmPipelineTemplate template;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "color", nullable = false, length = 50)
	private String color;

	@Column(name = "order_index", nullable = false)
	private Long orderIndex;

	@Column(name = "is_active")
	private Boolean isActive = true;

}
