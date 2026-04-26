package com.skapp.community.crmplanner.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "crm_pipeline_template")
public class CrmPipelineTemplate extends Auditable<String> {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id", nullable = false, updatable = false)
private Long id;

@Column(name = "name", nullable = false)
private String name;

@Column(name = "description", columnDefinition = "TEXT")
private String description;

@Column(name = "is_deleted", nullable = false)
private Boolean isDeleted = false;

}
