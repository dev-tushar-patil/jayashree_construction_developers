package com.jayashree.service;

import com.jayashree.config.AppProperties;
import com.jayashree.exception.ApiException;
import com.jayashree.service.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Iterator;

/**
 * Validates and optimises uploaded photos.
 * <ul>
 *   <li>The type is decided from the file's leading bytes, never its name, so HTML or SVG renamed .jpg is refused.</li>
 *   <li>JPEG and PNG are decoded, turned upright from their EXIF orientation, shrunk to a display size and
 *       re-encoded as JPEG (which also drops EXIF data such as GPS location), plus a small thumbnail.</li>
 *   <li>WebP cannot be decoded by the JDK, so it is kept as uploaded. The admin panel already compresses photos
 *       in the browser before sending them.</li>
 * </ul>
 */
@Service
public class ImageService {

    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    public record StoredImage(String url, String thumbUrl, Integer width, Integer height) {}

    private final StorageService storage;
    private final AppProperties.Images config;

    public ImageService(StorageService storage, AppProperties properties) {
        this.storage = storage;
        this.config = properties.images();
    }

    /** Display copy plus thumbnail, for project and gallery photos. */
    public StoredImage store(MultipartFile file) {
        return store(file, true);
    }

    /** One display copy only (url == thumbUrl), for service images, review photos and page images. */
    public StoredImage storeSingle(MultipartFile file) {
        return store(file, false);
    }

    private StoredImage store(MultipartFile file, boolean withThumbnail) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Please choose an image to upload.");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw ApiException.badRequest("The image could not be read. Please try again.");
        }
        String type = detectType(bytes);
        if (type == null) {
            throw ApiException.badRequest("\"" + safeName(file) + "\" is not a JPG, PNG or WebP image.");
        }
        if (type.equals("webp")) {
            String url = storage.save(bytes, "webp");
            return new StoredImage(url, url, null, null);
        }
        return optimise(bytes, type, safeName(file), withThumbnail);
    }

    /** Removes stored files; bundled sample images (not uploaded) are left alone by the storage. */
    public void delete(String url, String thumbUrl) {
        storage.delete(url);
        if (thumbUrl != null && !thumbUrl.equals(url)) {
            storage.delete(thumbUrl);
        }
    }

    private StoredImage optimise(byte[] bytes, String type, String name, boolean withThumbnail) {
        BufferedImage source;
        try {
            checkPixelCount(bytes, name);
            source = ImageIO.read(new ByteArrayInputStream(bytes));
        } catch (IOException | RuntimeException e) {
            if (e instanceof ApiException api) {
                throw api;
            }
            source = null;
        }
        if (source == null) {
            // Valid header but the JDK cannot decode it (e.g. a CMYK JPEG): keep the original rather than refuse.
            log.info("Storing {} unprocessed: the JDK could not decode it", name);
            String url = storage.save(bytes, type);
            return new StoredImage(url, url, null, null);
        }
        int orientation = type.equals("jpg") ? exifOrientation(bytes) : 1;
        BufferedImage display = orient(toRgb(resize(source, config.maxDimension())), orientation);
        BufferedImage thumb = withThumbnail ? resize(display, config.thumbnailWidth()) : display; // same object when small
        String url = storage.save(encodeJpeg(display), "jpg");
        String thumbUrl = thumb == display ? url : storage.save(encodeJpeg(thumb), "jpg");
        return new StoredImage(url, thumbUrl, display.getWidth(), display.getHeight());
    }

    /** Reads only the header to refuse images whose decoded size would exhaust memory. */
    private void checkPixelCount(byte[] bytes, String name) throws IOException {
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                return;
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true);
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels > config.maxSourcePixels()) {
                    throw ApiException.badRequest("\"" + name + "\" has too many pixels. Please resize it and try again.");
                }
            } finally {
                reader.dispose();
            }
        }
    }

    /** Scales so the longest side is at most maxSide, halving in steps so the result stays sharp. */
    static BufferedImage resize(BufferedImage image, int maxSide) {
        int w = image.getWidth();
        int h = image.getHeight();
        int longest = Math.max(w, h);
        if (longest <= maxSide) {
            return image;
        }
        double scale = (double) maxSide / longest;
        int targetW = Math.max(1, (int) Math.round(w * scale));
        int targetH = Math.max(1, (int) Math.round(h * scale));
        BufferedImage current = image;
        int curW = w;
        int curH = h;
        do {
            curW = Math.max(targetW, curW / 2);
            curH = Math.max(targetH, curH / 2);
            BufferedImage next = new BufferedImage(curW, curH, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = next.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, curW, curH);
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(current, 0, 0, curW, curH, null);
            g.dispose();
            current = next;
        } while (curW != targetW || curH != targetH);
        return current;
    }

    /** JPEG has no transparency: flatten onto white. */
    static BufferedImage toRgb(BufferedImage image) {
        if (image.getType() == BufferedImage.TYPE_INT_RGB) {
            return image;
        }
        BufferedImage rgb = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, image.getWidth(), image.getHeight());
        g.drawImage(image, 0, 0, null);
        g.dispose();
        return rgb;
    }

    /** Applies an EXIF orientation (1-8) so the saved pixels are upright. */
    static BufferedImage orient(BufferedImage src, int orientation) {
        if (orientation < 2 || orientation > 8) {
            return src;
        }
        int w = src.getWidth();
        int h = src.getHeight();
        boolean swap = orientation >= 5;
        int dw = swap ? h : w;
        int dh = swap ? w : h;
        int[] in = src.getRGB(0, 0, w, h, null, 0, w);
        int[] out = new int[in.length];
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int dx;
                int dy;
                switch (orientation) {
                    case 2 -> { dx = w - 1 - x; dy = y; }
                    case 3 -> { dx = w - 1 - x; dy = h - 1 - y; }
                    case 4 -> { dx = x; dy = h - 1 - y; }
                    case 5 -> { dx = y; dy = x; }
                    case 6 -> { dx = h - 1 - y; dy = x; }
                    case 7 -> { dx = h - 1 - y; dy = w - 1 - x; }
                    default -> { dx = y; dy = w - 1 - x; } // 8
                }
                out[dy * dw + dx] = in[y * w + x];
            }
        }
        BufferedImage result = new BufferedImage(dw, dh, BufferedImage.TYPE_INT_RGB);
        result.setRGB(0, 0, dw, dh, out, 0, dw);
        return result;
    }

    private byte[] encodeJpeg(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (ImageOutputStream out = ImageIO.createImageOutputStream(buffer)) {
            writer.setOutput(out);
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(config.jpegQuality());
            param.setProgressiveMode(ImageWriteParam.MODE_DEFAULT);
            writer.write(null, new IIOImage(image, null, null), param);
        } catch (IOException e) {
            throw new IllegalStateException("Could not encode image", e);
        } finally {
            writer.dispose();
        }
        return buffer.toByteArray();
    }

    static String detectType(byte[] h) {
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (h.length >= 8 && Arrays.equals(Arrays.copyOf(h, 8),
                new byte[]{(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A})) {
            return "png";
        }
        if (h.length >= 12 && ascii(h, 0, 4).equals("RIFF") && ascii(h, 8, 12).equals("WEBP")) {
            return "webp";
        }
        return null;
    }

    /** Reads the orientation tag (0x0112) from a JPEG's EXIF block. Returns 1 (upright) when absent or unreadable. */
    static int exifOrientation(byte[] jpeg) {
        try {
            int pos = 2;
            while (pos + 4 < jpeg.length && (jpeg[pos] & 0xFF) == 0xFF) {
                int marker = jpeg[pos + 1] & 0xFF;
                int length = ((jpeg[pos + 2] & 0xFF) << 8) | (jpeg[pos + 3] & 0xFF);
                if (marker == 0xDA || length < 2) {
                    return 1; // start of image data: no EXIF before it
                }
                if (marker == 0xE1 && pos + 10 < jpeg.length && ascii(jpeg, pos + 4, pos + 8).equals("Exif")) {
                    return readTiffOrientation(jpeg, pos + 10, Math.min(jpeg.length, pos + 2 + length));
                }
                pos += 2 + length;
            }
        } catch (RuntimeException ignored) {
            // malformed EXIF: treat as upright
        }
        return 1;
    }

    private static int readTiffOrientation(byte[] b, int tiff, int end) {
        boolean little = b[tiff] == 'I';
        int ifd = tiff + readInt(b, tiff + 4, little);
        int entries = readShort(b, ifd, little);
        for (int i = 0; i < entries; i++) {
            int entry = ifd + 2 + i * 12;
            if (entry + 12 > end) {
                break;
            }
            if (readShort(b, entry, little) == 0x0112) {
                int value = readShort(b, entry + 8, little);
                return value >= 1 && value <= 8 ? value : 1;
            }
        }
        return 1;
    }

    private static int readShort(byte[] b, int i, boolean little) {
        return little ? (b[i] & 0xFF) | ((b[i + 1] & 0xFF) << 8) : ((b[i] & 0xFF) << 8) | (b[i + 1] & 0xFF);
    }

    private static int readInt(byte[] b, int i, boolean little) {
        return little
                ? (b[i] & 0xFF) | ((b[i + 1] & 0xFF) << 8) | ((b[i + 2] & 0xFF) << 16) | ((b[i + 3] & 0xFF) << 24)
                : ((b[i] & 0xFF) << 24) | ((b[i + 1] & 0xFF) << 16) | ((b[i + 2] & 0xFF) << 8) | (b[i + 3] & 0xFF);
    }

    private static String ascii(byte[] bytes, int from, int to) {
        return new String(bytes, from, to - from, StandardCharsets.ISO_8859_1);
    }

    private static String safeName(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            return "The file";
        }
        name = name.replaceAll("[\\r\\n\"<>]", "");
        return name.length() > 60 ? name.substring(0, 57) + "..." : name;
    }
}
