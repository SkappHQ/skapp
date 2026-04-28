package com.skapp.community.peopleplanner.type;

/**
 * Represents the level of data access a user has when viewing an employee profile.
 */
public enum ViewAccessLevel {

	/**
	 * Full access to all employee data. Applies to Super Admin, People Admin, and People
	 * Manager roles.
	 */
	FULL_ACCESS,

	/**
	 * User viewing their own profile without People Admin/Manager role. All personal data
	 * is visible, but system permissions are hidden.
	 */
	SELF_WITHOUT_PERMISSIONS,

	/**
	 * Regular employee viewing another employee's profile. Sensitive personal,
	 * employment, and system permission details are hidden.
	 */
	RESTRICTED

}
