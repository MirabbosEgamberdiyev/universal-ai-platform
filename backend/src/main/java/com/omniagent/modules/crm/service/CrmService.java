package com.omniagent.modules.crm.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.crm.domain.Contact;
import com.omniagent.modules.crm.domain.Product;
import com.omniagent.modules.crm.repository.ContactRepository;
import com.omniagent.modules.crm.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class CrmService {

    private final ContactRepository contactRepository;
    private final ProductRepository productRepository;

    public CrmService(ContactRepository contactRepository, ProductRepository productRepository) {
        this.contactRepository = contactRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Contact createContact(UUID orgId, String name, String email, String phone, String stage, String notes) {
        Contact contact = new Contact();
        contact.setOrganizationId(orgId);
        contact.setFullName(name);
        contact.setEmail(email);
        contact.setPhone(phone);
        contact.setStage(stage != null ? stage : "LEAD");
        contact.setNotes(notes);
        return contactRepository.save(contact);
    }

    @Transactional(readOnly = true)
    public List<Contact> listContacts(UUID orgId) {
        return contactRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public Contact updateStage(UUID orgId, UUID contactId, String newStage) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (!contact.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        contact.setStage(newStage.toUpperCase());
        return contactRepository.save(contact);
    }

    @Transactional
    public Product createProduct(UUID orgId, String name, String sku, BigDecimal price, String currency, String desc) {
        Product product = new Product();
        product.setOrganizationId(orgId);
        product.setName(name);
        product.setSku(sku);
        product.setPrice(price);
        product.setCurrency(currency != null ? currency : "USD");
        product.setDescription(desc);
        product.setActive(true);
        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Product> listProducts(UUID orgId) {
        return productRepository.findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(orgId);
    }
}
