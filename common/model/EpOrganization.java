package com.skapp.enterprise.common.model;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.util.converter.EncryptionDecryptionConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class EpOrganization extends Organization {

	@Column(name = "company_domain")
	private String companyDomain;

	@Convert(converter = EncryptionDecryptionConverter.class)
	@Column(name = "contact_no")
	private String contactNo;

	@Column(name = "partner_id")
	private String partnerId;

}
