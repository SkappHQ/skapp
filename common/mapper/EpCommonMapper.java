package com.skapp.enterprise.common.mapper;

import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.enterprise.common.model.DeviceToken;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.model.OrganizationCalendar;
import com.skapp.enterprise.common.model.SupportRequest;
import com.skapp.enterprise.common.model.SupportRequestAttachment;
import com.skapp.enterprise.common.model.master.SuperAdmin;
import com.skapp.enterprise.common.payload.redis.EpRedisUserDto;
import com.skapp.enterprise.common.payload.request.ApplySupportRequestDto;
import com.skapp.enterprise.common.payload.request.EpOrganizationDto;
import com.skapp.enterprise.common.payload.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.payload.response.ApplySupportResponseDto;
import com.skapp.enterprise.common.payload.response.DeviceTokenResponseDto;
import com.skapp.enterprise.common.payload.response.EpCalendarConfigResponseDto;
import com.skapp.enterprise.common.payload.response.EpJobResponseDto;
import com.skapp.enterprise.common.payload.response.EpOrganizationResponseDto;
import com.skapp.enterprise.common.payload.response.SupportRequestAttachmentDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EpCommonMapper {

	EpOrganization epOrganizationDtoToEPOrganization(EpOrganizationDto organizationDto);

	EpOrganizationResponseDto epOrganizationToEpOrganizationResponseDto(EpOrganization epOrganization);

	SuperAdmin createSuperAdminRequestDtoToSuperAdmin(SuperAdminSignUpRequestDto superAdminSignUpRequestDto);

	SuperAdmin createEpGoogleDataDtoToSuperAdmin(EpSignUpGoogleDataDto epSignUpGoogleDataDto);

	DeviceTokenResponseDto deviceTokenToDeviceTokenResponse(DeviceToken deviceToken);

	EpCalendarConfigResponseDto organizationCalendarToEpCalendarConfigResponseDto(
			OrganizationCalendar organizationCalendar);

	@Mapping(target = "userId", source = "employee.user.userId")
	@Mapping(target = "email", source = "employee.user.email")
	EpRedisUserDto employeeToEpRedisEmployeeDto(Employee employee);

	@Mapping(target = "attachments", ignore = true)
	SupportRequest applySupportRequestDtoToSupportRequest(ApplySupportRequestDto applySupportRequestDto);

	ApplySupportResponseDto supportRequestToApplySupportResponseDto(SupportRequest supportRequest);

	SupportRequestAttachmentDto supportRequestAttachmentToSupportRequestAttachmentDto(
			SupportRequestAttachment supportRequestAttachment);

	List<EpJobResponseDto> jobFamilyListToEpJobResponseDtoList(List<JobFamily> jobFamilies);

}
