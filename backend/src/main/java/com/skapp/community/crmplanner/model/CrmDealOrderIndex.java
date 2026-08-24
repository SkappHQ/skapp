package com.skapp.community.crmplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
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

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "deal_id")
	private CrmDeal deal;

	@Column(name = "board", nullable = false)
	private String board;

	@Column(name = "list", nullable = false)
	private String list;

}
