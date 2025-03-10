package com.skapp.enterprise.common.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationDetailsDto {

	private WebAuthenticationDetails webDetails;

	private AdditionalDetailsDto additionalDetails;

}
