library(sf)
library(raster)
# library(stars)
library(mapview)
# library(ggplot2)
# library(rgeos)
# library(utils)

rm(list = ls())

getwd()

setwd("C:/Users/thali/Documents/GitHub/PTFCS")


clean_units <- function(x){
  attr(x,"units") <- NULL
  class(x) <- setdiff(class(x),"units")
  x
}

# Function that gets the EPSG code from a UTM zone
# All EPSG codes to be returned are in UTM coordinates of WGS84
# parameters: - UTM Zone (Integer)
generateOutcomeRaster <- function(isochronePath, rasterPath, hours, hpc){
  # load the isochrone and reproject it to EPSG 32632
  isochrone <- read_sf(isochronePath)
  isochrone <- st_transform(isochrone, st_crs("EPSG:32632"))
  
  # load the raster and reproject it if the CRS is not EPSG 32632
  raster <- raster(rasterPath)
  # if(crs(raster)!= "EPSG:32632"){
  #   raster <- st_transform(raster, st_crs("EPSG:32632"))
  # }
  
  # Calcute by how much we have to reduce depending on type and hours of the station
  if(hpc){
    hours <- hours*5
  }else{
    hours <- hours
  }
  area <- st_area(isochrone)
  # Area darf nicht pixel >0 enthalten
  pixel <- clean_units(area/100)
  subtrahend <- hours/pixel
  
  # crop a new raster to the extent of the isochrone
  rasterCropped <- mask(raster, isochrone)
  
  
  # subtract the subtrahend calculated before from the cropped raster
  # Abfangen: wenn Werte kleiner 0 sind müssen sie aus der Berechnung rausgenommen werden, damit der bedarf dann auf die restlichen zellen verteilt werden kann
  # Wie viel ziehen wir ab? Wenn man auf fläche bezieht sieht man kaum einen unterschied. was ist realistisch?
  rasterCropped <- rasterCropped - subtrahend
  values(raster)[values(raster) < 0] = 0
  
  # merge the cropped raster with the changed value with the default raster
  outcomeRaster <- cover(rasterCropped, raster)
  
  # save the raster
  writeRaster(outcomeRaster, "./public/ladebedarf/outcomeRaster3.tif", overwrite = TRUE)
}

# Set variables:
isochronePath <- "./public/isochrones/isochroneMedium.geojson"
rasterPath <- "./public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632.tif"
hours <- 1000
hpc <- TRUE

outcomeRaster <- generateOutcomeRaster(isochronePath, rasterPath, hours, hpc)
mapview(outcomeRaster)
