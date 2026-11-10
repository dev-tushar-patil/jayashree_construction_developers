package com.jayashree.entity;

/** All fixed value sets, stored as their names in VARCHAR columns. */
public final class Enums {

    private Enums() {}

    public enum ProjectCategory { RESIDENTIAL, BUNGALOW, VILLA, COMMERCIAL, OTHER }

    public enum ProjectStatus { ONGOING, COMPLETED }

    public enum GalleryCategory { EXTERIOR, INTERIOR, BUNGALOW, RESIDENTIAL, ONGOING, COMPLETED }

    public enum ReviewStatus { PENDING, APPROVED, REJECTED }

    public enum ReviewSource { ADMIN, WEBSITE }

    public enum EnquiryType { CONTACT, QUOTE, PROJECT }

    public enum EnquiryStatus { NEW, CONTACTED, FOLLOW_UP, CONVERTED, CLOSED }

    public enum AdminRole { ADMIN }
}
