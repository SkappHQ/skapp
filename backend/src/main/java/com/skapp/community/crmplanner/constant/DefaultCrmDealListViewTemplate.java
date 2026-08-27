package com.skapp.community.crmplanner.constant;

import com.skapp.community.crmplanner.type.DefaultCrmDealListViewValues;

import lombok.experimental.UtilityClass;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.JsonNodeFactory;
import tools.jackson.databind.node.ObjectNode;

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
