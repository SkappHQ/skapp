package com.skapp.enterprise.esignature.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.context.annotation.Configuration;

import java.security.Security;

@Slf4j
@Configuration
public class BouncyCastleConfig {

	@PostConstruct
	public void setUpBouncyCastleProvider() {
		if (Security.getProvider("BC") == null) {
			Security.addProvider(new BouncyCastleProvider());
			log.info("Bouncy Castle provider registered.");
		}
	}

}
