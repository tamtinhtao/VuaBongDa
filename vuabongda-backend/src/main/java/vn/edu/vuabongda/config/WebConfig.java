package vn.edu.vuabongda.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ================================
    // CHO PHEP TRUY CAP ANH UPLOAD
    // ================================
    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        String uploadPath = Paths
                .get("uploads")
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }

    // ================================
    // CORS CHO REACT FRONTEND
    // ================================
    @Override
    public void addCorsMappings(
            CorsRegistry registry
    ) {

        registry
                .addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173"
                )
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}