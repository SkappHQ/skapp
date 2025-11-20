package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.GuestUserOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestUserOtpDao extends JpaRepository<GuestUserOtp, Long> {

}
