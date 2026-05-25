package com.skapp.enterprise.timeplanner.repository.projection;

import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;
import com.skapp.enterprise.timeplanner.type.RecordLocationStatus;

public interface EpEmployeeTimeRecord extends EmployeeTimeRecord {

	RecordLocationStatus getClockInLocationStatus();

	RecordLocationStatus getClockOutLocationStatus();

}
