package com.skapp.enterprise.common.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class FirebaseConfig {

	@Bean
	public FirebaseMessaging initializeFirebaseMessaging() throws IOException {
		GoogleCredentials googleCredentials = GoogleCredentials
			.fromStream(new ClassPathResource("enterprise/firebase/firebase-service-account.json").getInputStream());
		FirebaseOptions firebaseOptions = FirebaseOptions.builder().setCredentials(googleCredentials).build();
		FirebaseApp firebaseApp;
		if (FirebaseApp.getApps().isEmpty()) {
			firebaseApp = FirebaseApp.initializeApp(firebaseOptions, "skapp");
		}
		else {
			firebaseApp = FirebaseApp.getInstance("skapp");
		}
		return FirebaseMessaging.getInstance(firebaseApp);
	}

}
