package com.skapp.community.crmplanner.constant;

import com.skapp.community.crmplanner.type.DefaultCrmDealListViewValues;

import lombok.experimental.UtilityClass;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.JsonNodeFactory;
import tools.jackson.databind.node.ObjectNode;

/**
 * The default CRM deal list-view config returned when a user has not saved one. The
 * config is an opaque JSON blob owned by the frontend; this default is only the initial
 * shape the backend seeds, and its field vocabulary and flags are finalised with the
 * frontend that consumes it. {@code fields} order is the default column order;
 * {@code sort} is null (no active sort).
 */
@UtilityClass
public class DefaultCrmDealListViewTemplate {

	public static JsonNode build() {
		ArrayNode fields = JsonNodeFactory.instance.arrayNode();
		DefaultCrmDealListViewValues.DEFAULT_FIELDS.forEach(value -> fields.add(toFieldNode(value)));

		ObjectNode config = JsonNodeFactory.instance.objectNode();
		config.set("fields", fields);
		config.putNull("sort");
		return config;
	}

	private static ObjectNode toFieldNode(DefaultCrmDealListViewValues value) {
		ObjectNode node = JsonNodeFactory.instance.objectNode();
		node.put("field", value.getField().name());
		node.putNull("fieldId");
		node.put("width", value.getWidth());
		node.put("isVisible", true);
		node.put("isSortable", true);
		node.put("isDraggable", true);
		node.put("isGroupable", false);
		node.put("isResizable", false);
		return node;
	}

}
