library(sf)
library(raster)
library(stars)
library(mapview)
library(ggplot2)
library(rgeos)
library(rstudioapi)
library(utils)

rm(list = ls())
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("/media/fabian-s/3465-6433/Studium/5. Semester/Projekt Aufladen in Münster")

ladebedarf <- read_sf("./Daten StandortTOOL Szenarien/NRW_Münster_2030.geojson")
siedlungsflächen <- read_sf("./Daten StandortTOOL Szenarien/Siedlungsflächen Münster.gpkg")


ladebedarf <- st_transform(ladebedarf, st_crs("EPSG:32632"))
siedlungsflächen <- st_transform(siedlungsflächen, st_crs("EPSG:32632"))

ladebedarf_intersected = st_intersection(ladebedarf, siedlungsflächen)


mapview(ladebedarf_intersected)
plot(ladebedarf_intersected)



bbox = bbox2SP(5767767.6, 5745727.6 , 397791.9, 413821.9, bbox=NA, proj4string=CRS("+init=epsg:32632"))

bbox = st_bbox(bbox)
bbox



x = st_rasterize(ladebedarf_intersected, st_as_stars(bbox, nx = 1603, ny = 2204, values = NA_real_))

x = st_transform(x, st_crs("EPSG:4326"))


write_stars(x, "ladebedarf_rasterized_2030_EPSG_4326.tif")

muenster_ladebedarf <- raster("muenster.tif")

muenster_ladebedarf

mapview(muenster_ladebedarf)

temp = raster("ladebedarf_rasterized_2022_EPSG_32632.tif")
temp = projectRaster()