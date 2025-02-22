package com.skapp.enterprise.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.route53.Route53Client;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsConfig {

	@Value("${aws.access-key}")
	private String accessKey;

	@Value("${aws.secret-key}")
	private String secretKey;

	@Value("${aws.s3.region}")
	private String s3Region;

	@Bean
	public Route53Client route53Client() {
		AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
		return Route53Client.builder()
			.region(Region.AWS_GLOBAL)
			.credentialsProvider(StaticCredentialsProvider.create(credentials))
			.build();
	}

	@Bean
	public S3Client s3Client() {
		AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

		return S3Client.builder()
			.region(Region.of(s3Region))
			.credentialsProvider(StaticCredentialsProvider.create(credentials))
			.build();
	}

}
