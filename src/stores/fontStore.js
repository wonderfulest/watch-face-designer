import { defineStore } from 'pinia';
import axiosInstance from '@/config/axiosConfig';

export const useFontStore = defineStore('font', {
    state: () => ({
        fonts: [],
        loading: false,
        error: null,
        loadedFonts: new Set(), // Track which fonts have been loaded
        allFontsLoaded: false, // Track if all required fonts are loaded
        recentFonts: [], // Track recently used fonts
    }),

    getters: {
        fontOptions: (state) => state.fonts.map(font => ({
            label: font.attributes.name.replace(/_/g, ' '),
            value: font.attributes.name,
            url: font.attributes.woff2?.data?.attributes?.url
        }))
    },

    actions: {
        async fetchFonts() {
            try {
                this.loading = true;
                const response = await axiosInstance.get('/fonts', {
                    params: {
                        populate: 'woff2',
                        // 'filters[type][$eq]': 'text',
                        'sort[0]': 'name:asc',
                        'pagination[page]': 1,
                        'pagination[pageSize]': 100
                    }
                });
                this.fonts = response.data.data;
                this.error = null;
            } catch (err) {
                console.error('Error fetching fonts:', err);
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        async loadFont(fontName) {
            (`Loading font: ${fontName}`);
            if (!fontName) return null;
            
            if (this.loadedFonts.has(fontName)) {
                return document.fonts.check(`12px ${fontName}`); // 返回字体是否可用
            }

            const font = this.fonts.find(f => f.attributes.name === fontName);
            if (!font || !font.attributes.woff2?.data?.attributes?.url) {
                console.warn(`Font ${fontName} not found or missing woff2 URL`);
                return false;
            }

            try {
                const fontFace = new FontFace(
                    fontName,
                    `url(${font.attributes.woff2.data.attributes.url})`
                );
                (`Load fontFace: ${fontName}, ${font.attributes.woff2.data.attributes.url}`);
                // Wait for font to load
                await fontFace.load();

                // Add to document fonts
                document.fonts.add(fontFace);

                // Mark as loaded
                this.loadedFonts.add(fontName);

                // 等待字体实际可用
                await document.fonts.ready;
                (`Font ${fontName} 111111 loaded and available: `);
                if (fontName.startsWith('wonder')) { // 图标字体，不需要再次确认
                    return true
                }
                // 再次确认字体是否可用
                const isAvailable = document.fonts.check(`12px ${fontName}`);
                (`Font ${fontName} loaded and available: ${isAvailable}`);
                return isAvailable;

            } catch (err) {
                console.error(`Error loading font ${fontName}:`, err);
                return false;
            }
        },

        async loadFontsForElements(elements) {
            if (!elements || elements.length === 0) return;

            // Reset loading state
            this.allFontsLoaded = false;

            // Make sure fonts are fetched
            if (this.fonts.length === 0) {
                await this.fetchFonts();
            }

            // Collect all unique fonts from elements
            const fontsToLoad = new Set();
            elements.forEach(element => {
                // Handle group elements
                if (element._objects) {
                    element._objects.forEach(obj => {
                        if (obj.fontFamily) {
                            fontsToLoad.add(obj.fontFamily);
                        }
                    });
                }
                // Handle single elements
                if (element.fontFamily) {
                    fontsToLoad.add(element.fontFamily);
                }
                // Handle font property in config
                if (element.font) {
                    fontsToLoad.add(element.font);
                }
            });

            ('Fonts to load:', Array.from(fontsToLoad));

            // Load all fonts in parallel
            try {
                const results = await Promise.all(
                    Array.from(fontsToLoad).map(async fontName => {
                        const success = await this.loadFont(fontName);
                        this.addRecentFont(fontName); // Add font to recent fonts
                        return { fontName, success };
                    })
                );

                // Check if all fonts loaded successfully
                const failedFonts = results.filter(r => !r.success).map(r => r.fontName);
                if (failedFonts.length > 0) {
                    ('Failed to load fonts:', failedFonts);
                    this.error = `Failed to load fonts: ${failedFonts.join(', ')}`;
                    this.allFontsLoaded = false;
                    return false;
                }

                ('All fonts loaded successfully');
                this.allFontsLoaded = true;
                return true;
            } catch (err) {
                console.error('Error loading fonts:', err);
                this.error = err.message;
                this.allFontsLoaded = false;
                return false;
            }
        },

        // 添加最近使用的字体
        addRecentFont(fontName) {
            if (!fontName) return;
            
            // 从现有列表中移除这个字体（如果存在）
            const index = this.recentFonts.indexOf(fontName);
            if (index > -1) {
                this.recentFonts.splice(index, 1);
            }
            
            // 添加到列表开头
            this.recentFonts.unshift(fontName);
            
            // 只保留最近的 5 个字体
            if (this.recentFonts.length > 5) {
                this.recentFonts.pop();
            }

            // 保存到 localStorage
            localStorage.setItem('recentFonts', JSON.stringify(this.recentFonts));
        },

        // 从 localStorage 加载最近使用的字体
        loadRecentFonts() {
            const savedFonts = localStorage.getItem('recentFonts');
            if (savedFonts) {
                this.recentFonts = JSON.parse(savedFonts);
            }
        },
    }
});
