package com.skapp.enterprise.timeplanner.repository.impl;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.model.TimeRecord_;
import com.skapp.community.timeplanner.repository.TimeRecordRepositoryImpl;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;
import com.skapp.enterprise.timeplanner.model.TimeRecordLocation;
import com.skapp.enterprise.timeplanner.model.TimeRecordLocation_;
import com.skapp.enterprise.timeplanner.repository.projection.EpEmployeeTimeRecordImpl;
import com.skapp.enterprise.timeplanner.type.RecordLocationStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Selection;
import jakarta.persistence.criteria.Subquery;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Primary
public class EpTimeRecordRepositoryImpl extends TimeRecordRepositoryImpl {

	public EpTimeRecordRepositoryImpl(EntityManager entityManager) {
		super(entityManager);
	}

	@Override
	protected void addLocationStatusSelections(CriteriaBuilder cb, CriteriaQuery<Tuple> query,
			Root<TimeRecord> timeRecord, List<Selection<?>> selections) {
		selections.add(buildLocationStatusSubquery(cb, query, timeRecord, TimeRecordLocation_.clockInLocationStatus));
		selections.add(buildLocationStatusSubquery(cb, query, timeRecord, TimeRecordLocation_.clockOutLocationStatus));
	}

	private Subquery<RecordLocationStatus> buildLocationStatusSubquery(CriteriaBuilder cb, CriteriaQuery<Tuple> query,
			Root<TimeRecord> timeRecord,
			jakarta.persistence.metamodel.SingularAttribute<TimeRecordLocation, RecordLocationStatus> attribute) {
		Subquery<RecordLocationStatus> subquery = query.subquery(RecordLocationStatus.class);
		Root<TimeRecordLocation> locationRoot = subquery.from(TimeRecordLocation.class);
		subquery.select(locationRoot.get(attribute));
		subquery.where(cb.equal(locationRoot.get(TimeRecordLocation_.timeRecord).get(TimeRecord_.timeRecordId),
				timeRecord.get(TimeRecord_.timeRecordId)));
		return subquery;
	}

	@Override
	protected EmployeeTimeRecord buildTimeRecord(Tuple tuple) {
		RecordLocationStatus clockInStatus = tuple.get(6, RecordLocationStatus.class);
		RecordLocationStatus clockOutStatus = tuple.get(7, RecordLocationStatus.class);

		return new EpEmployeeTimeRecordImpl(tuple.get(0, Long.class), tuple.get(1, Long.class),
				tuple.get(2, LocalDate.class), tuple.get(3, Float.class), tuple.get(4, Float.class),
				tuple.get(5, String.class), clockInStatus, clockOutStatus);
	}

	@Override
	protected EmployeeTimeRecord buildEmptyTimeRecord(Long employeeId, LocalDate date) {
		return new EpEmployeeTimeRecordImpl(null, employeeId, date, 0.0f, 0.0f, null, null, null);
	}

}
