package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpAuthConstants;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class EPSwaggerConfig {

	@Bean
	public OpenApiCustomizer addTenantIdHeaderCustomizer() {
		List<String> headerExcludedPaths = List.of("/v1/ep/tenant/create", "/v1/ep/organization",
				"/v1/ep/auth/signup/super-admin", "/v1/ep/auth/otp/generate", "/v1/ep/auth/otp/verify",
				"/v1/ep/auth/otp/resend", "/v1/ep/auth/domain/verify", "/v1/ep/auth/signup/super-admin/sso/google",
				"/v1/ep/auth/signup/super-admin", "/v1/ep/auth/tenant/availability", "/v1/validate/email");

		Map<String, List<PathItem.HttpMethod>> hiddenApiMethods = Map.of("/v1/auth/signup/super-admin",
				List.of(PathItem.HttpMethod.POST), "/v1/organization", List.of(PathItem.HttpMethod.POST),
				"/v1/reset-database", List.of(PathItem.HttpMethod.GET));

		return openApi -> openApi.getPaths().forEach((path, pathItem) -> {
			if (hiddenApiMethods.containsKey(path)) {
				removeOperations(pathItem, hiddenApiMethods.get(path));
			}

			if (!headerExcludedPaths.contains(path)) {
				addTenantIdHeader(pathItem);
			}
		});
	}

	private void removeOperations(PathItem pathItem, List<PathItem.HttpMethod> methods) {
		methods.forEach(method -> {
			switch (method) {
				case GET -> pathItem.setGet(null);
				case POST -> pathItem.setPost(null);
				case PUT -> pathItem.setPut(null);
				case DELETE -> pathItem.setDelete(null);
				case PATCH -> pathItem.setPatch(null);
				default -> throw new IllegalArgumentException("Unsupported HTTP method: " + method);
			}
		});
	}

	private void addTenantIdHeader(PathItem pathItem) {
		pathItem.readOperations()
			.forEach(operation -> operation.addParametersItem(new HeaderParameter().name(EpAuthConstants.TENANT_HEADER)
				.description("Tenant ID for multi-tenancy")
				.schema(new StringSchema())
				.required(true)));
	}

}
