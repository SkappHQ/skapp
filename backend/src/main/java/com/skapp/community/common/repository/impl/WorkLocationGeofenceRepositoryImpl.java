package com.skapp.community.common.repository.impl;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.model.WorkLocation_;
import com.skapp.community.common.model.WorkLocationGeofence;
import com.skapp.community.common.model.WorkLocationGeofence_;
import com.skapp.community.common.repository.WorkLocationGeofenceRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaDelete;
import jakarta.persistence.criteria.CriteriaUpdate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class WorkLocationGeofenceRepositoryImpl implements WorkLocationGeofenceRepository {

	private final EntityManager entityManager;

	@Override
	public void deleteAllGeofences() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaDelete<WorkLocationGeofence> delete = cb.createCriteriaDelete(WorkLocationGeofence.class);
		delete.from(WorkLocationGeofence.class);
		entityManager.createQuery(delete).executeUpdate();
	}

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
