<template>
  <div class="font-picker">
    <!-- 当前选中的字体预览 -->
    <div class="font-preview" @click="togglePanel">
      <span class="font-name">{{ selectedFontLabel }}</span>
      <span class="preview-text" :style="{ fontFamily: modelValue }">12:23 AM 72°F & Sunny 0123456789</span>
    </div>

    <!-- 字体选择面板 -->
    <div v-if="isOpen" class="font-panel">
      <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="搜索字体..." class="search-input" @input="filterFonts" />
      </div>
      <div class="font-library">
        <!-- 搜索结果 -->
        <div v-if="searchQuery && filteredFonts.length > 0" class="font-section">
          <div class="section-header">
            <span class="arrow expanded">›</span>
            搜索结果
          </div>
          <div class="section-content">
            <div v-for="group in groupByFamily(filteredFonts)" :key="group.family" class="font-family-group">
              <div class="family-name">{{ group.family }}</div>
              <div v-for="font in group.fonts" :key="font.value" class="font-item" :class="{ active: modelValue === font.value }" @click="selectFont(font)">
                <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny 0123456789</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 无搜索结果提示 -->
        <div v-if="searchQuery && filteredFonts.length === 0" class="no-results">未找到匹配的字体</div>

        <!-- 字体类型 -->
        <div v-for="section in fontSections" :key="section.label" class="font-section">
          <div class="section-header" @click="toggleSection(section.label)">
            <span class="arrow" :class="{ expanded: expandedSections[section.label] }">›</span>
            {{ section.label.toUpperCase() }}
          </div>
          <div v-if="expandedSections[section.label]" class="section-content">
            <div v-for="group in groupByFamily(section.fonts)" :key="group.family" class="font-family-group">
              <div class="family-name">{{ group.family }}</div>
              <div v-for="font in group.fonts" :key="font.value" class="font-item" :class="{ active: modelValue === font.value }" @click="selectFont(font)">
                <span class="preview-text" :style="{ fontFamily: font.value }">
                  {{ section.label === 'icon' ? '0123456789' : '12:23 AM 72°F & Sunny 0123456789' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加自定义字体按钮 -->
      <button class="add-font-btn" @click="addCustomFont">Add Custom Font</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFontStore } from '@/stores/fontStore'
import { getFonts, createFont, uploadFontFile } from '@/api/fonts'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const fontStore = useFontStore()

const isOpen = ref(false)
const searchQuery = ref('')
const filteredFonts = ref([])

const expandedSections = ref({
  recent: true,
  'sans-serif': true,
  fixed: true,
  serif: false,
  lcd: true,
  icon: true,
  custom: false
})

// icons字体列表
const iconFonts = [
  { label: 'SuperIcons', value: 'SuperIcons', family: 'SuperIcons' },
  { label: 'super-regular', value: 'super-regular', family: 'super-regular' }
]

const condensedFonts = [
  // Roboto Condensed Fonts
  {
    label: 'Roboto Condensed Black',
    value: 'RobotoCondensed-Black',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Black Italic',
    value: 'RobotoCondensed-BlackItalic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Bold',
    value: 'RobotoCondensed-Bold',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Bold Italic',
    value: 'RobotoCondensed-BoldItalic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed ExtraBold',
    value: 'RobotoCondensed-ExtraBold',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed ExtraBold Italic',
    value: 'RobotoCondensed-ExtraBoldItalic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed ExtraLight',
    value: 'RobotoCondensed-ExtraLight',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed ExtraLight Italic',
    value: 'RobotoCondensed-ExtraLightItalic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Italic',
    value: 'RobotoCondensed-Italic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Light',
    value: 'RobotoCondensed-Light',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Light Italic',
    value: 'RobotoCondensed-LightItalic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Medium',
    value: 'RobotoCondensed-Medium',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Medium Italic',
    value: 'RobotoCondensed-MediumItalic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Regular',
    value: 'RobotoCondensed-Regular',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed SemiBold',
    value: 'RobotoCondensed-SemiBold',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed SemiBold Italic',
    value: 'RobotoCondensed-SemiBoldItalic',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Thin',
    value: 'RobotoCondensed-Thin',
    family: 'Roboto Condensed'
  },
  {
    label: 'Roboto Condensed Thin Italic',
    value: 'RobotoCondensed-ThinItalic',
    family: 'Roboto Condensed'
  },

  // IBM Plex Sans Condensed Fonts
  {
    label: 'IBM Plex Sans Condensed Regular',
    value: 'IBMPlexSansCondensed-Regular',
    family: 'IBM Plex Sans Condensed'
  },
  {
    label: 'IBM Plex Sans Condensed Medium',
    value: 'IBMPlexSansCondensed-Medium',
    family: 'IBM Plex Sans Condensed'
  },
  {
    label: 'IBM Plex Sans Condensed SemiBold',
    value: 'IBMPlexSansCondensed-SemiBold',
    family: 'IBM Plex Sans Condensed'
  },
  {
    label: 'IBM Plex Sans Condensed Bold',
    value: 'IBMPlexSansCondensed-Bold',
    family: 'IBM Plex Sans Condensed'
  },

  // Roboto Semi Condensed Fonts
  {
    label: 'Roboto Semi Condensed Black',
    value: 'RobotoSemiCondensed-Black',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Black Italic',
    value: 'RobotoSemiCondensed-BlackItalic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Bold',
    value: 'RobotoSemiCondensed-Bold',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Bold Italic',
    value: 'RobotoSemiCondensed-BoldItalic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed ExtraBold',
    value: 'RobotoSemiCondensed-ExtraBold',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed ExtraBold Italic',
    value: 'RobotoSemiCondensed-ExtraBoldItalic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed ExtraLight',
    value: 'RobotoSemiCondensed-ExtraLight',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed ExtraLight Italic',
    value: 'RobotoSemiCondensed-ExtraLightItalic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Italic',
    value: 'RobotoSemiCondensed-Italic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Light',
    value: 'RobotoSemiCondensed-Light',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Light Italic',
    value: 'RobotoSemiCondensed-LightItalic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Medium',
    value: 'RobotoSemiCondensed-Medium',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Medium Italic',
    value: 'RobotoSemiCondensed-MediumItalic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Regular',
    value: 'RobotoSemiCondensed-Regular',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed SemiBold',
    value: 'RobotoSemiCondensed-SemiBold',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed SemiBold Italic',
    value: 'RobotoSemiCondensed-SemiBoldItalic',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Thin',
    value: 'RobotoSemiCondensed-Thin',
    family: 'Roboto Semi Condensed'
  },
  {
    label: 'Roboto Semi Condensed Thin Italic',
    value: 'RobotoSemiCondensed-ThinItalic',
    family: 'Roboto Semi Condensed'
  }
]

// sans-serif 字体列表
const sansSerifFonts = [
  // Amiko Fonts
  { label: 'Amiko Regular', value: 'Amiko-Regular', family: 'Amiko' },
  { label: 'Amiko SemiBold', value: 'Amiko-SemiBold', family: 'Amiko' },
  { label: 'Amiko Bold', value: 'Amiko-Bold', family: 'Amiko' },
  // Arimo Fonts
  { label: 'Arimo Regular', value: 'Arimo-Regular', family: 'Arimo' },
  { label: 'Arimo Bold', value: 'Arimo-Bold', family: 'Arimo' },
  { label: 'Bebas Neue Bold', value: 'BebasNeue-Bold', family: 'Bebas Neue' },
  { label: 'Bebas Neue Book', value: 'BebasNeue-Book', family: 'Bebas Neue' },
  { label: 'Bebas Neue Light', value: 'BebasNeue-Light', family: 'Bebas Neue' },
  {
    label: 'Bebas Neue Regular',
    value: 'BebasNeue-Regular',
    family: 'Bebas Neue'
  },
  { label: 'Bebas Neue Thin', value: 'BebasNeue-Thin', family: 'Bebas Neue' },

  // LLDEtechno Fonts
  { label: 'LLDEtechnoGlitch Bold 0', value: 'LLDEtechnoGlitch-Bold0', family: 'LLDEtechnoGlitch' },
  { label: 'LLDEtechnoGlitch Bold 100', value: 'LLDEtechnoGlitch-Bold100', family: 'LLDEtechnoGlitch' },
  { label: 'LLDEtechnoGlitch Bold Italic 0', value: 'LLDEtechnoGlitch-BoldItalic0', family: 'LLDEtechnoGlitch' },
  { label: 'LLDEtechnoGlitch Bold Italic 100', value: 'LLDEtechnoGlitch-BoldItalic100', family: 'LLDEtechnoGlitch' },
  { label: 'LLDEtechnoGlitch GX', value: 'LLDEtechnoGlitch', family: 'LLDEtechnoGlitch' },
  { label: 'LLDEtechnoTwist Bold 0', value: 'LLDEtechnoTwist-Bold0', family: 'LLDEtechnoTwist' },
  { label: 'LLDEtechnoTwist Bold 100', value: 'LLDEtechnoTwist-Bold100', family: 'LLDEtechnoTwist' },
  { label: 'LLDEtechnoTwist Bold Italic 0', value: 'LLDEtechnoTwist-BoldItalic0', family: 'LLDEtechnoTwist' },
  { label: 'LLDEtechnoTwist Bold Italic 100', value: 'LLDEtechnoTwist-BoldItalic100', family: 'LLDEtechnoTwist' },
  { label: 'LLDEtechnoTwist GX', value: 'LLDEtechnoTwist', family: 'LLDEtechnoTwist' },

  // Montserrat Fonts
  {
    label: 'Montserrat Regular',
    value: 'Montserrat-Regular',
    family: 'Montserrat'
  },
  {
    label: 'Montserrat Medium',
    value: 'Montserrat-Medium',
    family: 'Montserrat'
  },
  { label: 'Montserrat Bold', value: 'Montserrat-Bold', family: 'Montserrat' },
  { label: 'Muli Regular', value: 'Muli-Regular', family: 'Muli' },
  { label: 'Muli SemiBold', value: 'Muli-SemiBold', family: 'Muli' },
  { label: 'Muli Bold', value: 'Muli-Bold', family: 'Muli' },
  { label: 'Muli ExtraBold', value: 'Muli-ExtraBold', family: 'Muli' },
  { label: 'Muli Black', value: 'Muli-Black', family: 'Muli' },
  { label: 'Nunito Regular', value: 'Nunito-Regular', family: 'Nunito' },
  { label: 'Nunito SemiBold', value: 'Nunito-SemiBold', family: 'Nunito' },
  { label: 'Nunito Bold', value: 'Nunito-Bold', family: 'Nunito' },
  { label: 'Nunito ExtraBold', value: 'Nunito-ExtraBold', family: 'Nunito' },
  { label: 'Nunito Black', value: 'Nunito-Black', family: 'Nunito' },
  { label: 'Overpass Regular', value: 'Overpass-Regular', family: 'Overpass' },
  {
    label: 'Overpass SemiBold',
    value: 'Overpass-SemiBold',
    family: 'Overpass'
  },
  { label: 'Overpass Bold', value: 'Overpass-Bold', family: 'Overpass' },
  {
    label: 'Overpass ExtraBold',
    value: 'Overpass-ExtraBold',
    family: 'Overpass'
  },
  { label: 'Overpass Black', value: 'Overpass-Black', family: 'Overpass' },
  {
    label: 'Work Sans Regular',
    value: 'WorkSans-Regular',
    family: 'Work Sans'
  },
  { label: 'Work Sans Medium', value: 'WorkSans-Medium', family: 'Work Sans' },
  { label: 'Work Sans Bold', value: 'WorkSans-Bold', family: 'Work Sans' },
  {
    label: 'Work Sans ExtraBold',
    value: 'WorkSans-ExtraBold',
    family: 'Work Sans'
  },
  { label: 'Work Sans Black', value: 'WorkSans-Black', family: 'Work Sans' },
  { label: 'Super Comic', value: 'Super-Comic', family: 'Super-Comic' }
]

const fixedWidthFonts = [
  { label: 'Apple Classic', value: 'Apple-Classic', family: 'Apple Classic' },
  { label: 'Apple Curved', value: 'Apple-Curved', family: 'Apple Curved' },
  {
    label: 'Apple Curved Thin',
    value: 'Apple-Curved-Thin',
    family: 'Apple Curved'
  },
  {
    label: 'Apple Curved UltraThin',
    value: 'Apple-Curved-UltraThin',
    family: 'Apple Curved'
  },
  { label: 'Apple Modern', value: 'Apple-Modern', family: 'Apple Modern' },
  {
    label: 'Apple Modern Thin',
    value: 'Apple-Modern-Thin',
    family: 'Apple Modern'
  },
  { label: 'Cousine Regular', value: 'Cousine-Regular', family: 'Cousine' },
  { label: 'Cousine Bold', value: 'Cousine-Bold', family: 'Cousine' },
  {
    label: 'IBM Plex Mono Regular',
    value: 'IBMPlexMono-Regular',
    family: 'IBM Plex Mono'
  },
  {
    label: 'IBM Plex Mono Medium',
    value: 'IBMPlexMono-Medium',
    family: 'IBM Plex Mono'
  },
  {
    label: 'IBM Plex Mono SemiBold',
    value: 'IBMPlexMono-SemiBold',
    family: 'IBM Plex Mono'
  },
  {
    label: 'IBM Plex Mono Bold',
    value: 'IBMPlexMono-Bold',
    family: 'IBM Plex Mono'
  },
  {
    label: 'Inconsolata Regular',
    value: 'Inconsolata-Regular',
    family: 'Inconsolata'
  },
  {
    label: 'Inconsolata Bold',
    value: 'Inconsolata-Bold',
    family: 'Inconsolata'
  },
  {
    label: 'Overpass Mono Regular',
    value: 'OverpassMono-Regular',
    family: 'Overpass Mono'
  },
  {
    label: 'Overpass Mono SemiBold',
    value: 'OverpassMono-SemiBold',
    family: 'Overpass Mono'
  },
  {
    label: 'Overpass Mono Bold',
    value: 'OverpassMono-Bold',
    family: 'Overpass Mono'
  },

  {
    label: 'Roboto Mono Regular',
    value: 'RobotoMono-Regular',
    family: 'Roboto Mono'
  },
  {
    label: 'Roboto Mono Medium',
    value: 'RobotoMono-Medium',
    family: 'Roboto Mono'
  },
  {
    label: 'Roboto Mono Bold',
    value: 'RobotoMono-Bold',
    family: 'Roboto Mono'
  },
  {
    label: 'Roboto Slab Regular',
    value: 'RobotoSlab-Regular',
    family: 'Roboto Slab'
  },
  {
    label: 'Roboto Slab Bold',
    value: 'RobotoSlab-Bold',
    family: 'Roboto Slab'
  },

  {
    label: 'Source Code Pro Regular',
    value: 'SourceCodePro-Regular',
    family: 'Source Code Pro'
  },
  {
    label: 'Source Code Pro Medium',
    value: 'SourceCodePro-Medium',
    family: 'Source Code Pro'
  },
  {
    label: 'Source Code Pro SemiBold',
    value: 'SourceCodePro-SemiBold',
    family: 'Source Code Pro'
  },
  {
    label: 'Source Code Pro Bold',
    value: 'SourceCodePro-Bold',
    family: 'Source Code Pro'
  },
  {
    label: 'Source Code Pro Black',
    value: 'SourceCodePro-Black',
    family: 'Source Code Pro'
  },
  {
    label: 'Ubuntu Mono Regular',
    value: 'UbuntuMono-Regular',
    family: 'Ubuntu Mono'
  },
  {
    label: 'Ubuntu Mono Bold',
    value: 'UbuntuMono-Bold',
    family: 'Ubuntu Mono'
  }
]

const serifFonts = [
  { label: 'Aleo Regular', value: 'Aleo-Regular', family: 'Aleo' },
  { label: 'Aleo Bold', value: 'Aleo-Bold', family: 'Aleo' },
  { label: 'Arvo Regular', value: 'Arvo-Regular', family: 'Arvo' },
  { label: 'Arvo Bold', value: 'Arvo-Bold', family: 'Arvo' },
  { label: 'BioRhyme Regular', value: 'BioRhyme-Regular', family: 'BioRhyme' },
  { label: 'BioRhyme Bold', value: 'BioRhyme-Bold', family: 'BioRhyme' },
  {
    label: 'BioRhyme ExtraBold',
    value: 'BioRhyme-ExtraBold',
    family: 'BioRhyme'
  },
  { label: 'Bitter Regular', value: 'Bitter-Regular', family: 'Bitter' },
  { label: 'Bitter Bold', value: 'Bitter-Bold', family: 'Bitter' },
  { label: 'Glegoo Regular', value: 'Glegoo-Regular', family: 'Glegoo' },
  { label: 'Glegoo Bold', value: 'Glegoo-Bold', family: 'Glegoo' },
  { label: 'Kadwa Regular', value: 'Kadwa-Regular', family: 'Kadwa' },
  { label: 'Kadwa Bold', value: 'Kadwa-Bold', family: 'Kadwa' },
  { label: 'Kameron Regular', value: 'Kameron-Regular', family: 'Kameron' },
  { label: 'Kameron Bold', value: 'Kameron-Bold', family: 'Kameron' },
  {
    label: 'Libre Baskerville Regular',
    value: 'LibreBaskerville-Regular',
    family: 'Libre Baskerville'
  },
  {
    label: 'Libre Baskerville Bold',
    value: 'LibreBaskerville-Bold',
    family: 'Libre Baskerville'
  },
  {
    label: 'Noto Serif Regular',
    value: 'NotoSerif-Regular',
    family: 'Noto Serif'
  },
  { label: 'Noto Serif Bold', value: 'NotoSerif-Bold', family: 'Noto Serif' },
  {
    label: 'Roboto Slab Regular',
    value: 'RobotoSlab-Regular',
    family: 'Roboto Slab'
  },
  {
    label: 'Roboto Slab Bold',
    value: 'RobotoSlab-Bold',
    family: 'Roboto Slab'
  },
  { label: 'Sumana Regular', value: 'Sumana-Regular', family: 'Sumana' },
  { label: 'Sumana Bold', value: 'Sumana-Bold', family: 'Sumana' }
]

const lcdFonts = [
  {
    label: 'Digital System',
    value: 'DigitalSystem-Regular',
    family: 'Digital System'
  },
  { label: 'Minisystem', value: 'Minisystem-Regular', family: 'Minisystem' },
  {
    label: 'Patopian 1986',
    value: 'Patopian1986-Regular',
    family: 'Patopian 1986'
  }
]

const customFonts = [
  { label: 'conthrax-sb', value: 'conthrax-sb', family: 'conthrax-sb' },
  {
    label: 'VarsityTeam-Bold',
    value: 'VarsityTeam-Bold',
    family: 'VarsityTeam'
  }
]

const fontSections = [
  { label: 'recent', fonts: fontStore.recentFonts },
  { label: 'condensed（窄体）', fonts: condensedFonts },
  { label: 'sans-serif (无衬线)', fonts: sansSerifFonts },
  { label: 'serif (衬线)', fonts: serifFonts },
  { label: 'fixed-width（固定宽度）', fonts: fixedWidthFonts },
  { label: 'lcd', fonts: lcdFonts },
  { label: 'icon', fonts: iconFonts },
  { label: 'custom', fonts: customFonts }
]

const groupByFamily = (fonts) => {
  const groups = new Map()
  fonts.forEach((font) => {
    if (!groups.has(font.family)) {
      groups.set(font.family, [])
    }
    groups.get(font.family).push(font)
  })
  return Array.from(groups.entries()).map(([family, fonts]) => ({
    family,
    fonts
  }))
}

const selectedFontLabel = computed(() => {
  const allFonts = fontSections.flatMap((section) => section.fonts)
  const found = allFonts.find((font) => font.value === props.modelValue)
  return found ? found.label : props.modelValue
})

// 切换面板显示
const togglePanel = () => {
  isOpen.value = !isOpen.value
}

// 切换分组展开/收起
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

// 选择字体
const selectFont = (font) => {
  emit('update:modelValue', font.value)
  emit('change', font.value)
  fontStore.addRecentFont(font)
  isOpen.value = false
}

const filterFonts = () => {
  const query = searchQuery.value.toLowerCase()
  if (!query) {
    filteredFonts.value = []
    return
  }

  const allFonts = fontSections.flatMap((section) => section.fonts)

  // 先按family分组
  const fontsByFamily = groupByFamily(allFonts)

  // 过滤匹配的family组
  const matchingGroups = fontsByFamily.filter((group) => group.family.toLowerCase().includes(query))

  // 如果没有匹配的family，再搜索具体的字体名
  if (matchingGroups.length === 0) {
    filteredFonts.value = allFonts.filter((font) => font.label.toLowerCase().includes(query))
  } else {
    // 如果有匹配的family，展平所有匹配组中的字体
    filteredFonts.value = matchingGroups.flatMap((group) => group.fonts)
  }
}

// 添加自定义字体
const addCustomFont = () => {
  // 创建一个隐藏的文件输入元素
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.ttf'
  fileInput.style.display = 'none'
  document.body.appendChild(fileInput)

  // 监听文件选择事件
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0]
    if (!file) {
      document.body.removeChild(fileInput)
      return
    }

    try {
      // 检查文件是否有效
      if (!file || file.size === 0) {
        throw new Error('无效的文件')
      }
      
      console.log('准备上传文件:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // 1. 先上传字体文件
      const uploadResult = await uploadFontFile(file)
      console.log('文件上传结果:', uploadResult)
      
      // 生成字体名称 (使用文件名，但移除扩展名)
      const fontName = file.name.replace(/\.ttf$/i, '')
      
      // 查询是否存在同名字体
      const response = await getFonts({ 
        page: 1, 
        pageSize: 1, 
        name: fontName 
      })
      
      if (response.data.length > 0) {
        alert('该字体名称已存在，请重命名后重试')
        return
      }

      // 创建 URL 对象用于预览
      const fontUrl = URL.createObjectURL(file)
      
      // 先测试字体是否可用
      const fontFace = new FontFace(fontName, `url(${fontUrl})`)
      await fontFace.load()
      
      // 2. 创建字体记录
      const fontData = {
        name: fontName,
        slug: fontName.toLowerCase().replace(/\s+/g, '-'),
        family: fontName,
        status: 'upload',
        ttf: uploadResult.id // 使用上传后返回的文件ID
      }
      
      const result = await createFont(fontData)
      const serverFont = result.data.attributes

      // 添加到文档字体
      document.fonts.add(fontFace)
      
      // 标记为已加载
      fontStore.loadedFonts.add(fontName)
      
      // 创建新的字体对象
      const newFont = {
        label: serverFont.name,
        value: serverFont.family,
        family: serverFont.family,
        id: result.data.id,
        slug: serverFont.slug,
        url: uploadResult.url // 保存字体文件URL
      }
      
      // 检查是否已存在相同的字体
      const existingFontIndex = customFonts.findIndex(font => font.value === serverFont.family)
      if (existingFontIndex !== -1) {
        customFonts[existingFontIndex] = newFont
      } else {
        customFonts.push(newFont)
      }
      
      // 添加到最近使用的字体
      fontStore.addRecentFont(newFont)
      
      // 自动选择新添加的字体
      selectFont(newFont)
      
    } catch (error) {
      console.error('字体处理失败:', error)
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.message
        || '字体处理失败，请确保上传的是有效的TTF文件。'
      alert(errorMessage)
    } finally {
      // 清理文件输入元素
      document.body.removeChild(fileInput)
    }
  })

  // 触发文件选择对话框
  fileInput.click()
}

// 监听点击外部关闭面板
const handleOutsideClick = (event) => {
  if (!event.target.closest('.font-picker')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.font-picker {
  position: relative;
  width: 100%;
}

.font-preview {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  display: flex;
  gap: 12px;
  align-items: center;
}

.font-preview:hover {
  border-color: #409eff;
}

.font-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #409eff;
}

.no-results {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.font-library {
  max-height: 800px;
  overflow-y: auto;
}

.font-section {
  border-bottom: 1px solid #eee;
}

.section-header {
  padding: 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
}

.arrow {
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.3s;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.section-content {
  padding: 8px 0;
}

.family-name {
  font-size: 12px;
  color: #909399;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;
}

.font-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.font-item:hover {
  background: #f5f7fa;
}

.font-item.active {
  background: #ecf5ff;
  color: #409eff;
}

.font-name {
  font-size: 13px;
  color: #666;
}

.preview-text {
  font-size: 18px;
  color: #333;
}

.no-fonts {
  padding: 12px;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.add-font-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: none;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  border-top: 1px solid #eee;
}

.add-font-btn:hover {
  background: #f5f7fa;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
