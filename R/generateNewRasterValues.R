rm(list = ls())
library(raster)
library(mapview)

# Zuvor den Ladebedarf pro Pixel in Minuten mit Hilfe des R-Skripts "Ladebedarfsermittlung_Muenster.R" berechnen (für Potenzial 1).
ladebedarf_pro_woche_pro_pixel_in_minuten = 0.4129451

# ladebedarf_pro_woche_pro_pixel_in_sekunden = 0.4129451 * 60
# ladebedarf_pro_woche_pro_pixel_in_sekunden

ladebedarf_rasterized_2022 = raster("public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632.tif")
ladebedarf_rasterized_2022_newValues = ladebedarf_rasterized_2022 * ladebedarf_pro_woche_pro_pixel_in_minuten
writeRaster(ladebedarf_rasterized_2022_newValues, "1_ladebedarf_rasterized_2022_EPSG_32632_newValues.tif")

ladebedarf_rasterized_2025 = raster("public/ladebedarf/2_ladebedarf_rasterized_2025_EPSG_32632.tif")
ladebedarf_rasterized_2025_newValues = ladebedarf_rasterized_2025 * ladebedarf_pro_woche_pro_pixel_in_minuten
writeRaster(ladebedarf_rasterized_2025_newValues, "2_ladebedarf_rasterized_2025_EPSG_32632_newValues.tif")

ladebedarf_rasterized_2030 = raster("public/ladebedarf/3_ladebedarf_rasterized_2030_EPSG_32632.tif")
ladebedarf_rasterized_2030_newValues = ladebedarf_rasterized_2030 * ladebedarf_pro_woche_pro_pixel_in_minuten
writeRaster(ladebedarf_rasterized_2030_newValues, "3_ladebedarf_rasterized_2030_EPSG_32632_newValues.tif")
