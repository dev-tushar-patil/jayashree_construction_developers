package com.jayashree.util;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TextTest {

    @Test
    void slugifyMakesUrlSafeSlugs() {
        assertThat(Text.slugify("Jayashree Villa Homes")).isEqualTo("jayashree-villa-homes");
        assertThat(Text.slugify("  Shantivan Bungalows, Phase 2! ")).isEqualTo("shantivan-bungalows-phase-2");
        assertThat(Text.slugify("Construction & Developers")).isEqualTo("construction-and-developers");
        assertThat(Text.slugify("Café Résidence")).isEqualTo("cafe-residence");
        assertThat(Text.slugify("!!!")).isEqualTo("item");
    }

    @Test
    void uniqueSlugAddsTheFirstFreeNumber() {
        Set<String> taken = Set.of("vastu-homes", "vastu-homes-2");
        assertThat(Text.uniqueSlug("vastu-homes", taken::contains)).isEqualTo("vastu-homes-3");
        assertThat(Text.uniqueSlug("maitri", taken::contains)).isEqualTo("maitri");
    }

    @Test
    void cleanTrimsAndNullsBlanks() {
        assertThat(Text.clean("  hi ")).isEqualTo("hi");
        assertThat(Text.clean("   ")).isNull();
        assertThat(Text.clean(null)).isNull();
        assertThat(Text.cleanList(Arrays.asList(" a ", "", null, "b"))).isEqualTo(List.of("a", "b"));
    }

    @Test
    void likePatternLowercasesAndWraps() {
        assertThat(Text.likePattern(" Satara ")).isEqualTo("%satara%");
        assertThat(Text.likePattern("")).isNull();
    }

    @Test
    void titleFromFilenameIsReadable() {
        assertThat(Text.titleFromFilename("front_view-final.JPG")).isEqualTo("Front View Final");
        assertThat(Text.titleFromFilename(".jpg")).isEqualTo("Jpg");
        assertThat(Text.titleFromFilename(null)).isEqualTo("Photo");
    }

    @Test
    void digitsStripsFormatting() {
        assertThat(Text.digits("+91 75582-98818")).isEqualTo("917558298818");
    }
}
