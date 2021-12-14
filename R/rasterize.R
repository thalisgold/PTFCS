library(sf)
library(raster)
library(stars)
library(mapview)
library(ggplot2)
library(rgeos)
library(rstudioapi)
library(utils)

rm(list = ls())

getwd()

#setwd("C:/Users/thali/Documents/GitHub/PTFCS")

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("/media/fabian-s/3465-6433/Studium/5. Semester/Projekt Aufladen in MÃ¼nster")

ladebedarf <- read_sf("./Daten StandortTOOL Szenarien/NRW_Münster_2022.geojson")
siedlungsflächen <- read_sf("./Daten StandortTOOL Szenarien/Siedlungsflächen Münster.gpkg")


ladebedarf <- st_transform(ladebedarf, st_crs("EPSG:32632"))
siedlungsflächen <- st_transform(siedlungsflächen, st_crs("EPSG:32632"))

ladebedarf_intersected = st_intersection(ladebedarf, siedlungsflächen)
ladebedarf

mapview(ladebedarf_intersected)
plot(ladebedarf_intersected)



bbox = bbox2SP(5767767.6, 5745727.6 , 397791.9, 413821.9, bbox=NA, proj4string=CRS("+init=epsg:32632"))

bbox = st_bbox(bbox)
bbox



x = st_rasterize(ladebedarf_intersected, st_as_stars(bbox, nx = 1603, ny = 2204, values = NA_real_))


write_stars(x, "ladebedarf_rasterized_2022_EPSG_32632.tif")

# Nach WGS84 reprojizieren
muenster_ladebedarf <- raster("./public/ladebedarf/ladebedarf_rasterized_2030_EPSG_32632.tif")

proj <- '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'
muenster_ladebedarf_4326 <- projectRaster(muenster_ladebedarf, crs = proj)
muenster_ladebedarf_4326

mapview(muenster_ladebedarf_4326)
writeRaster(muenster_ladebedarf_4326, "ladebedarf_rasterized_2030_EPSG_4326.tif")
