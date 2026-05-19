package com.skapp.community.common.repository;

public interface WorkLocationGeofenceRepository {

	void deleteAllGeofences();

	void clearAddressesForGeofencedLocations();

}
