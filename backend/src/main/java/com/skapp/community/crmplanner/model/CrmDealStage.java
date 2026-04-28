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
@Table(name = "crm_deal_stage")
public class CrmDealStage extends Auditable<String> {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id", nullable = false, updatable = false)
private Long id;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "template_id", nullable = false)
private CrmPipelineTemplate template;

@Column(name = "name", nullable = false)
private String name;

@Column(name = "color", nullable = false)
private String color;

@Column(name = "order_index", nullable = false)
private Integer orderIndex;

@Column(name = "is_initial", nullable = false)
private Boolean isInitial = false;

@Column(name = "is_final", nullable = false)
private Boolean isFinal = false;

@Column(name = "is_won", nullable = false)
private Boolean isWon = false;

@Column(name = "is_deleted", nullable = false)
private Boolean isDeleted = false;

}
