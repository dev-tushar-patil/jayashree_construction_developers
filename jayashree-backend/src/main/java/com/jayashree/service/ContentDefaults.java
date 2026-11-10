package com.jayashree.service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Every editable content key, its admin section and its starting value. A key only reaches the database once
 * the admin saves it; until then the value here is served. Adding a key here makes it editable at once.
 * <p>
 * Keys ending in "Json" hold a JSON array of {title, text} items, edited as a list in the admin panel.
 * In titles, words wrapped in *asterisks* are shown in the orange italic accent style.
 */
public final class ContentDefaults {

    public record Entry(String section, String value, Kind kind) {}

    public enum Kind { TEXT, URL, PHONE, EMAIL, IMAGE, JSON_LIST }

    public static final Map<String, Entry> ENTRIES;

    static {
        Map<String, Entry> m = new LinkedHashMap<>();

        // --- Company ---------------------------------------------------------------------------
        put(m, "company.name", "company", "Jayashree Construction & Developers");
        put(m, "company.shortName", "company", "Jayashree");
        put(m, "company.tagline", "company", "Building Dreams. Creating Lasting Foundations.");
        put(m, "company.intro", "company",
                "Jayashree Construction & Developers is a Satara-based construction and real estate development company, "
                        + "delivering quality homes, bungalows and villas built on trust, transparency and commitment.");

        // --- Home page -------------------------------------------------------------------------
        put(m, "home.heroTitle", "home", "Building Dreams. *Creating Lasting Foundations.*");
        put(m, "home.heroSubtitle", "home",
                "From thoughtfully designed homes to quality construction, Jayashree Construction & Developers brings "
                        + "your dream spaces to life with trust, quality and commitment.");
        image(m, "home.heroImage", "home", "/images/hero/home.webp");
        put(m, "home.aboutTitle", "home", "Building with Trust, Growing with *Excellence*");
        put(m, "home.aboutText", "home",
                "Jayashree Construction & Developers is committed to delivering quality construction and thoughtfully "
                        + "designed spaces. We believe every project is more than just a structure — it is a foundation "
                        + "for dreams, relationships and a better future.");
        image(m, "home.aboutImage", "home", "/images/hero/about.webp");
        put(m, "home.ctaTitle", "home", "Let's Build Your Dream Home Together");
        put(m, "home.ctaText", "home",
                "Tell us about your plot and your plans. Our team will get in touch with a customised solution.");
        json(m, "home.whyChooseJson", "home", """
                [{"title":"Quality Construction","text":"Tested materials, skilled workmanship and strict site supervision at every stage."},
                 {"title":"Transparent Process","text":"Clear estimates, honest communication and regular progress updates."},
                 {"title":"Experienced Team","text":"Engineers, planners and site teams who have built across Satara."},
                 {"title":"Timely Delivery","text":"Realistic schedules, planned resources and on-time handover."},
                 {"title":"Customer Satisfaction","text":"Homes designed around your needs, with support after handover."},
                 {"title":"Attention to Detail","text":"From foundations to finishing, every detail is checked and cared for."}]""");

        // --- Statistics (homepage and About page) ---------------------------------------------
        put(m, "stats.1.value", "stats", "60+");
        put(m, "stats.1.label", "stats", "Sites Across Satara");
        put(m, "stats.2.value", "stats", "");
        put(m, "stats.2.label", "stats", "Quality Construction");
        put(m, "stats.3.value", "stats", "");
        put(m, "stats.3.label", "stats", "Experienced Team");
        put(m, "stats.4.value", "stats", "");
        put(m, "stats.4.label", "stats", "Customer Satisfaction");

        // --- About page ------------------------------------------------------------------------
        put(m, "about.heroTitle", "about", "A Legacy of Building Homes with *Trust*");
        put(m, "about.heroText", "about",
                "Quality construction, thoughtful design and lasting relationships — the foundations of every "
                        + "Jayashree home.");
        image(m, "about.heroImage", "about", "/images/hero/about.webp");
        put(m, "about.introTitle", "about", "Who We Are");
        put(m, "about.intro", "about",
                "Jayashree Construction & Developers is a construction and real estate development company based in "
                        + "Satara, Maharashtra. We build residential homes, bungalows and villas, and take projects "
                        + "from planning and approvals through construction to handover.");
        put(m, "about.storyTitle", "about", "The Jayashree Journey");
        put(m, "about.story", "about",
                "Jayashree Construction & Developers was founded with a simple vision — to create strong, beautiful "
                        + "and lasting homes for families. Over the years, we have grown with the trust and support of "
                        + "our clients, delivering spaces that combine quality construction, thoughtful design and the "
                        + "warmth of a true home.");
        image(m, "about.storyImage", "about", "/images/about/lantern.webp");
        put(m, "about.vision", "about",
                "To be a trusted and preferred construction brand known for quality, innovation and customer satisfaction.");
        put(m, "about.mission", "about",
                "To design and build homes and spaces that are safe, durable, aesthetically pleasing and add lasting "
                        + "value to our clients' lives.");
        image(m, "about.valuesImage", "about", "/images/about/living.webp");
        json(m, "about.valuesJson", "about", """
                [{"title":"Trust","text":"Long-lasting relationships built on honesty."},
                 {"title":"Quality","text":"Best materials and careful workmanship."},
                 {"title":"Transparency","text":"Clear process and honest communication."},
                 {"title":"Customer Centric","text":"Homes designed around your needs."}]""");

        // --- Contact information ---------------------------------------------------------------
        put(m, "contact.person", "contact", "Gaurav Gaikwad");
        phone(m, "contact.phone1", "7558298818");
        phone(m, "contact.phone2", "97626288187");
        phone(m, "contact.whatsapp", "917558298818");
        email(m, "contact.email", "");
        put(m, "contact.address", "contact", "Satara, Maharashtra, India");
        put(m, "contact.hours", "contact", "Monday – Saturday: 9:00 AM to 7:00 PM\nSunday: By appointment");
        url(m, "contact.mapsUrl", "contact", "https://www.google.com/maps/search/?api=1&query=Satara%2C+Maharashtra");
        put(m, "contact.mapQuery", "contact", "Satara, Maharashtra, India");
        put(m, "contact.whatsappMessage", "contact",
                "Hello Jayashree Construction & Developers, I am interested in your construction services. "
                        + "Please share more information.");

        // --- Social media ----------------------------------------------------------------------
        url(m, "social.facebook", "social", "");
        url(m, "social.instagram", "social", "");
        url(m, "social.youtube", "social", "");
        url(m, "social.linkedin", "social", "");

        // --- Footer and SEO --------------------------------------------------------------------
        put(m, "footer.text", "footer", "Quality Construction | Timely Delivery | Lasting Relationships");
        put(m, "footer.copyright", "footer", "All rights reserved.");
        put(m, "seo.title", "seo", "Jayashree Construction & Developers | Homes, Bungalows & Villas in Satara");
        put(m, "seo.description", "seo",
                "Jayashree Construction & Developers, Satara: residential construction, bungalows, villas, "
                        + "architectural planning and land development, built with quality and trust.");

        ENTRIES = Collections.unmodifiableMap(m);
    }

    private ContentDefaults() {}

    private static void put(Map<String, Entry> m, String key, String section, String value) {
        m.put(key, new Entry(section, value, Kind.TEXT));
    }

    private static void image(Map<String, Entry> m, String key, String section, String value) {
        m.put(key, new Entry(section, value, Kind.IMAGE));
    }

    private static void url(Map<String, Entry> m, String key, String section, String value) {
        m.put(key, new Entry(section, value, Kind.URL));
    }

    private static void phone(Map<String, Entry> m, String key, String value) {
        m.put(key, new Entry("contact", value, Kind.PHONE));
    }

    private static void email(Map<String, Entry> m, String key, String value) {
        m.put(key, new Entry("contact", value, Kind.EMAIL));
    }

    private static void json(Map<String, Entry> m, String key, String section, String value) {
        m.put(key, new Entry(section, value.replaceAll("\\s*\\n\\s*", ""), Kind.JSON_LIST));
    }
}
