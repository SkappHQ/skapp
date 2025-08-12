package com.skapp.enterprise.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.retries.StandardRetryStrategy;
import software.amazon.awssdk.services.cloudfront.CloudFrontUtilities;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class AwsConfig {

	@Value("${aws.access-key}")
	private String accessKey;

	@Value("${aws.secret-key}")
	private String secretKey;

	@Value("${aws.s3.region}")
	private String s3Region;

	@Value("${aws.s3.max-attempts}")
	private int maxAttempts;

	@Bean
	public S3Client s3Client() {
		AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

		return S3Client.builder()
			.region(Region.of(s3Region))
			.credentialsProvider(StaticCredentialsProvider.create(credentials))
			.overrideConfiguration(ClientOverrideConfiguration.builder()
				.retryStrategy(StandardRetryStrategy.builder().maxAttempts(maxAttempts).build())
				.build())
			.build();
	}

	@Bean
	public S3Presigner s3Presigner() {
		AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

		return S3Presigner.builder()
			.region(Region.of(s3Region))
			.credentialsProvider(StaticCredentialsProvider.create(credentials))
			.build();
	}

	@Bean
	public CloudFrontUtilities cloudFrontUtilities() {
		return CloudFrontUtilities.create();
	}

}
