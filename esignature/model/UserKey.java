package com.skapp.enterprise.esignature.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "es_user_key")
@Data
public class UserKey {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne
	@JoinColumn(name = "address_book_id")
	private AddressBook addressBook;

	@Lob
	@Column(name = "private_key")
	private String privateKey;

	@Lob
	@Column(name = "public_key")
	private String publicKey;

	@Lob
	private String certificate;

	@Column(name = "vector", length = 32) // Store IV as Base64
	private String vector;

}
