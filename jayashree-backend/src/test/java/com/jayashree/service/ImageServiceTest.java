package com.jayashree.service;

import org.junit.jupiter.api.Test;

import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class ImageServiceTest {

    @Test
    void detectsTypesFromLeadingBytesOnly() {
        assertThat(ImageService.detectType(new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0})).isEqualTo("jpg");
        assertThat(ImageService.detectType(new byte[]{(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A})).isEqualTo("png");
        assertThat(ImageService.detectType("RIFF....WEBPVP8 ".getBytes(StandardCharsets.ISO_8859_1))).isEqualTo("webp");
        // HTML or SVG renamed to .jpg is refused
        assertThat(ImageService.detectType("<svg onload=alert(1)>".getBytes(StandardCharsets.UTF_8))).isNull();
        assertThat(ImageService.detectType("<!doctype html>".getBytes(StandardCharsets.UTF_8))).isNull();
        assertThat(ImageService.detectType(new byte[0])).isNull();
    }

    @Test
    void resizeKeepsAspectRatioAndOnlyShrinks() {
        BufferedImage wide = new BufferedImage(4000, 3000, BufferedImage.TYPE_INT_RGB);
        BufferedImage out = ImageService.resize(wide, 2000);
        assertThat(out.getWidth()).isEqualTo(2000);
        assertThat(out.getHeight()).isEqualTo(1500);

        BufferedImage small = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
        assertThat(ImageService.resize(small, 2000)).isSameAs(small);
    }

    @Test
    void orientationSixRotatesClockwise() {
        BufferedImage src = new BufferedImage(3, 2, BufferedImage.TYPE_INT_RGB);
        src.setRGB(0, 0, 0xFF0000); // top-left red
        BufferedImage out = ImageService.orient(src, 6);
        assertThat(out.getWidth()).isEqualTo(2);
        assertThat(out.getHeight()).isEqualTo(3);
        assertThat(out.getRGB(1, 0) & 0xFFFFFF).isEqualTo(0xFF0000); // now top-right
    }

    @Test
    void orientationEightRotatesCounterClockwise() {
        BufferedImage src = new BufferedImage(3, 2, BufferedImage.TYPE_INT_RGB);
        src.setRGB(0, 0, 0x00FF00);
        BufferedImage out = ImageService.orient(src, 8);
        assertThat(out.getRGB(0, 2) & 0xFFFFFF).isEqualTo(0x00FF00); // bottom-left
    }

    @Test
    void readsExifOrientationFromJpegHeader() {
        assertThat(ImageService.exifOrientation(jpegWithOrientation(6, true))).isEqualTo(6);
        assertThat(ImageService.exifOrientation(jpegWithOrientation(3, false))).isEqualTo(3);
        assertThat(ImageService.exifOrientation(new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xDA, 0, 2})).isEqualTo(1);
        assertThat(ImageService.exifOrientation(new byte[]{(byte) 0xFF, (byte) 0xD8})).isEqualTo(1);
    }

    /** SOI + APP1 "Exif" with one IFD0 entry: tag 0x0112 (orientation), type SHORT, count 1. */
    private static byte[] jpegWithOrientation(int orientation, boolean littleEndian) {
        byte[] tiff = new byte[8 + 2 + 12 + 4];
        if (littleEndian) {
            tiff[0] = 'I'; tiff[1] = 'I'; tiff[2] = 42; tiff[3] = 0;
            tiff[4] = 8; // IFD offset
            tiff[8] = 1; // one entry
            tiff[10] = 0x12; tiff[11] = 0x01; // tag 0x0112
            tiff[12] = 3; // SHORT
            tiff[14] = 1; // count
            tiff[18] = (byte) orientation;
        } else {
            tiff[0] = 'M'; tiff[1] = 'M'; tiff[2] = 0; tiff[3] = 42;
            tiff[7] = 8;
            tiff[9] = 1;
            tiff[10] = 0x01; tiff[11] = 0x12;
            tiff[13] = 3;
            tiff[17] = 1;
            tiff[19] = (byte) orientation;
        }
        int length = 2 + 6 + tiff.length;
        byte[] out = new byte[2 + 2 + length];
        out[0] = (byte) 0xFF; out[1] = (byte) 0xD8;
        out[2] = (byte) 0xFF; out[3] = (byte) 0xE1;
        out[4] = (byte) (length >> 8); out[5] = (byte) length;
        System.arraycopy("Exif\0\0".getBytes(StandardCharsets.ISO_8859_1), 0, out, 6, 6);
        System.arraycopy(tiff, 0, out, 12, tiff.length);
        return out;
    }
}
