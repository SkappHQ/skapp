package com.skapp.community.crmplanner.constant;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * The default CRM deal list-view config returned when a user has not saved one. The
 * config itself is an opaque JSON blob owned by the frontend; this default is the only
 * shape the backend keeps, matching the columns the deal table ships with. {@code fields}
 * order is the default column order; {@code sort} is null (no active sort).
 */
public final class DefaultCrmDealListViewConfig {

	private DefaultCrmDealListViewConfig() {
	}

	public static JsonNode build(ObjectMapper objectMapper) {
		ArrayNode fields = objectMapper.createArrayNode();
		fields.add(field(objectMapper, "DEAL_NAME", 400));
		fields.add(field(objectMapper, "VALUE", 140));
		fields.add(field(objectMapper, "STAGE", 140));
		fields.add(field(objectMapper, "COMPANY_NAME", 140));
		fields.add(field(objectMapper, "CONTACT_NAME", 140));
		fields.add(field(objectMapper, "PRIORITY", 140));
		fields.add(field(objectMapper, "DEAL_OWNER", 140));

		ObjectNode config = objectMapper.createObjectNode();
		config.set("fields", fields);
		config.putNull("sort");
		return config;
	}

	private static ObjectNode field(ObjectMapper objectMapper, String field, int width) {
		ObjectNode node = objectMapper.createObjectNode();
		node.put("field", field);
		node.putNull("fieldId");
		node.put("width", width);
		node.put("isVisible", true);
		node.put("isSortable", true);
		node.put("isDraggable", true);
		node.put("isGroupable", false);
		node.put("isResizable", false);
		return node;
	}

}
