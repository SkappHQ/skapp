package com.skapp.enterprise.people.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EpEmployeeRoleLimitDto {

	boolean leaveAdminLimitExceeded;

	boolean attendanceAdminLimitExceeded;

	boolean peopleAdminLimitExceeded;

	boolean esignAdminLimitExceeded;

	boolean leaveManagerLimitExceeded;

	boolean attendanceManagerLimitExceeded;

	boolean peopleManagerLimitExceeded;

	boolean superAdminLimitExceeded;

	boolean esignSenderLimitExceeded;

	boolean pmAdminLimitExceeded;

}
