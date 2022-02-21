library(sf)
library(raster)
library(stars)
library(mapview)
library(ggplot2)
library(rgeos)
library(utils)

rm(list = ls())

getwd()

#set working directory
setwd("~/Documents/Studium/5. Semester/Aufladen in Münster/PTFCS/")

#load data
ladebedarf <- read_sf("./Daten StandortTOOL Szenarien/Originaldaten/NRW_Münster_2022.geojson")
siedlungsflächen <- read_sf("./Daten StandortTOOL Szenarien/Siedlungsflächen Münster_32632.gpkg")
#range <- read_sf("./Daten StandortTOOL Szenarien/range.geojson")

#transform to EPSG 32632
ladebedarf <- st_transform(ladebedarf, st_crs("EPSG:32632"))
siedlungsflächen <- st_transform(siedlungsflächen, st_crs("EPSG:32632"))
range <- st_transform(range, st_crs("EPSG:32632"))

#intersect "Ladebedarf StandortTOOL" with "Siedlungsflächen Münster"
ladebedarf_intersected = st_intersection(ladebedarf, siedlungsflächen)
ladebedarf_intersected_2 = st_intersection(ladebedarf_intersected, range)

mapview(ladebedarf_intersected)
mapview(range)
plot(ladebedarf_intersected)

#set bounding box
bbox = bbox2SP(5767767.6, 5745727.6 , 397791.9, 413821.9, bbox=NA, proj4string=CRS("+init=epsg:32632"))
bbox = st_bbox(bbox)
bbox

#rasterize "Ladebedarf verschnitten" with resolution 10m
x = st_rasterize(ladebedarf_intersected, st_as_stars(bbox, nx = 1603, ny = 2204, values = NA_real_))

#write output
write_stars(x, "ladebedarf_rasterized_2022_EPSG_32632.tif")

#transform to WGS84
muenster_ladebedarf <- raster("./public/ladebedarf/ladebedarf_rasterized_2022_EPSG_32632.tif")
proj <- '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'
muenster_ladebedarf_4326 <- projectRaster(muenster_ladebedarf, crs = proj)
muenster_ladebedarf_4326

mapview(muenster_ladebedarf_4326)

#write output
writeRaster(muenster_ladebedarf_4326, "ladebedarf_rasterized_2022_EPSG_4326.tif")


