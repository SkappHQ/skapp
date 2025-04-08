package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.EnvelopeInboxSort;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class EnvelopeInboxFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 7;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private EnvelopeInboxSort sortKey = EnvelopeInboxSort.RECEIVED_DATE;

	private String searchKeyword;

	private List<RecipientStatus> statusTypes;

	public EnvelopeInboxSort getSortKey() {
		return sortKey != null ? sortKey : EnvelopeInboxSort.RECEIVED_DATE;
	}

	public Sort.Direction getSortOrder() {
		return sortOrder != null ? sortOrder : Sort.Direction.ASC;
	}

}
