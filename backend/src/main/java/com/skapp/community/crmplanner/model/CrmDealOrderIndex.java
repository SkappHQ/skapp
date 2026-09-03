package com.skapp.community.crmplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_deal_order_index")
public class CrmDealOrderIndex {

	@Id
	@Column(name = "deal_id", nullable = false, updatable = false)
	private Long dealId;

	@Column(name = "board")
	private String board;

	@Column(name = "list", nullable = false)
	private String list;

}
