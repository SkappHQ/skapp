package com.skapp.community.crmplanner.activity.mapper;

import com.skapp.community.crmplanner.activity.payload.response.CrmActivityLinkResponseDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityPersonResponseDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.peopleplanner.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CrmActivityMapper {

	@Mapping(target = "canComplete", ignore = true)
	CrmActivityTaskResponseDto crmActivityTaskToCrmActivityTaskResponseDto(CrmActivityTask task);

	default CrmActivityPersonResponseDto employeeToPerson(Employee employee) {
		return employee == null ? null : new CrmActivityPersonResponseDto(employee.getEmployeeId(),
				employee.getFirstName(), employee.getLastName(), employee.getAuthPic());
	}

	default CrmActivityLinkResponseDto contactToLink(CrmContact contact) {
		return contact == null ? null : new CrmActivityLinkResponseDto(contact.getId(), contact.getName(),
				Boolean.TRUE.equals(contact.getIsDeleted()));
	}

	default CrmActivityLinkResponseDto dealToLink(CrmDeal deal) {
		return deal == null ? null : new CrmActivityLinkResponseDto(deal.getId(), deal.getName(),
				Boolean.TRUE.equals(deal.getIsDeleted()));
	}

	default CrmActivityLinkResponseDto companyToLink(CrmCompany company) {
		return company == null ? null : new CrmActivityLinkResponseDto(company.getId(), company.getName(),
				Boolean.TRUE.equals(company.getIsDeleted()));
	}

}
