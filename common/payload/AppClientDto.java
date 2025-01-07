package com.skapp.enterprise.common.payload;

import com.skapp.enterprise.common.type.IdentityProviders;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AppClientDto {

	private String appClientDomainName;

	private List<IdentityProviders> identityProviders;

}
