package com.skapp.community.timeplanner.payload.projection;

import java.time.LocalDate;

public interface EmployeeWorkHours {

	LocalDate getDate();

	Double getWorkedHours();

}
