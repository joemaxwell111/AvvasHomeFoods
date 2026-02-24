package com.avvahomefoods.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
public class Product {

    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private String weight;
    private String category;
    private String imageUrl;
    private boolean inStock;
    private double rating;
    private int reviewCount;
    private String ingredients;
    private java.util.Map<String, Double> weightPrices;

    public java.util.Map<String, Double> getWeightPrices() {
        return weightPrices;
    }

    public void setWeightPrices(java.util.Map<String, Double> weightPrices) {
        this.weightPrices = weightPrices;
    }

    public Product() {
    }

    public Product(String name, String description, double price, String weight,
            String category, String imageUrl, boolean inStock, double rating, int reviewCount, String ingredients) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.weight = weight;
        this.category = category;
        this.imageUrl = imageUrl;
        this.inStock = inStock;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.ingredients = ingredients;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }
}
