package com.skapp.community.crmplanner.payload.request;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class CrmContactCreateRequestDtoTest {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Test
	@DisplayName("String fields with leading/trailing spaces are trimmed by deserializer")
	void deserialize_StringFieldsWithSpaces_Trimmed() throws Exception {
		String json = """
				{
					"name": "  John Doe  ",
					"email": "  john@example.com  ",
					"contactNumber": "  9876543210  ",
					"companyId": 1,
					"ownerId": 2
				}
				""";

		CrmContactCreateRequestDto dto = objectMapper.readValue(json, CrmContactCreateRequestDto.class);

		// String fields with @JsonDeserialize annotation should be trimmed
		assertEquals("John Doe", dto.getName());
		assertEquals("john@example.com", dto.getEmail());
		assertEquals("9876543210", dto.getContactNumber());

		// Non-string fields unaffected
		assertEquals(1L, dto.getCompanyId());
		assertEquals(2L, dto.getOwnerId());
	}

	@Test
	@DisplayName("String fields without spaces remain unchanged")
	void deserialize_StringFieldsWithoutSpaces_Unchanged() throws Exception {
		String json = """
				{
					"name": "Jane Smith",
					"email": "jane@example.com",
					"contactNumber": "1234567890",
					"companyId": 1,
					"ownerId": 2
				}
				""";

		CrmContactCreateRequestDto dto = objectMapper.readValue(json, CrmContactCreateRequestDto.class);

		assertEquals("Jane Smith", dto.getName());
		assertEquals("jane@example.com", dto.getEmail());
		assertEquals("1234567890", dto.getContactNumber());
	}

	@Test
	@DisplayName("Empty/whitespace-only strings become empty after trimming")
	void deserialize_WhitespaceOnlyString_BecomesEmpty() throws Exception {
		String json = """
				{
					"name": "   ",
					"email": "   ",
					"contactNumber": "   ",
					"companyId": 1,
					"ownerId": 2
				}
				""";

		CrmContactCreateRequestDto dto = objectMapper.readValue(json, CrmContactCreateRequestDto.class);

		assertEquals("", dto.getName());
		assertEquals("", dto.getEmail());
		assertEquals("", dto.getContactNumber());
	}

	@Test
	@DisplayName("Null values remain null")
	void deserialize_NullValues_RemainNull() throws Exception {
		String json = """
				{
					"name": "John",
					"email": "john@example.com",
					"contactNumber": null,
					"companyId": 1,
					"ownerId": 2
				}
				""";

		CrmContactCreateRequestDto dto = objectMapper.readValue(json, CrmContactCreateRequestDto.class);

		assertEquals("John", dto.getName());
		assertEquals("john@example.com", dto.getEmail());
		assertNull(dto.getContactNumber());
	}

	@Test
	@DisplayName("Internal spaces are preserved, only leading/trailing trimmed")
	void deserialize_InternalSpaces_Preserved() throws Exception {
		String json = """
				{
					"name": "  John  Q  Doe  ",
					"email": "  john.q.doe@example.com  ",
					"contactNumber": "  +1 987 654 3210  ",
					"companyId": 1,
					"ownerId": 2
				}
				""";

		CrmContactCreateRequestDto dto = objectMapper.readValue(json, CrmContactCreateRequestDto.class);

		// Internal spaces preserved, only leading/trailing removed
		assertEquals("John  Q  Doe", dto.getName());
		assertEquals("john.q.doe@example.com", dto.getEmail());
		assertEquals("+1 987 654 3210", dto.getContactNumber());
	}

}
