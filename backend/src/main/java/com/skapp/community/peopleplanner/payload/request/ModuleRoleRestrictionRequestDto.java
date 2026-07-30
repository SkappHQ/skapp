package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.RoleLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Schema(description = "Data transfer object for restricting role assignments in a specific module.")
public class ModuleRoleRestrictionRequestDto {

	@Schema(description = "The module to which the role restriction is applied.", example = "ATTENDANCE")
	private ModuleType module;

	@Schema(description = "Role levels to restrict for the specified module. Applied after 'remove'.",
			example = "[\"ADMIN\"]")
	private List<RoleLevel> add;

	@Schema(description = "Role levels to stop restricting for the specified module. Applied before 'add'.",
			example = "[\"MANAGER\"]")
	private List<RoleLevel> remove;

	/**
	 * @deprecated superseded by {@link #add} / {@link #remove}. Honoured as a full
	 * replacement only when both delta lists are absent, so a client that has not moved
	 * to the delta payload keeps working. Removed once the legacy table is dropped.
	 */
	@Deprecated(forRemoval = true)
	@Schema(description = "Flag indicating whether the Admin role is restricted for the specified module.",
			example = "true", deprecated = true)
	private Boolean isAdmin;

	/**
	 * @deprecated superseded by {@link #add} / {@link #remove}. Honoured as a full
	 * replacement only when both delta lists are absent, so a client that has not moved
	 * to the delta payload keeps working. Removed once the legacy table is dropped.
	 */
	@Deprecated(forRemoval = true)
	@Schema(description = "Flag indicating whether the Manager role is restricted for the specified module.",
			example = "false", deprecated = true)
	private Boolean isManager;

	/**
	 * @deprecated superseded by {@link #add} / {@link #remove}. Honoured as a full
	 * replacement only when both delta lists are absent, so a client that has not moved
	 * to the delta payload keeps working. Removed once the legacy table is dropped.
	 */
	@Deprecated(forRemoval = true)
	@Schema(description = "List of restricted role levels for the specified module.",
			example = "[\"ADMIN\", \"MANAGER\"]", deprecated = true)
	private List<RoleLevel> restrictions;

}
