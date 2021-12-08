library(sf)
library(raster)
library(stars)
library(mapview)
library(ggplot2)
library(rgeos)

rm(list = ls())

setwd("/media/fabian-s/3465-6433/Studium/5. Semester/Projekt Aufladen in Münster")

ladebedarf = read_sf("./Daten StandortTOOL Szenarien/NRW_Münster_2022.geojson")

ladebedarf = st_transform(ladebedarf, st_crs("EPSG:32632"))
ladebedarf



bbox = bbox2SP(5767767.6, 5745727.6 , 397791.9, 413821.9, bbox=NA, proj4string=CRS("+init=epsg:32632"))
bbox = st_bbox(bbox)
bbox


plot(ladebedarf)


stars_bbox = st_as_stars(bbox, nx = 1603, ny = 2204, values = NA_real_)

x = st_rasterize(ladebedarf, st_as_stars(bbox, nx = 1603, ny = 2204, values = NA_real_))

# y = st_rasterize(ladebedarf, guess_raster(ladebedarf))


mapview(muenster_ladebedarfs$muenster)

class(x)

write_stars(x, "muenster.tif")

muenster_ladebedarfs = stack("muenster.tif")

muenster_ladebedarfs
