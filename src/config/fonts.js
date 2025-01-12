export const customFonts = [
  {
    name: 'Roboto-Regular',
    url: '/fonts/Roboto-Regular.woff2',
    options: { 
      style: 'normal', 
      weight: '400' 
    }
  },
  {
    name: 'Roboto-Medium',
    url: '/fonts/Roboto-Medium.woff2',
    options: { 
      style: 'normal', 
      weight: '400' 
    }
  }
  // 可以在这里添加更多字体
];

export const loadFonts = async () => {
  const fontLoadPromises = customFonts.map(font => {
    const fontFace = new FontFace(
      font.name,
      `url(${font.url})`,
      font.options
    );
    
    return fontFace.load().then(loadedFont => {
      document.fonts.add(loadedFont);
      return loadedFont;
    });
  });

  try {
    await Promise.all(fontLoadPromises);
  } catch (error) {
    console.error('字体加载失败:', error);
  }
}; 