rm(list = ls())
library(raster)

# ungewichteter Ladebedarf eines Pixels
ladebedarf_pro_pixel = 0.005708076

ladebedarf_rasterized_2022 = raster("public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632.tif")
ladebedarf_rasterized_2022_newValues = ladebedarf_rasterized_2022 * ladebedarf_pro_pixel
writeRaster(ladebedarf_rasterized_2022, "1_ladebedarf_rasterized_2022_EPSG_32632_newValues.tif")

ladebedarf_rasterized_2025 = raster("public/ladebedarf/2_ladebedarf_rasterized_2025_EPSG_32632.tif")
ladebedarf_rasterized_2022_newValues = ladebedarf_rasterized_2025 * ladebedarf_pro_pixel
writeRaster(ladebedarf_rasterized_2025, "2_ladebedarf_rasterized_2025_EPSG_32632_newValues.tif")

ladebedarf_rasterized_2030 = raster("public/ladebedarf/3_ladebedarf_rasterized_2030_EPSG_32632.tif")
ladebedarf_rasterized_2030_newValue = ladebedarf_rasterized_2030 * ladebedarf_pro_pixel
writeRaster(ladebedarf_rasterized_2022, "3_ladebedarf_rasterized_2030_EPSG_32632_newValues.tif")
