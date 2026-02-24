package com.avvahomefoods.controller;

import com.avvahomefoods.model.Review;
import com.avvahomefoods.repository.ProductRepository;
import com.avvahomefoods.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/{productId}")
    public List<Review> getReviewsByProductId(@PathVariable String productId) {
        return reviewRepository.findByProductId(productId);
    }

    @PostMapping
    public Review addReview(@RequestBody Review review) {
        review.setCreatedAt(java.time.LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);

        // Recalculate average rating for the product
        String productId = review.getProductId();
        List<Review> productReviews = reviewRepository.findByProductId(productId);

        double avgRating = productReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        int reviewCount = productReviews.size();

        // Update product model
        productRepository.findById(productId).ifPresent(product -> {
            product.setRating(Math.round(avgRating * 10.0) / 10.0); // Round to 1 decimal place
            product.setReviewCount(reviewCount);
            productRepository.save(product);
        });

        return savedReview;
    }
}
