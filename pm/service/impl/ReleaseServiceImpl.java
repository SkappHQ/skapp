package com.skapp.enterprise.pm.service.impl;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.payload.response.EpUserAuthPicResponseDto;
import com.skapp.enterprise.people.service.EpUserService;
import com.skapp.enterprise.pm.enums.ReleaseApprovalStatusEnum;
import com.skapp.enterprise.pm.enums.ReleaseIconEnum;
import com.skapp.enterprise.pm.payload.ApproverDto;
import com.skapp.enterprise.pm.payload.GenerateReleasePdfRequestDto;
import com.skapp.enterprise.pm.payload.ProjectItemDto;
import com.skapp.enterprise.pm.service.ReleaseService;
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
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
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

	private final EpUserService epUserService;

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
				                       projectType {
				                         icon
				                       }
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
		JsonMapper mapper = JsonMapper.builder().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES).build();

		dto.setId(releaseNode.has("id") && !releaseNode.get("id").isNull() ? releaseNode.get("id").asLong() : null);
		dto.setName(releaseNode.has("name") && !releaseNode.get("name").isNull() ? releaseNode.get("name").asString()
				: null);
		dto.setDescription(releaseNode.has("description") && !releaseNode.get("description").isNull()
				? releaseNode.get("description").asString() : null);
		dto.setEnvironment(releaseNode.has("environment") && !releaseNode.get("environment").isNull()
				? releaseNode.get("environment").asString() : null);
		dto.setStatus(releaseNode.has("status") && !releaseNode.get("status").isNull()
				? releaseNode.get("status").asString() : null);
		dto.setProjectId(releaseNode.has("projectId") && !releaseNode.get("projectId").isNull()
				? releaseNode.get("projectId").asLong() : null);

		if (releaseNode.has("releaseDate") && !releaseNode.get("releaseDate").isNull()) {
			String releaseDateStr = releaseNode.get("releaseDate").asString();
			dto.setReleaseDate(Instant.parse(releaseDateStr).atZone(ZoneId.systemDefault()).toLocalDateTime());
		}

		if (releaseNode.has("startDate") && !releaseNode.get("startDate").isNull()) {
			String startDateStr = releaseNode.get("startDate").asString();
			dto.setStartDate(Instant.parse(startDateStr).atZone(ZoneId.systemDefault()).toLocalDateTime());
		}

		if (releaseNode.has("project") && !releaseNode.get("project").isNull()
				&& releaseNode.get("project").has("name")) {
			dto.setProjectName(releaseNode.get("project").get("name").asString());
		}

		if (releaseNode.has("projectItems") && !releaseNode.get("projectItems").isNull()) {
			List<ProjectItemDto> projectItems = new ArrayList<>();
			for (JsonNode itemNode : releaseNode.get("projectItems")) {
				ProjectItemDto itemDto = mapper.convertValue(itemNode, ProjectItemDto.class);

				if (itemNode.has("projectType") && !itemNode.get("projectType").isNull()
						&& itemNode.get("projectType").has("icon")) {
					itemDto.setIcon(itemNode.get("projectType").get("icon").asString());
				}

				projectItems.add(itemDto);
			}
			dto.setProjectItems(projectItems);
		}

		if (releaseNode.has("approvers") && !releaseNode.get("approvers").isNull()) {
			List<ApproverDto> approvers = new ArrayList<>();
			List<Long> approverUserIds = new ArrayList<>();

			for (JsonNode approverNode : releaseNode.get("approvers")) {
				if (approverNode.has("userId") && !approverNode.get("userId").isNull()) {
					approverUserIds.add(approverNode.get("userId").asLong());
				}
			}

			List<EpUserAuthPicResponseDto> userAuthPics = epUserService.getAllUserAuthPicsOrByIds(approverUserIds);
			Map<Long, String> userIdToAuthPic = userAuthPics.stream()
				.collect(java.util.stream.Collectors.toMap(pic -> Long.valueOf(pic.getUserId()),
						EpUserAuthPicResponseDto::getAuthPic));

			for (JsonNode approverNode : releaseNode.get("approvers")) {
				ApproverDto approverDto = new ApproverDto();

				if (approverNode.has("userId") && !approverNode.get("userId").isNull()) {
					Long userId = approverNode.get("userId").asLong();
					Employee employee = employeeDao.findById(userId).orElse(null);

					if (employee != null) {
						approverDto.setName(employee.getFirstName() + " " + employee.getLastName());
						approverDto.setProfilePicture(userIdToAuthPic.get(userId));
						if (employee.getJobFamily() != null && employee.getJobTitle() != null) {
							approverDto.setRole(employee.getJobTitle().getName());
						}
					}
				}

				if (approverNode.has("status") && !approverNode.get("status").isNull()) {
					String statusStr = approverNode.get("status").asString();
					approverDto.setStatus(ReleaseApprovalStatusEnum.valueOf(statusStr.toUpperCase()));
				}

				if (approverNode.has("remarks") && !approverNode.get("remarks").isNull()) {
					approverDto.setRemarks(approverNode.get("remarks").asString());
				}

				if (approverNode.has("updatedAt") && !approverNode.get("updatedAt").isNull()) {
					String actionDateStr = approverNode.get("updatedAt").asString();
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
			String releaseDate = request.getReleaseDate() != null ? request.getReleaseDate().format(dateFormatter) : "";

			template = template.replace("{{projectTitle}}",
					escapeHtml(request.getProjectName() != null ? request.getProjectName() : "Project"));
			template = template.replace("{{versionName}}",
					escapeHtml(request.getName() != null ? request.getName() : ""));
			template = template.replace("{{releaseDate}}", escapeHtml(releaseDate));
			template = template.replace("{{environment}}",
					escapeHtml(request.getEnvironment() != null ? request.getEnvironment() : ""));
			template = template.replace("{{description}}",
					stripHtmlTags(request.getDescription() != null ? request.getDescription() : ""));
			template = template.replace("{{logo}}", getIcon(ReleaseIconEnum.SKAPP_ICON.name()));

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

	private StringBuilder getItemsHtmlBuilder(GenerateReleasePdfRequestDto request, String itemTemplate,
			String projectKey) {
		StringBuilder itemsHtmlBuilder = new StringBuilder();

		for (var item : request.getProjectItems()) {
			if (item.getIsDeleted() != null && !item.getIsDeleted()) {
				String workCode = projectKey + "-" + item.getItemNumber();
				String iconBase64 = getIcon(item.getIcon());

				itemsHtmlBuilder.append(itemTemplate.replace("{{workIcon}}", iconBase64)
					.replace("{{workCode}}", escapeHtml(workCode))
					.replace("{{workDescription}}", stripHtmlTags(item.getTitle() != null ? item.getTitle() : "")));
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
			ReleaseApprovalStatusEnum status = approver.getStatus() != null ? approver.getStatus()
					: ReleaseApprovalStatusEnum.PENDING;
			String statusClass = status.name().toLowerCase();
			String statusText = capitalizeFirst(status.name());

			String approvedIconSrc = ReleaseApprovalStatusEnum.APPROVED.equals(status)
					? loadIconFromResources(ReleaseIconEnum.APPROVED_ICON.getFileName()) : "";

			String actionText = approver.getActionDate() != null ? approver.getActionDate().format(dateFormatter) : "";

			String avatarHtml;
			String avatarDataUrl;
			String avatarInitials;

			if (approver.getProfilePicture() != null && !approver.getProfilePicture().trim().isEmpty()) {
				avatarDataUrl = approver.getProfilePicture();
				avatarHtml = "<img src=\"" + avatarDataUrl + "\" class=\"approver-avatar\" alt=\"Profile Picture\" />";
			}
			else {
				String name = approver.getName();
				if (name != null && !name.trim().isEmpty()) {
					String[] nameParts = name.trim().split("\\s+");
					StringBuilder initials = new StringBuilder();
					for (String part : nameParts) {
						if (!part.isEmpty()) {
							initials.append(part.charAt(0));
						}
					}
					avatarInitials = !initials.isEmpty() ? initials.toString().toUpperCase() : "A";
				}
				else {
					avatarInitials = "A";
				}
				avatarHtml = "<span class=\"approver-avatar\">" + avatarInitials + "</span>";
			}

			String approverHtml = approverTemplate
				.replace("{{approverName}}", escapeHtml(approver.getName() != null ? approver.getName() : ""))
				.replace("{{approverRole}}", escapeHtml(approver.getRole() != null ? approver.getRole() : ""))
				.replace("{{approverActionDate}}", escapeHtml(actionText))
				.replace("{{approverAvatar}}", avatarHtml)
				.replace("{{statusClass}}", escapeHtml(statusClass))
				.replace("{{statusText}}", escapeHtml(statusText))
				.replace("{{approvedIconSrc}}", approvedIconSrc);

			if (!ReleaseApprovalStatusEnum.PENDING.equals(status) && approver.getRemarks() != null
					&& !approver.getRemarks().trim().isEmpty()) {
				approverHtml = approverHtml.replace("{{#hasRemarks}}", "")
					.replace("{{/hasRemarks}}", "")
					.replace("{{remarks}}", stripHtmlTags(approver.getRemarks()));
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

	private String escapeHtml(String text) {
		if (text == null || text.isEmpty()) {
			return text;
		}
		return text.replace("&", "&amp;")
			.replace("<", "&lt;")
			.replace(">", "&gt;")
			.replace("\"", "&quot;")
			.replace("'", "&#x27;");
	}

	private String stripHtmlTags(String html) {
		if (html == null || html.isEmpty()) {
			return html;
		}
		String text = html.replaceAll("<[^>]*>", "");
		text = text.replace("&nbsp;", " ")
			.replace("&quot;", "\"")
			.replace("&#x27;", "'")
			.replace("&#39;", "'")
			.replace("&lt;", "<")
			.replace("&gt;", ">")
			.replace("&amp;", "&");
		return escapeHtml(text.trim());
	}

	private String getIcon(String icon) {
		return loadIconFromResources(ReleaseIconEnum.getFileNameByType(icon));
	}

	private String loadIconFromResources(String iconFileName) {
		try {
			ClassPathResource resource = new ClassPathResource(
					"enterprise/templates/pdf/en/release/icons/" + iconFileName);
			byte[] iconBytes = Files.readAllBytes(Paths.get(resource.getURI()));
			String base64Icon = Base64.getEncoder().encodeToString(iconBytes);
			return "data:image/png;base64," + base64Icon;
		}
		catch (IOException e) {
			log.warn("Failed to load icon: {}, using default", iconFileName, e);
			return getIcon(ReleaseIconEnum.TASK_ICON.name());
		}
	}

}
