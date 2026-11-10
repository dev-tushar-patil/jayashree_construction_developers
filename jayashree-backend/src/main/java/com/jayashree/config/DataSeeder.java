package com.jayashree.config;

import com.jayashree.entity.AdminUser;
import com.jayashree.entity.Enums.GalleryCategory;
import com.jayashree.entity.Enums.ProjectCategory;
import com.jayashree.entity.Enums.ProjectStatus;
import com.jayashree.entity.Enums.ReviewSource;
import com.jayashree.entity.Enums.ReviewStatus;
import com.jayashree.entity.GalleryImage;
import com.jayashree.entity.Project;
import com.jayashree.entity.ProjectImage;
import com.jayashree.entity.Review;
import com.jayashree.entity.ServiceOffering;
import com.jayashree.entity.SiteContent;
import com.jayashree.repository.AdminUserRepository;
import com.jayashree.repository.GalleryImageRepository;
import com.jayashree.repository.ProjectRepository;
import com.jayashree.repository.ReviewRepository;
import com.jayashree.repository.ServiceOfferingRepository;
import com.jayashree.repository.SiteContentRepository;
import com.jayashree.util.Text;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Runs on every start and only ever fills empty tables:
 * <ul>
 *   <li>the first admin, from ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD (never hardcoded);</li>
 *   <li>the company's seven services (real content, editable);</li>
 *   <li>when SEED_SAMPLE_DATA=true, demo projects, gallery photos and reviews, flagged sample=true so the
 *       dashboard can remove them in one click before going live.</li>
 * </ul>
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AppProperties properties;
    private final AdminUserRepository admins;
    private final ServiceOfferingRepository services;
    private final ProjectRepository projects;
    private final GalleryImageRepository gallery;
    private final ReviewRepository reviews;
    private final PasswordEncoder encoder;
    private final SiteContentRepository markers;

    private static final String SERVICES_MARKER = "_system.servicesSeeded";
    private static final String SAMPLE_MARKER = "_system.sampleDataSeeded";

    public DataSeeder(AppProperties properties, AdminUserRepository admins, ServiceOfferingRepository services,
                      ProjectRepository projects, GalleryImageRepository gallery, ReviewRepository reviews,
                      PasswordEncoder encoder, SiteContentRepository markers) {
        this.properties = properties;
        this.admins = admins;
        this.services = services;
        this.projects = projects;
        this.gallery = gallery;
        this.reviews = reviews;
        this.encoder = encoder;
        this.markers = markers;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdmin();
        // Markers make each seed a one-time event: deleting the services or removing the sample content
        // from the dashboard must not bring them back on the next restart.
        if (!marked(SERVICES_MARKER)) {
            if (services.count() == 0) {
                seedServices();
            }
            mark(SERVICES_MARKER);
        }
        if (properties.seedSampleData() && !marked(SAMPLE_MARKER)) {
            if (projects.count() == 0) {
                seedProjects();
            }
            if (gallery.count() == 0) {
                seedGallery();
            }
            if (reviews.count() == 0) {
                seedReviews();
            }
            mark(SAMPLE_MARKER);
        }
    }

    private boolean marked(String key) {
        return markers.existsById(key);
    }

    private void mark(String key) {
        markers.save(new SiteContent(key, "system", "true"));
    }

    private void seedAdmin() {
        if (admins.count() > 0) {
            return;
        }
        AppProperties.Admin config = properties.admin();
        String email = Text.clean(config.email());
        String password = config.password();
        if (email == null || password == null || password.length() < 8) {
            log.warn("No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) and restart to create one.");
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername(Text.clean(config.username()) == null ? "admin" : config.username().strip());
        admin.setEmail(email);
        admin.setDisplayName("Administrator");
        admin.setPasswordHash(encoder.encode(password));
        admins.save(admin);
        log.info("Created the first admin account '{}' ({}).", admin.getUsername(), email);
    }

    private void seedServices() {
        service(0, "Residential Construction", "home", "/images/gallery/modern-villa.webp",
                "Custom homes designed for comfort, style and long-term value.",
                "We build independent homes from foundation to finishing, planned around your family, your plot and "
                        + "your budget. Every stage is supervised by our engineers, with quality materials and "
                        + "regular progress updates.",
                List.of("RCC framed structures", "Quality-tested materials", "Electrical and plumbing", "Interior finishing"));
        service(1, "Bungalow Construction", "bungalow", "/images/gallery/tiled-bungalow.webp",
                "Spacious, elegant bungalows with modern amenities and timeless design.",
                "From traditional tiled-roof bungalows to contemporary designs, we create spacious homes with "
                        + "verandas, gardens and the craftsmanship that makes a bungalow feel special.",
                List.of("Custom elevations", "Verandas and sit-outs", "Landscaping", "Vastu-friendly layouts"));
        service(2, "Villa Development", "villa", "/images/projects/card-2.webp",
                "Premium villas designed for peaceful and luxurious living.",
                "We develop premium villas and villa communities with considered planning, generous spaces, "
                        + "quality specifications and lasting value.",
                List.of("Premium specifications", "Private gardens", "Modern architecture", "Gated community planning"));
        service(3, "Project Development", "building", "/images/projects/card-3.webp",
                "End-to-end residential project planning, execution and delivery.",
                "We take residential projects from feasibility and design through approvals, construction and "
                        + "handover, managing every contractor and milestone along the way.",
                List.of("Feasibility and planning", "Approvals and permissions", "Construction management", "Handover"));
        service(4, "Construction Services", "crane", "/images/services/scaffold.webp",
                "High-quality construction with skilled execution and timely delivery.",
                "Contract construction services for owners who already have plans: structure, masonry, finishing "
                        + "and services, delivered by experienced site teams.",
                List.of("Structural work", "Masonry and plaster", "Waterproofing", "Site supervision"));
        service(5, "Architectural Planning", "blueprint", "/images/services/blueprint.webp",
                "Functional, aesthetic and site-optimised home designs.",
                "Our planning team turns your requirements into practical floor plans, elevations and working "
                        + "drawings that make the most of your plot.",
                List.of("Floor plans", "3D elevations", "Structural design coordination", "Working drawings"));
        service(6, "Land Development", "land", "/images/services/land.webp",
                "Land acquisition support, layout planning and development for residential spaces.",
                "We help plan and develop land for residential use, from layout design and roads to utilities and "
                        + "plot demarcation.",
                List.of("Layout planning", "Roads and drainage", "Utilities", "Plot demarcation"));
        log.info("Added the seven company services.");
    }

    private void service(int order, String title, String icon, String image, String shortDescription,
                         String description, List<String> features) {
        ServiceOffering s = new ServiceOffering();
        s.setSlug(Text.slugify(title));
        s.setTitle(title);
        s.setIcon(icon);
        s.setImageUrl(image);
        s.setShortDescription(shortDescription);
        s.setDescription(description);
        s.setFeatures(new ArrayList<>(features));
        s.setSortOrder(order);
        s.setPublished(true);
        services.save(s);
    }

    private void seedProjects() {
        project("Shantivan Bungalows", ProjectCategory.BUNGALOW, ProjectStatus.COMPLETED, "Shahupuri, Satara", true,
                "Premium bungalows with modern comforts and classic aesthetics.",
                "Shantivan is a collection of tiled-roof bungalows that pair classic Maharashtrian character with "
                        + "modern comfort. Wide verandas, landscaped gardens and warm timber details make every home "
                        + "feel welcoming.",
                LocalDate.of(2023, 6, 1), LocalDate.of(2024, 11, 30),
                List.of("3 BHK bungalows", "Landscaped garden", "Covered parking", "Vastu-friendly planning"),
                "/images/gallery/tiled-bungalow.webp", "/images/projects/card-1.webp",
                "/images/gallery/veranda-swing.webp", "/images/gallery/living-room.webp");
        project("Jayashree Villa Homes", ProjectCategory.VILLA, ProjectStatus.COMPLETED, "Satara", true,
                "Premium residential villa development.",
                "Contemporary villas designed for peaceful and luxurious living, with open-plan interiors, large "
                        + "glazing and private outdoor spaces.",
                LocalDate.of(2022, 9, 1), LocalDate.of(2024, 3, 31),
                List.of("4 BHK villas", "Private terrace", "Modular kitchen", "24x7 water supply"),
                "/images/gallery/modern-villa.webp", "/images/projects/card-2.webp",
                "/images/gallery/lounge.webp", "/images/gallery/bedroom.webp");
        project("Sahyadri Residences", ProjectCategory.RESIDENTIAL, ProjectStatus.ONGOING, "Karad", true,
                "Well-planned residential homes for modern families.",
                "Sahyadri Residences brings well-planned homes for growing families, with efficient layouts, good "
                        + "ventilation and quality finishes.",
                LocalDate.of(2025, 4, 1), null,
                List.of("2 & 3 BHK homes", "Earthquake-resistant structure", "Rainwater harvesting"),
                "/images/projects/card-3.webp", "/images/gallery/stone-facade.webp", "/images/gallery/dining.webp");
        project("Maitri Bungalows", ProjectCategory.BUNGALOW, ProjectStatus.ONGOING, "Wai", false,
                "Spacious homes surrounded by nature and tranquillity.",
                "Set among greenery near Wai, Maitri Bungalows offers spacious homes with gardens and calm, open "
                        + "surroundings.",
                LocalDate.of(2025, 8, 1), null,
                List.of("Garden plots", "Stone-clad elevations", "Solar water heating"),
                "/images/projects/card-4.webp", "/images/gallery/garden-bungalow.webp", "/images/gallery/wall-niche.webp");
        project("Vastu Homes", ProjectCategory.RESIDENTIAL, ProjectStatus.COMPLETED, "Koregaon, Satara", false,
                "Thoughtfully designed homes with traditional warmth and modern amenities.",
                "Vastu Homes are planned on Vastu principles with traditional warmth and modern amenities.",
                LocalDate.of(2022, 1, 1), LocalDate.of(2023, 5, 31),
                List.of("Vastu-compliant layouts", "Courtyard planning", "Quality fittings"),
                "/images/gallery/courtyard-home.webp", "/images/projects/card-5.webp");
        project("Green Valley Villas", ProjectCategory.VILLA, ProjectStatus.ONGOING, "Satara", false,
                "A premium villa project with nature, space and a better lifestyle.",
                "Green Valley Villas is a premium villa project with open green spaces and contemporary architecture.",
                LocalDate.of(2025, 10, 1), null,
                List.of("Villa plots", "Clubhouse", "Internal roads and street lighting"),
                "/images/projects/card-6.webp", "/images/hero/projects.webp");
        log.info("Added sample projects (remove them from the admin dashboard before going live).");
    }

    private void project(String name, ProjectCategory category, ProjectStatus status, String location, boolean featured,
                         String shortDescription, String description, LocalDate start, LocalDate end,
                         List<String> features, String... images) {
        Project p = new Project();
        p.setName(name);
        p.setSlug(Text.slugify(name));
        p.setCategory(category);
        p.setStatus(status);
        p.setLocation(location);
        p.setMapsUrl("https://www.google.com/maps/search/?api=1&query=" + location.replace(" ", "+").replace(",", "%2C"));
        p.setShortDescription(shortDescription);
        p.setDescription(description);
        p.setStartDate(start);
        p.setCompletionDate(end);
        p.setFeatures(new ArrayList<>(features));
        p.setFeatured(featured);
        p.setPublished(true);
        p.setSample(true);
        for (int i = 0; i < images.length; i++) {
            ProjectImage image = new ProjectImage();
            image.setProject(p);
            image.setUrl(images[i]);
            image.setThumbUrl(images[i]);
            image.setSortOrder(i);
            image.setCover(i == 0);
            p.getImages().add(image);
        }
        projects.save(p);
    }

    private void seedGallery() {
        Object[][] items = {
                {"Tiled-roof Bungalow", GalleryCategory.BUNGALOW, "/images/gallery/tiled-bungalow.webp", true},
                {"Warm Living Room", GalleryCategory.INTERIOR, "/images/gallery/living-room.webp", true},
                {"Family Dining", GalleryCategory.INTERIOR, "/images/gallery/dining.webp", false},
                {"Contemporary Villa", GalleryCategory.EXTERIOR, "/images/gallery/modern-villa.webp", true},
                {"Veranda Sit-out", GalleryCategory.EXTERIOR, "/images/gallery/veranda-swing.webp", false},
                {"Lounge", GalleryCategory.INTERIOR, "/images/gallery/lounge.webp", false},
                {"Master Bedroom", GalleryCategory.INTERIOR, "/images/gallery/bedroom.webp", false},
                {"Garden Bungalow", GalleryCategory.BUNGALOW, "/images/gallery/garden-bungalow.webp", false},
                {"Courtyard Home", GalleryCategory.RESIDENTIAL, "/images/gallery/courtyard-home.webp", false},
                {"Stone Facade", GalleryCategory.EXTERIOR, "/images/gallery/stone-facade.webp", false},
                {"Wall Niche Detail", GalleryCategory.EXTERIOR, "/images/gallery/wall-niche.webp", false},
                {"Residential Home", GalleryCategory.RESIDENTIAL, "/images/projects/card-1.webp", false},
                {"Sahyadri Residences", GalleryCategory.COMPLETED, "/images/projects/card-3.webp", false},
                {"Vastu Homes", GalleryCategory.COMPLETED, "/images/projects/card-5.webp", false},
                {"Maitri Bungalows (in progress)", GalleryCategory.ONGOING, "/images/projects/card-4.webp", false},
                {"Green Valley Villas (in progress)", GalleryCategory.ONGOING, "/images/projects/card-6.webp", false},
        };
        int order = 0;
        for (Object[] item : items) {
            GalleryImage g = new GalleryImage();
            g.setTitle((String) item[0]);
            g.setCategory((GalleryCategory) item[1]);
            g.setUrl((String) item[2]);
            g.setThumbUrl((String) item[2]);
            g.setFeatured((Boolean) item[3]);
            g.setPublished(true);
            g.setSortOrder(order++);
            g.setSample(true);
            gallery.save(g);
        }
        log.info("Added sample gallery photos.");
    }

    private void seedReviews() {
        review("Rahul Jadhav", 5, "Shantivan Bungalows", LocalDate.of(2025, 1, 12), true,
                "The team kept us informed at every stage and handed over our bungalow on time. The quality of work "
                        + "is excellent.");
        review("Snehal Pawar", 5, "Jayashree Villa Homes", LocalDate.of(2024, 5, 3), true,
                "Transparent pricing, good materials and a very cooperative site team. We are very happy with our villa.");
        review("Amit Deshmukh", 4, "Vastu Homes", LocalDate.of(2023, 8, 21), true,
                "Thoughtful planning and neat finishing. Small changes we asked for during construction were handled well.");
        review("Priya Shinde", 5, null, LocalDate.of(2025, 6, 15), false,
                "They helped us with planning and approvals for our plot and explained everything clearly.");
        log.info("Added sample reviews (remove them from the admin dashboard before going live).");
    }

    private void review(String name, int rating, String projectSlugName, LocalDate date, boolean featured, String text) {
        Review r = new Review();
        r.setCustomerName(name);
        r.setRating(rating);
        r.setContent(text);
        r.setReviewDate(date);
        r.setStatus(ReviewStatus.APPROVED);
        r.setSource(ReviewSource.ADMIN);
        r.setFeatured(featured);
        r.setVisible(true);
        r.setSample(true);
        if (projectSlugName != null) {
            projects.findBySlug(Text.slugify(projectSlugName)).ifPresent(p -> {
                r.setProject(p);
                r.setProjectName(p.getName());
            });
        }
        reviews.save(r);
    }
}
