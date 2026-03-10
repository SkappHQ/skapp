package com.skapp.enterprise.esignature.util;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.payload.response.AuditTrailResponseDto;
import com.skapp.enterprise.esignature.payload.response.MetadataResponseDto;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;

import java.awt.Color;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.UUID;

public class EsignUtil {

	private static final String FILE_PREFIX = "processed_";

	private static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";

	public static final String CSS_FONT_WEIGHT_BOLD = "bold";

	public static final String CSS_FONT_WEIGHT_NORMAL = "normal";

	public static final String CSS_FONT_STYLE_ITALIC = "italic";

	public static final String CSS_FONT_STYLE_NORMAL = "normal";

	public static final String CSS_TEXT_DECORATION_UNDERLINE = "underline";

	public static final String CSS_TEXT_DECORATION_NONE = "none";

	public static String resolveFontWeight(boolean isBold) {
		return isBold ? CSS_FONT_WEIGHT_BOLD : CSS_FONT_WEIGHT_NORMAL;
	}

	public static String resolveFontStyle(boolean isItalic) {
		return isItalic ? CSS_FONT_STYLE_ITALIC : CSS_FONT_STYLE_NORMAL;
	}

	public static String resolveTextDecoration(boolean isUnderline) {
		return isUnderline ? CSS_TEXT_DECORATION_UNDERLINE : CSS_TEXT_DECORATION_NONE;
	}

	private static final String HEADER_CF_CONNECTING_IP = "CF-Connecting-IP";

	private static final String HEADER_CF_CONNECTING_IPV6 = "CF-Connecting-IPv6";

	private static final String HEADER_X_REAL_IP = "X-Real-IP";

	private static final String UNKNOWN = "unknown";

	private static final String PATH_ATTR = "; Path=";

	private static final String DOMAIN_ATTR = "; Domain=";

	private static final String SECURE_ATTR = "; Secure";

	private static final String HTTP_ONLY_ATTR = "; HttpOnly";

	private static final String MAX_AGE_ATTR = "; Max-Age=";

	private static final String SAME_SITE_ATTR = "; SameSite=None";

	private static final String DEFAULT_PATH = "/";

	private static final String E_SIGN = "eSign/";

	public static final float COLOR_NORMALIZATION_FACTOR = 255f;

	private static final String TEMPLATE_DOCUMENT_FILE_PATH_PREFIX = "/eSign/template/";

	private static final String DOCUMENT_FILE_PATH_PREFIX = "/eSign/envelop/";

	private static final String TEMPLATE_FOLDER_NAME = "/template/";

	private static final String ENVELOPE_FOLDER_NAME = "/envelope/";

	private static final String ADVANCE_INPUT_TEXT_FIELD_TEMPLATE = "enterprise/templates/pdf/en/esignature/advance-input-text-field.html";

	private static final String ESIGN_IMAGE_FIELD_TEMPLATE = "enterprise/templates/pdf/en/esignature/advance-image-field.html";

	private EsignUtil() {
	}

	public static String randomUrlPath() {
		return FILE_PREFIX + UUID.randomUUID() + ".pdf";
	}

	public static String getClientIp(HttpServletRequest request) {
		String[] headers = { HEADER_CF_CONNECTING_IP, HEADER_CF_CONNECTING_IPV6, HEADER_X_FORWARDED_FOR,
				HEADER_X_REAL_IP };

		for (String header : headers) {
			String ip = request.getHeader(header);
			if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
				// For HEADER_X_FORWARDED_FOR, return the first IP in the list
				return header.equals(HEADER_X_FORWARDED_FOR) ? ip.split(",")[0].trim() : ip;
			}
		}

		return request.getRemoteAddr(); // Fallback to direct IP
	}

	public static String generateTimestampUUID() {
		UUID generatedUUID = UUID.randomUUID();

		Instant now = Instant.now();
		long epochMillis = now.toEpochMilli();

		return generatedUUID + "_" + epochMillis;
	}

	public static String buildSetCookieHeader(String nameValue, int maxAge, String domain, String path) {
		String[] parts = nameValue.split("=", 2);
		String name = parts[0];
		String value = parts.length > 1 ? parts[1] : "";

		StringBuilder sb = new StringBuilder();
		sb.append(name).append("=").append(value);

		if (path != null && !path.isEmpty()) {
			sb.append(PATH_ATTR).append(path);
		}
		else {
			sb.append(PATH_ATTR).append(DEFAULT_PATH);
		}

		if (domain != null && !domain.isEmpty()) {
			sb.append(DOMAIN_ATTR).append(domain);
		}

		sb.append(SECURE_ATTR);
		sb.append(HTTP_ONLY_ATTR);

		if (maxAge > 0) {
			sb.append(MAX_AGE_ATTR).append(maxAge);
		}

		sb.append(SAME_SITE_ATTR);

		return sb.toString();
	}

	public static String removeEsignPrefix(String path) {
		String prefix = E_SIGN;
		if (path != null && path.startsWith(prefix)) {
			return path.substring(prefix.length());
		}
		return path;
	}

	public static String removeBucketAndEsignPrefix(String bucketName, String path) {
		String prefix = bucketName + "/" + E_SIGN;
		if (path != null && path.startsWith(prefix)) {
			return path.substring(prefix.length());
		}
		return path;
	}

	// Helper methods to match the design
	public static String getStatusClass(EnvelopeStatus status) {
		switch (status) {
			case COMPLETED:
				return "completed"; // Green filled dot
			case WAITING:
				return "waiting"; // Orange outlined dot
			case NEED_TO_SIGN:
				return "need-to-sign"; // Green outlined dot
			case VOIDED:
				return "voided"; // Dark filled dot
			case DECLINED:
				return "declined"; // Red outlined dot
			case EXPIRED:
				return "expired"; // Red filled dot
			default:
				return "completed";
		}
	}

	public static String getStatusLabel(EnvelopeStatus status) {
		switch (status) {
			case COMPLETED:
				return "Completed";
			case WAITING:
				return "Waiting";
			case NEED_TO_SIGN:
				return "Need to sign";
			case VOIDED:
				return "Voided";
			case DECLINED:
				return "Declined";
			case EXPIRED:
				return "Expired";
			default:
				return status.name();
		}
	}

	public static String escapeHtml(String text) {
		if (text == null)
			return "";
		return text.replace("&", "&amp;")
			.replace("<", "&lt;")
			.replace(">", "&gt;")
			.replace("\"", "&quot;")
			.replace("'", "&#39;")
			.replace("\r\n", "<br/>")
			.replace("\r", "<br/>")
			.replace("\n", "<br/>");
	}

	public static String getFormattedActionText(AuditTrailResponseDto audit) {
		String actionBy = audit.getActionDoneByName() != null ? audit.getActionDoneByName() : "";

		switch (audit.getAction()) {
			case ENVELOPE_CREATED:
				return actionBy + EsignConstants.AUDIT_ACTION_CREATED_DOCUMENT;
			case ENVELOPE_SENT:
				return actionBy + EsignConstants.AUDIT_ACTION_SENT_DOCUMENT;
			case ENVELOPE_VIEWED:
				return actionBy + EsignConstants.AUDIT_ACTION_VIEWED_DOCUMENT;
			case ENVELOPE_SIGNED:
				return actionBy + EsignConstants.AUDIT_ACTION_SIGNED_DOCUMENT;
			case ENVELOPE_COMPLETED:
				return EsignConstants.AUDIT_ACTION_DOCUMENT_COMPLETED;
			case ENVELOPE_VOIDED:
				return EsignConstants.AUDIT_ACTION_DOCUMENT_VOIDED;
			case ENVELOPE_DECLINED:
				return actionBy + EsignConstants.AUDIT_ACTION_DECLINED_TO_SIGN;
			case ENVELOPE_EXPIRED:
				return EsignConstants.AUDIT_ACTION_DOCUMENT_EXPIRED;
			case ENVELOPE_DOWNLOADED:
				return actionBy + EsignConstants.AUDIT_ACTION_DOWNLOADED_DOCUMENT;
			case ENVELOPE_CUSTODY_TRANSFERRED:
				String newOwner = "";
				if (audit.getMetadata() != null && !audit.getMetadata().isEmpty()) {
					for (MetadataResponseDto metadata : audit.getMetadata()) {
						if (EsignConstants.CURRENT_OWNER_METADATA_NAME.equals(metadata.getName())) {
							newOwner = metadata.getValue();
							break;
						}
					}
				}
				return actionBy + EsignConstants.AUDIT_ACTION_TRANSFERRED_OWNERSHIP + newOwner;
			default:
				return audit.getAction().toString();
		}
	}

	public static boolean validateEsignRoleAsSuperAdminOrEsignAdmin(User currentUser) {

		return currentUser.getEmployee().getEmployeeRole().getEsignRole().equals(Role.ESIGN_ADMIN)
				|| currentUser.getEmployee().getEmployeeRole().getEsignRole().equals(Role.SUPER_ADMIN);

	}

	public static String truncateDocumentName(String documentName) {
		if (documentName != null && documentName.length() > EsignConstants.DOCUMENT_NAME_TRUNCATE_LENGTH) {
			return documentName.substring(0, EsignConstants.DOCUMENT_NAME_TRUNCATE_LENGTH) + "...";
		}
		return documentName;
	}

	/**
	 * Normalizes a {@link Color}'s RGB channels from the [0, 255] integer range into the
	 * [0.0, 1.0] float range expected by PDFBox content-stream color setters.
	 * <p>
	 * Returns a {@code float[3]} array in the order {@code [red, green, blue]}.
	 */
	public static float[] normalizeColor(Color color) {
		return new float[] { color.getRed() / COLOR_NORMALIZATION_FACTOR, color.getGreen() / COLOR_NORMALIZATION_FACTOR,
				color.getBlue() / COLOR_NORMALIZATION_FACTOR };
	}

	public static String normalizeDocumentFilePath(String bucketName, String filePath, boolean isTemplate) {
		if (filePath == null) {
			return null;
		}

		String folderName = isTemplate ? TEMPLATE_FOLDER_NAME : ENVELOPE_FOLDER_NAME;
		String prefix = isTemplate ? TEMPLATE_DOCUMENT_FILE_PATH_PREFIX : DOCUMENT_FILE_PATH_PREFIX;

		int pathIndex = filePath.indexOf(folderName);
		if (pathIndex != -1) {
			String relativePath = filePath.substring(pathIndex + folderName.length());
			return bucketName + prefix + relativePath;
		}

		return bucketName + "/" + filePath;
	}

	/**
	 * Reads {@code advance-input-text-field.html} from the classpath and substitutes the
	 * nine {@code {{token}}} placeholders with the supplied values to produce a
	 * self-contained HTML document.
	 * <p>
	 * Placeholder-to-parameter mapping:
	 * <ul>
	 * <li>{@code {{width}}} → {@code adjustedWidth} (converted via
	 * {@link String#valueOf(float)})</li>
	 * <li>{@code {{height}}} → {@code adjustedHeight} (converted via
	 * {@link String#valueOf(float)})</li>
	 * <li>{@code {{fontFamily}}} → {@code fontFamilyCss}</li>
	 * <li>{@code {{fontSize}}} → {@code fontSize} (converted via
	 * {@link String#valueOf(float)})</li>
	 * <li>{@code {{fontWeight}}} → {@code fontWeight}</li>
	 * <li>{@code {{fontStyle}}} → {@code fontStyle}</li>
	 * <li>{@code {{textDecoration}}} → {@code textDecoration}</li>
	 * <li>{@code {{fontColor}}} → {@code fontColor}</li>
	 * <li>{@code {{content}}} → {@code escapedValue}</li>
	 * </ul>
	 * @param adjustedWidth body width in points — written as {@code width: <value>pt}
	 * @param adjustedHeight body height in points — written as {@code height: <value>pt}
	 * @param fontFamilyCss CSS {@code font-family} string
	 * @param fontSize CSS {@code font-size} in points
	 * @param fontWeight CSS {@code font-weight} string (e.g. {@code "bold"},
	 * {@code "normal"})
	 * @param fontStyle CSS {@code font-style} string (e.g. {@code "italic"},
	 * {@code "normal"})
	 * @param textDecoration CSS {@code text-decoration} string (e.g. {@code "underline"},
	 * {@code "none"})
	 * @param fontColor CSS {@code color} string (e.g. {@code "#3f3f46"})
	 * @param escapedValue HTML-escaped text inserted as the {@code <body>} content
	 * @return the template string with all placeholders replaced
	 * @throws IOException if {@code advance-input-text-field.html} cannot be read from
	 * the classpath
	 */
	public static String buildTextFieldHtml(float adjustedWidth, float adjustedHeight, String fontFamilyCss,
			float fontSize, String fontWeight, String fontStyle, String textDecoration, String fontColor,
			String escapedValue) throws IOException {

		ClassPathResource resource = new ClassPathResource(ADVANCE_INPUT_TEXT_FIELD_TEMPLATE);
		String template = Files.readString(Paths.get(resource.getURI()));

		return template.replace("{{width}}", String.valueOf(adjustedWidth))
			.replace("{{height}}", String.valueOf(adjustedHeight))
			.replace("{{fontFamily}}", fontFamilyCss)
			.replace("{{fontSize}}", String.valueOf(fontSize))
			.replace("{{fontWeight}}", fontWeight)
			.replace("{{fontStyle}}", fontStyle)
			.replace("{{textDecoration}}", textDecoration)
			.replace("{{fontColor}}", fontColor)
			.replace("{{content}}", escapedValue);
	}

	/**
	 * Reads {@code esign-image-field.html} from the classpath and substitutes the
	 * {@code {{width}}}, {@code {{height}}}, and {@code {{svgContent}}} placeholders to
	 * produce a self-contained HTML document that renders the given SVG inline.
	 * @param adjustedWidth body width in points
	 * @param adjustedHeight body height in points
	 * @param svgBytes raw bytes of the SVG file to embed as inline markup
	 * @return the template string with all placeholders replaced
	 * @throws IOException if the template cannot be read from the classpath
	 */
	public static String buildSvgImageHtml(float adjustedWidth, float adjustedHeight, byte[] svgBytes)
			throws IOException {
		ClassPathResource resource = new ClassPathResource(ESIGN_IMAGE_FIELD_TEMPLATE);
		String template = Files.readString(Paths.get(resource.getURI()));
		String svgContent = new String(svgBytes, StandardCharsets.UTF_8);

		return template.replace("{{width}}", String.valueOf(adjustedWidth))
			.replace("{{height}}", String.valueOf(adjustedHeight))
			.replace("{{svgContent}}", svgContent);
	}

}
