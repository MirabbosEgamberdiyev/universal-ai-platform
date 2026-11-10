package com.omniagent.modules.crm.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.crm.domain.Contact;
import com.omniagent.modules.crm.domain.Product;
import com.omniagent.modules.crm.service.CrmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm")
public class CrmController {

    private final CrmService crmService;

    public CrmController(CrmService crmService) {
        this.crmService = crmService;
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<Contact>> listContacts() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(crmService.listContacts(orgId));
    }

    @PostMapping("/contacts")
    public ResponseEntity<Contact> createContact(@RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String name = body.get("fullName");
        String email = body.get("email");
        String phone = body.get("phone");
        String stage = body.get("stage");
        String notes = body.get("notes");
        return ResponseEntity.ok(crmService.createContact(orgId, name, email, phone, stage, notes));
    }

    @PatchMapping("/contacts/{id}/stage")
    public ResponseEntity<Contact> updateStage(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String stage = body.get("stage");
        return ResponseEntity.ok(crmService.updateStage(orgId, id, stage));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> listProducts() {
        UUID orgId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(crmService.listProducts(orgId));
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Map<String, Object> body) {
        UUID orgId = TenantContext.getCurrentTenant();
        String name = (String) body.get("name");
        String sku = (String) body.get("sku");
        BigDecimal price = new BigDecimal(body.get("price").toString());
        String currency = (String) body.get("currency");
        String desc = (String) body.get("description");
        return ResponseEntity.ok(crmService.createProduct(orgId, name, sku, price, currency, desc));
    }
}
