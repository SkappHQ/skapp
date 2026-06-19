package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.type.BulkItemStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeBulkResponseDto {

	private String email;

	private BulkItemStatus status;

	private String message;

	@JsonIgnore
	private String tempPassword;

}
