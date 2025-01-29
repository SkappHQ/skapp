package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipientDto {

	@NotNull(message = "{notnull.recipient.addressBookId}")
	private Long addressBookId;

	@NotNull(message = "{notnull.recipient.memberRole}")
	private MemberRole memberRole;

	@NotNull(message = "{notnull.recipient.status}")
	private RecipientStatus status;

	@NotNull(message = "{notnull.recipient.signingOrder}")
	@Min(value = 1, message = "{min.signingOrder}")
	private Integer signingOrder;

	@NotEmpty(message = "{not_empty.recipient.fields}")
	private List<FieldDto> fields;

}
