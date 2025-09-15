package com.skapp.enterprise.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.kickstart.spring.webclient.boot.GraphQLWebClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GraphQLConfig {

	@Bean
	public GraphQLWebClient graphQLWebClient(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
		WebClient webClient = webClientBuilder.build();
		return GraphQLWebClient.newInstance(webClient, objectMapper);
	}

}
