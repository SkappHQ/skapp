package com.skapp.enterprise.common.validator;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.interfaces.RSAPublicKey;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleTokenValidator {

	private final JwkProvider jwkProvider;

	public GoogleTokenValidator() {
		try {
			jwkProvider = new JwkProviderBuilder(new URI(EpCommonConstants.JWK_PROVIDER).toURL()).build();
		}
		catch (URISyntaxException | MalformedURLException e) {
			throw new EntityNotFoundException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CONNECTION);
		}
	}

	public DecodedJWT validateToken(String token) throws JwkException {
		DecodedJWT jwt = JWT.decode(token);
		Jwk jwk = jwkProvider.get(jwt.getKeyId());
		RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();

		Algorithm algorithm = Algorithm.RSA256(publicKey, null);
		JWTVerifier verifier = JWT.require(algorithm).withIssuer(EpCommonConstants.JWT_ISSUER).build();

		return verifier.verify(token);
	}

}
