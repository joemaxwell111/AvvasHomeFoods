package com.avvahomefoods.controller;

import com.avvahomefoods.model.Product;
import com.avvahomefoods.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get products by category
    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productRepository.findByCategory(category);
    }

    // Search products by name
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    // Create a new product (admin)
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // Upload Image Endpoint
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            // Absolute path to frontend/images
            // Note: In diverse environments, relative paths are tricky.
            // Given the known structure: backend is at .../food/backend
            // We want .../food/frontend/images

            // Hardcoding based on the user's environment for reliability in this session
            // Dynamic path resolution
            String projectRoot = System.getProperty("user.dir"); // This lands in 'backend' usually
            // We need to go up one level to 'food' then to 'frontend/images'
            // But we must be careful about where the jar/cmd is run from.
            // Assuming run from 'backend' folder as per README instructions:
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(projectRoot).getParent().resolve("frontend")
                    .resolve("images");

            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String uploadDir = uploadPath.toString() + java.io.File.separator;

            // Generate unique filename to avoid collisions
            String originalFilename = file.getOriginalFilename();
            String extension = ".png"; // Default
            if (originalFilename != null && originalFilename.lastIndexOf(".") > 0) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String fileName = java.util.UUID.randomUUID().toString() + extension;
            java.nio.file.Path path = java.nio.file.Paths.get(uploadDir + fileName);

            java.nio.file.Files.write(path, file.getBytes());

            return ResponseEntity.ok("images/" + fileName);
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Image upload failed");
        }
    }

    // Update a product (admin)
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setWeight(productDetails.getWeight());
            product.setCategory(productDetails.getCategory());
            product.setImageUrl(productDetails.getImageUrl());
            product.setInStock(productDetails.isInStock());
            product.setRating(productDetails.getRating());
            product.setReviewCount(productDetails.getReviewCount());
            product.setWeightPrices(productDetails.getWeightPrices());
            return ResponseEntity.ok(productRepository.save(product));
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a product (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
