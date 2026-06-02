package com.skapp.enterprise.timeplanner.repository.impl;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.model.WorkLocation_;
import com.skapp.enterprise.timeplanner.model.WorkLocationGeofence;
import com.skapp.enterprise.timeplanner.model.WorkLocationGeofence_;
import com.skapp.enterprise.timeplanner.repository.EpWorkLocationRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaUpdate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class EpWorkLocationRepositoryImpl implements EpWorkLocationRepository {

	private final EntityManager entityManager;

	@Override
	public void clearAddressesForGeofencedLocations() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaUpdate<WorkLocation> update = cb.createCriteriaUpdate(WorkLocation.class);
		Root<WorkLocation> root = update.from(WorkLocation.class);

		Subquery<Long> subquery = update.subquery(Long.class);
		Root<WorkLocationGeofence> geofenceRoot = subquery.from(WorkLocationGeofence.class);
		subquery.select(geofenceRoot.get(WorkLocationGeofence_.workLocation).get(WorkLocation_.workLocationId));

		update.set(root.get(WorkLocation_.address), (String) null);
		update.where(root.get(WorkLocation_.workLocationId).in(subquery));

		entityManager.createQuery(update).executeUpdate();
	}

}
