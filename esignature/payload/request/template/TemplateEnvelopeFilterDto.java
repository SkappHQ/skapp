package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.TemplateEnvelopeSortKey;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class TemplateEnvelopeFilterDto {

	@Min(value = 0, message = "{validation.template.envelope.page.min}")
	private Integer page = 0;

	@Min(value = 0, message = "{validation.template.envelope.size.min}")
	private Integer size = 6;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private TemplateEnvelopeSortKey sortKey = TemplateEnvelopeSortKey.NAME;

	private String searchKeyword;

	private Boolean isExport = false;

}
