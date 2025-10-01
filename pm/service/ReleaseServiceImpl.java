package com.skapp.enterprise.pm.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.pm.payload.ApproverDto;
import com.skapp.enterprise.pm.payload.GenerateReleasePdfRequestDto;
import com.skapp.enterprise.pm.payload.ProjectItemDto;
import com.skapp.enterprise.pm.type.ReleaseApprovalStatus;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseServiceImpl implements ReleaseService {

	@Value("${pm.service.url}")
	private String pmServiceUrl;

	@Value("${pm.internal.api.key}")
	private String internalApiKey;

	private final RestTemplate restTemplate;

	private final EmployeeDao employeeDao;

	@Override
	public byte[] generateReleasePdf(Long releaseId, String projectKey, HttpServletRequest httpRequest)
			throws IOException {

		GenerateReleasePdfRequestDto request = fetchReleaseDataFromAPI(httpRequest, releaseId, projectKey);

		String html = generateReleaseHtml(request, projectKey);

		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		PdfRendererBuilder builder = new PdfRendererBuilder();
		builder.withHtmlContent(html, null);
		builder.toStream(baos);
		builder.run();

		return baos.toByteArray();
	}

	private GenerateReleasePdfRequestDto fetchReleaseDataFromAPI(HttpServletRequest httpRequest, Long releaseId,
			String projectKey) {
		Map<String, Object> graphQLRequest = getStringObjectMap(releaseId);

		HttpHeaders headers = createHeaders(httpRequest, projectKey);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		try {
			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode responseJsonNode = objectMapper.readTree(responseEntity.getBody());

			if (responseJsonNode.has("errors") && !responseJsonNode.get("errors").isEmpty()) {
				log.error("GraphQL errors when fetching release data: {}", responseJsonNode.get("errors"));
			}

			if (responseJsonNode.has("data") && responseJsonNode.get("data").has("internalProjectRelease")) {
				JsonNode releaseNode = responseJsonNode.get("data").get("internalProjectRelease");
				return mapJsonToDto(releaseNode);
			}

		}
		catch (RestClientException e) {
			log.error("Error making HTTP request to {}: {}", pmServiceUrl, e.getMessage());
		}
		catch (Exception e) {
			log.error("Error parsing JSON response: ", e);
		}

		throw new ModuleException(CommonMessageConstant.COMMON_ERROR_MODULE_EXCEPTION);
	}

	private static Map<String, Object> getStringObjectMap(Long releaseId) {
		String query = """
				query Query($internalProjectReleaseId: Int!) {
				                   internalProjectRelease(id: $internalProjectReleaseId) {
				                     id
				                     name
				                     description
				                     environment
				                     releaseDate
				                     startDate
				                     status
				                     projectId
				                     project {
				                        name
				                     }
				                     projectItems {
				                       id
				                       itemNumber
				                       title
				                       typeId
				                       estimation
				                       isDeleted
				                     }
				                     approvers {
				                       userId
				                       status
				                       remarks
				                       updatedAt
				                     }
				                   }
				                 }
				""";

		Map<String, Object> variables = new HashMap<>();
		variables.put("internalProjectReleaseId", releaseId.intValue());

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put("query", query);
		graphQLRequest.put("variables", variables);
		return graphQLRequest;
	}

	private GenerateReleasePdfRequestDto mapJsonToDto(JsonNode releaseNode) {
		GenerateReleasePdfRequestDto dto = new GenerateReleasePdfRequestDto();
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		dto.setId(releaseNode.has("id") && !releaseNode.get("id").isNull() ? releaseNode.get("id").asLong() : null);
		dto.setName(
				releaseNode.has("name") && !releaseNode.get("name").isNull() ? releaseNode.get("name").asText() : null);
		dto.setDescription(releaseNode.has("description") && !releaseNode.get("description").isNull()
				? releaseNode.get("description").asText() : null);
		dto.setEnvironment(releaseNode.has("environment") && !releaseNode.get("environment").isNull()
				? releaseNode.get("environment").asText() : null);
		dto.setStatus(releaseNode.has("status") && !releaseNode.get("status").isNull()
				? releaseNode.get("status").asText() : null);
		dto.setProjectId(releaseNode.has("projectId") && !releaseNode.get("projectId").isNull()
				? releaseNode.get("projectId").asLong() : null);

		if (releaseNode.has("releaseDate") && !releaseNode.get("releaseDate").isNull()) {
			String releaseDateStr = releaseNode.get("releaseDate").asText();
			dto.setReleaseDate(Instant.parse(releaseDateStr).atZone(ZoneId.systemDefault()).toLocalDateTime());
		}

		if (releaseNode.has("startDate") && !releaseNode.get("startDate").isNull()) {
			String startDateStr = releaseNode.get("startDate").asText();
			dto.setStartDate(Instant.parse(startDateStr).atZone(ZoneId.systemDefault()).toLocalDateTime());
		}

		if (releaseNode.has("project") && !releaseNode.get("project").isNull()
				&& releaseNode.get("project").has("name")) {
			dto.setProjectName(releaseNode.get("project").get("name").asText());
		}

		if (releaseNode.has("projectItems") && !releaseNode.get("projectItems").isNull()) {
			List<ProjectItemDto> projectItems = mapper.convertValue(releaseNode.get("projectItems"),
					mapper.getTypeFactory().constructCollectionType(List.class, ProjectItemDto.class));
			dto.setProjectItems(projectItems);
		}

		if (releaseNode.has("approvers") && !releaseNode.get("approvers").isNull()) {
			List<ApproverDto> approvers = new ArrayList<>();
			for (JsonNode approverNode : releaseNode.get("approvers")) {
				ApproverDto approverDto = new ApproverDto();

				if (approverNode.has("userId") && !approverNode.get("userId").isNull()) {
					Long userId = approverNode.get("userId").asLong();
					Employee employee = employeeDao.findById(userId).orElse(null);

					if (employee != null) {
						approverDto.setName(employee.getFirstName() + " " + employee.getLastName());
						if (employee.getJobFamily() != null && employee.getJobTitle() != null) {
							approverDto.setRole(employee.getJobTitle().getName());
						}
					}
				}

				if (approverNode.has("status") && !approverNode.get("status").isNull()) {
					String statusStr = approverNode.get("status").asText();
					approverDto.setStatus(ReleaseApprovalStatus.valueOf(statusStr.toUpperCase()));
				}

				if (approverNode.has("remarks") && !approverNode.get("remarks").isNull()) {
					approverDto.setRemarks(approverNode.get("remarks").asText());
				}

				if (approverNode.has("actionDate") && !approverNode.get("actionDate").isNull()) {
					String actionDateStr = approverNode.get("actionDate").asText();
					approverDto
						.setActionDate(Instant.parse(actionDateStr).atZone(ZoneId.systemDefault()).toLocalDateTime());
				}

				approvers.add(approverDto);
			}
			dto.setApprovers(approvers);
		}

		return dto;
	}

	private HttpHeaders createHeaders(HttpServletRequest request, String projectKey) {
		HttpHeaders headers = new HttpHeaders();
		headers.set(EpAuthConstants.TENANT_HEADER, request.getHeader(EpAuthConstants.TENANT_HEADER));
		headers.set(EpAuthConstants.API_KEY_HEADER, internalApiKey);
		headers.set(EpAuthConstants.PROJECT_KEY_HEADER, projectKey);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	private String generateReleaseHtml(GenerateReleasePdfRequestDto request, String projectKey) {
		try {
			ClassPathResource resource = new ClassPathResource("enterprise/templates/pdf/en/release/release-note.html");
			String template = Files.readString(Paths.get(resource.getURI()));

			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
			String logoBase64 = "data:image/png;base64,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";

			String releaseDate = request.getReleaseDate() != null ? request.getReleaseDate().format(dateFormatter) : "";

			template = template.replace("{{projectTitle}}",
					request.getProjectName() != null ? request.getProjectName() : "Project");
			template = template.replace("{{versionName}}", request.getName() != null ? request.getName() : "");
			template = template.replace("{{releaseDate}}", releaseDate);
			template = template.replace("{{environment}}",
					request.getEnvironment() != null ? request.getEnvironment() : "");
			template = template.replace("{{description}}",
					request.getDescription() != null ? request.getDescription() : "");
			template = template.replace("{{logo}}", logoBase64);

			template = processWorkItems(template, request, projectKey);

			boolean hasApprovers = request.getApprovers() != null && !request.getApprovers().isEmpty();
			if (hasApprovers) {
				template = template.replace("{{#hasApprovers}}", "").replace("{{/hasApprovers}}", "");
				template = processApprovers(template, request);
			}
			else {
				template = removeConditionalBlock(template, "{{#hasApprovers}}", "{{/hasApprovers}}");
			}

			return template;

		}
		catch (IOException e) {
			log.error("Error loading release template", e);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_IO_EXCEPTION);
		}
	}

	private String processWorkItems(String template, GenerateReleasePdfRequestDto request, String projectKey) {
		String startMarker = "{{#workItems}}";
		String endMarker = "{{/workItems}}";

		int startIndex = template.indexOf(startMarker);
		int endIndex = template.indexOf(endMarker);

		if (startIndex == -1 || endIndex == -1 || request.getProjectItems() == null) {
			return removeConditionalBlock(template, startMarker, endMarker);
		}

		String itemTemplate = template.substring(startIndex + startMarker.length(), endIndex);
		StringBuilder itemsHtmlBuilder = getItemsHtmlBuilder(request, itemTemplate, projectKey);

		return template.substring(0, startIndex) + itemsHtmlBuilder + template.substring(endIndex + endMarker.length());
	}

	private static StringBuilder getItemsHtmlBuilder(GenerateReleasePdfRequestDto request, String itemTemplate,
			String projectKey) {
		StringBuilder itemsHtmlBuilder = new StringBuilder();

		String iconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIESURBVHgBpZS9b9NAGMaf93wuUh3RDLCBKEJIbKmABRY+JtjcEZJK6cIMEgqj05EGVPEX1BIVAwOUjQlVqtioFAbE0IFGMCIRqiaosXMvd+e0Sl07/XoGn+/j/d1zXy8hQ3X/T9Hz3CqTuEWEKTAmB11NBjag1Ifam0KYFUvphucPOr5wsKi7ihghZg1mNZcGi+FKY6a7IBx6fxDMOiFMkhCLjUonyAS+rPwL9NIe48iieqO8tbBbM5/5h1tVMxtOIAWefrbkLSfAcveHWcLwgDtlF5evO3uCPr+L8G21n4PktpS9i9K6S8GMDOzrpxjdzaR+6aqD+4/G9F8vB0rFXuRWpd5dP2dKC+tusv2PtpNyFJRAtyURXcAh9PunwndduqeAm9NunsuS1N+pQwF/GYfKuj57XmSOMVsnDgKdOZfc/Ss3HFy7J63DUdIOuaXZmcs2wQbS+cvwJgirb+PRNHBT6CfUzOuOtmEhep9tuXNAuThGSxB4JW/A+OmkXPsYD+qE8QnKJwpeltKNwjgeC9Lvd31NoXRXZsatf8k4YcJG7XUhtNO9qHR8hkkKxxeTmjVAe8pP7RtUr3BMKfTnDCwxOiSdiuq6KcARxNpIbamwm6X27fD8jH7bEMFQls4UEbf7jFmTYfa05wUYMBT5SeKg0sBPy1wzErwiHS98ElI7HfcfxA25C0XLknUAAAAASUVORK5CYII=";

		for (var item : request.getProjectItems()) {
			if (item.getIsDeleted() != null && !item.getIsDeleted()) {
				String workCode = projectKey + "-" + item.getItemNumber();

				itemsHtmlBuilder.append(itemTemplate.replace("{{workIcon}}", iconBase64)
					.replace("{{workCode}}", workCode)
					.replace("{{workDescription}}", item.getTitle() != null ? item.getTitle() : ""));
			}
		}
		return itemsHtmlBuilder;
	}

	private String processApprovers(String template, GenerateReleasePdfRequestDto request) {
		String startMarker = "{{#approvers}}";
		String endMarker = "{{/approvers}}";

		int startIndex = template.indexOf(startMarker);
		int endIndex = template.indexOf(endMarker);

		if (startIndex == -1 || endIndex == -1 || request.getApprovers() == null || request.getApprovers().isEmpty()) {
			return removeConditionalBlock(template, startMarker, endMarker);
		}

		String approverTemplate = template.substring(startIndex + startMarker.length(), endIndex);
		StringBuilder approversHtmlBuilder = new StringBuilder();

		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

		for (var approver : request.getApprovers()) {
			ReleaseApprovalStatus status = approver.getStatus() != null ? approver.getStatus()
					: ReleaseApprovalStatus.PENDING;
			String statusClass = status.name().toLowerCase();
			String statusText = capitalizeFirst(status.name());

			String actionText;
			if (ReleaseApprovalStatus.PENDING.equals(status)) {
				actionText = "";
			}
			else {
				String actionDate = approver.getActionDate() != null ? approver.getActionDate().format(dateFormatter)
						: "";
				actionText = statusText + " on - " + actionDate;
			}

			String approverHtml = approverTemplate
				.replace("{{approverName}}", approver.getName() != null ? approver.getName() : "")
				.replace("{{approverRole}}", approver.getRole() != null ? approver.getRole() : "")
				.replace("{{approverActionDate}}", actionText)
				.replace("{{statusClass}}", statusClass)
				.replace("{{statusText}}", statusText);

			if (!ReleaseApprovalStatus.PENDING.equals(status) && approver.getRemarks() != null
					&& !approver.getRemarks().trim().isEmpty()) {
				approverHtml = approverHtml.replace("{{#hasRemarks}}", "")
					.replace("{{/hasRemarks}}", "")
					.replace("{{remarks}}", approver.getRemarks());
			}
			else {
				approverHtml = removeConditionalBlock(approverHtml, "{{#hasRemarks}}", "{{/hasRemarks}}");
			}

			approversHtmlBuilder.append(approverHtml);
		}

		return template.substring(0, startIndex) + approversHtmlBuilder
				+ template.substring(endIndex + endMarker.length());
	}

	private String removeConditionalBlock(String template, String startTag, String endTag) {
		int startIndex = template.indexOf(startTag);
		int endIndex = template.indexOf(endTag);
		if (startIndex != -1 && endIndex != -1) {
			return template.substring(0, startIndex) + template.substring(endIndex + endTag.length());
		}
		return template;
	}

	private String capitalizeFirst(String str) {
		if (str == null || str.isEmpty())
			return str;
		return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
	}

}
