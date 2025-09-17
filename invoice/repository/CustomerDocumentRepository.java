package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.CustomerDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerDocumentRepository extends JpaRepository<CustomerDocument, Long> {

    @Query("SELECT cd FROM CustomerDocument cd JOIN cd.customer c " +
           "WHERE (:customerId IS NULL OR cd.customer.id = :customerId) " +
           "AND (:name IS NULL OR LOWER(cd.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<CustomerDocument> findFilteredDocuments(@Param("customerId") Long customerId,
                                                  @Param("name") String name,
                                                  Pageable pageable);

    Page<CustomerDocument> findByCustomerId(Long customerId, Pageable pageable);

}
