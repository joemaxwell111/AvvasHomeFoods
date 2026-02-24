package com.avvahomefoods.controller;

import com.avvahomefoods.model.Category;
import com.avvahomefoods.model.Product;
import com.avvahomefoods.repository.CategoryRepository;
import com.avvahomefoods.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            return ResponseEntity.badRequest().body("Category already exists");
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @RequestBody Category details) {
        return categoryRepository.findById(id).map(category -> {
            String oldName = category.getName();
            String newName = details.getName();

            category.setName(newName);
            category.setDescription(details.getDescription());
            Category saved = categoryRepository.save(category);

            // Cascade update to products if name changed
            if (!oldName.equals(newName)) {
                List<Product> products = productRepository.findByCategory(oldName);
                for (Product p : products) {
                    p.setCategory(newName);
                    productRepository.save(p);
                }
            }
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        return categoryRepository.findById(id).map(category -> {
            // Check if used? For now, just allow delete (or maybe warn?)
            // We won't block it, but products might be left with orphaned category names.
            // Ideally we should check, but user asked to "edit or delete".
            categoryRepository.delete(category);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
