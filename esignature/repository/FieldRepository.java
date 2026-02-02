package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldRepository extends JpaRepository<Field, Long> {

	List<Field> findByIdIn(List<Long> fieldIds);

	List<Field> findByRecipientAndTypeAndStatus(Recipient recipient, FieldType type, FieldStatus status);

	List<Field> findByFieldContainer_Id(Long fieldContainerId);

	List<Field> findByDocument_Id(Long documentId);

}
