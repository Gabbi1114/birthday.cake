# Cyrillic Font Setup Instructions

To display Mongolian Cyrillic characters (like "АРИУНСАНАА") correctly in the 3D text, you need to use a font that supports Cyrillic characters.

## Quick Solution

1. Go to https://gero3.github.io/facetype.js/
2. Download a Cyrillic-compatible font (e.g., Roboto Bold from Google Fonts: https://fonts.google.com/specimen/Roboto)
3. Upload the font file (.ttf or .otf) to the converter
4. Download the generated `typeface.json` file
5. Save it as `roboto_bold_cyrillic.typeface.json` in the `public` folder
6. The code will automatically use it

## Alternative: Use a Pre-converted Font

If you have access to a pre-converted Cyrillic font in typeface.json format, place it in the `public` folder and update the font URL in `components/Scene.tsx`.
