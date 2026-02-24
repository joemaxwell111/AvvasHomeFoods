package com.avvahomefoods.config;

import com.avvahomefoods.model.Product;
import com.avvahomefoods.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

        @Autowired
        private ProductRepository productRepository;

        @Override
        public void run(String... args) {
                if (productRepository.count() > 0) {
                        System.out.println("✅ Data already exists. Skipping seed.");
                        return;
                }

                List<Product> products = Arrays.asList(
                                createProduct("Sambar Powder",
                                                "Traditional homemade sambar powder made with freshly roasted spices. Perfect for authentic South Indian sambar with rich aroma and flavor.",
                                                149.0, "200g", "Masala Powders",
                                                "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
                                                4.8, 124, 149.0, 189.0, 369.0,
                                                "Premium spices, Sun-dried chilies, Stone-ground process."), // Spices
                                createProduct("Rasam Powder",
                                                "Aromatic rasam powder blended with black pepper, cumin, and coriander. Makes the perfect tangy and spicy rasam every time.",
                                                129.0, "200g", "Masala Powders",
                                                "https://images.unsplash.com/photo-1604543956799-d41ae5bd5cf5?w=600",
                                                4.9, 98, 129.0, 159.0, 319.0,
                                                "Black pepper, Cumin, Coriander, Traditional digestive herbs."), // Red
                                                                                                                 // powder
                                createProduct("Chicken Masala",
                                                "Fiery and flavorful chicken masala powder for restaurant-style chicken curry. A perfect blend of over 15 hand-picked spices.",
                                                179.0, "200g", "Masala Powders",
                                                "https://images.unsplash.com/photo-1626338782987-9b2c3227493a?w=600",
                                                4.7, 156, 179.0, 219.0, 429.0,
                                                "15+ Hand-picked spices, Natural extracts, No artificial colors."), // Curry
                                                                                                                    // powder
                                createProduct("Garam Masala",
                                                "Premium garam masala prepared with cinnamon, cardamom, cloves, and star anise. Adds warmth and depth to any dish.",
                                                159.0, "150g", "Masala Powders",
                                                "https://images.unsplash.com/photo-1557007558-8ee57754f923?w=600", 4.8,
                                                201, 159.0, 249.0, 489.0,
                                                "Cinnamon, Cardamom, Cloves, Star anise, Premium aromatic spice blend."), // Stick
                                                                                                                          // spices
                                createProduct("Fish Curry Powder",
                                                "Special fish curry masala with coastal spice blend. Creates the perfect tangy and spicy fish curry with authentic taste.",
                                                169.0, "200g", "Masala Powders",
                                                "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600",
                                                4.6, 87, 169.0, 209.0, 409.0,
                                                "Coastal spice blend, Tamarind extracts, Organic chili powder."), // Fish
                                                                                                                  // curry
                                                                                                                  // ingredients
                                createProduct("Turmeric Powder",
                                                "Pure and organic turmeric powder with high curcumin content. Bright golden color and earthy aroma. No additives or coloring.",
                                                99.0, "250g", "Pure Spices",
                                                "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600",
                                                4.9, 312, 99.0, 189.0, 359.0,
                                                "100% Organic turmeric, High curcumin content, No additives."), // Turmeric
                                createProduct("Red Chilli Powder",
                                                "Medium-hot red chilli powder made from Guntur chillies. Perfect balance of heat and color for everyday cooking.",
                                                119.0, "250g", "Pure Spices",
                                                "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600",
                                                4.7, 178, 119.0, 229.0, 449.0,
                                                "Guntur chillies, Traditional roasting, Natural bright red color."), // Chilli
                                createProduct("Coriander Powder",
                                                "Freshly ground coriander powder with a citrusy aroma. Essential for everyday Indian cooking. Stone-ground for best flavor.",
                                                89.0, "250g", "Pure Spices",
                                                "https://images.unsplash.com/photo-1599909533601-aa4ef8ec3a83?w=600",
                                                4.8, 145, 89.0, 169.0, 329.0,
                                                "Freshly ground coriander seeds, Citrus aroma preserved, Stone-ground."), // Coriander
                                                                                                                          // seeds/powder
                                createProduct("Biryani Masala",
                                                "Aromatic biryani masala with saffron notes. Perfect for Hyderabadi-style dum biryani. Made with 20+ premium whole spices.",
                                                199.0, "150g", "Special Blends",
                                                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
                                                4.9, 267, 199.0, 299.0, 589.0,
                                                "Saffron notes, 20+ Premium whole spices, Authentic Hyderabadi blend."), // Biryani
                                                                                                                         // spices
                                createProduct("Pav Bhaji Masala",
                                                "Mumbai-style pav bhaji masala for street-food flavor at home. Rich blend of spices for the perfect bhaji every time.",
                                                139.0, "200g", "Special Blends",
                                                "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600",
                                                4.7, 92, 139.0, 179.0, 349.0,
                                                "Street-food flavor blend, Hand-roasted spices, Rich aromatic base."), // Bowl
                                                                                                                       // of
                                                                                                                       // red
                                                                                                                       // curry
                                createProduct("Kulambu Chilli Powder",
                                                "Traditional Tamil Nadu style kulambu chilli powder. Perfect for making aromatic and flavorful kulambu and gravies.",
                                                139.0, "250g", "Masala Powders",
                                                "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
                                                4.8, 176, 139.0, 199.0, 389.0,
                                                "Traditional Tamil Nadu kulambu spices, Natural thickener, Rich flavor."), // Reusing
                                                                                                                           // spice
                                                                                                                           // mix
                                                                                                                           // that
                                                                                                                           // looks
                                                                                                                           // generic
                                createProduct("Pickle Masala",
                                                "Special masala blend for making traditional Indian pickles. Works great for mango, lemon, and mixed vegetable pickles.",
                                                109.0, "200g", "Special Blends",
                                                "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                                                4.6, 64, 109.0, 159.0, 309.0,
                                                "Traditional pickle spices, Mustard & Fenugreek blend, preservative-free.") // Curry/Pickle
                );

                List<Product> savedProducts = productRepository.saveAll(products);
                System.out.println("✅ Database seeded with " + savedProducts.size() + " products!");

                // Seed Reviews

        }

        private Product createProduct(String name, String desc, double price, String weight, String category,
                        String img, double rating, int reviews, double p200, double p500, double p1kg,
                        String ingredients) {
                Product p = new Product(name, desc, price, weight, category, img, true, 0.0, 0, ingredients);
                java.util.Map<String, Double> prices = new java.util.HashMap<>();
                // Logic to assign reasonable weight keys based on base weight
                // Assuming base is 200g or 250g, we add others
                if (weight.equals("150g")) {
                        prices.put("150g", price);
                        prices.put("250g", p500 * 0.6); // approx
                        prices.put("500g", p500);
                } else {
                        prices.put("200g", p200);
                        prices.put("500g", p500);
                        prices.put("1kg", p1kg);
                }
                p.setWeightPrices(prices);
                return p;
        }

}
