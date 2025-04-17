package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.EnvelopeSentSort;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class EnvelopeSentFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 6;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private EnvelopeSentSort sortKey;

	private String searchKeyword;

	private List<EnvelopeStatus> statusTypes;

	public EnvelopeSentSort getSortKey() {
		return sortKey != null ? sortKey : EnvelopeSentSort.CREATED_DATE;
	}

	public Sort.Direction getSortOrder() {
		return sortOrder != null ? sortOrder : Sort.Direction.ASC;
	}

}
