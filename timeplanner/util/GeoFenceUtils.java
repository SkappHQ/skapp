package com.skapp.enterprise.timeplanner.util;

import com.skapp.enterprise.timeplanner.constant.EpTimeConstants;

public final class GeoFenceUtils {

	public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
		double dLat = Math.toRadians(lat2 - lat1);
		double dLon = Math.toRadians(lon2 - lon1);

		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Math.toRadians(lat1))
				* Math.cos(Math.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return EpTimeConstants.EARTH_RADIUS_METERS * c;
	}

	public static boolean isWithinGeofence(double userLat, double userLon, double fenceLat, double fenceLon,
			int radiusMeters) {
		double distance = calculateHaversineDistance(userLat, userLon, fenceLat, fenceLon);
		return distance <= radiusMeters;
	}

}
