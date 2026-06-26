package com.skapp.community.crmplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_deal_stage")
public class CrmDealStage extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "description")
	private String description;

	@Column(name = "color", nullable = false)
	private String color;

	@Column(name = "order_index", nullable = false)
	private Integer orderIndex;

	@Enumerated(EnumType.STRING)
	@Column(name = "stage_type", nullable = false)
	private CrmDealStageType stageType;

	@Column(name = "is_deleted", nullable = false)
	private Boolean isDeleted = false;

}
