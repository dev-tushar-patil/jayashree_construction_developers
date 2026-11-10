package com.jayashree.service.storage;

/**
 * Where uploaded files live. The database keeps only the public URL this returns, so moving to cloud storage
 * (S3, Cloudinary, Azure Blob...) means adding one implementation of this interface and setting STORAGE_TYPE.
 */
public interface StorageService {

    /** Saves the bytes under a new random name and returns the URL browsers should use. */
    String save(byte[] content, String extension);

    /** Removes a file this storage created. URLs it does not own (e.g. bundled /images/...) are ignored. */
    void delete(String url);
}
