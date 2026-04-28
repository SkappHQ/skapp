package com.skapp.community.crmplanner.model;

import com.skapp.community.common.model.Auditable;
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
@Table(name = "crm_deal_stage_log")
public class CrmDealStageLog extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "deal_id", nullable = false)
	private CrmDeal deal;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "from_stage_id")
	private CrmDealStage fromStage;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "to_stage_id", nullable = false)
	private CrmDealStage toStage;

}
