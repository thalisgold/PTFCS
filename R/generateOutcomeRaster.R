
test <- function(data) {
  library(jsonlite)
  a <- fromJSON(data)

  # jsonObj <- fromJSON
}


# library(ggplot2)
# library(rgeos)
# library(utils)

# rm(list = ls())

# getwd()

# setwd("C:/Users/thali/Documents/GitHub/PTFCS")
# setwd("~/Documents/Studium/5. Semester/Aufladen in Münster/PTFCS/")

# # Set variables:
# isochronePath <- "./public/isochrones/isochroneBig.geojson"
# rasterPath <- "./public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632_newValues.tif"
# stationType <- "SL"
# numberStations <- 2


# Function that gets the EPSG code from a UTM zone
# All EPSG codes to be returned are in UTM coordinates of WGS84
# parameters: - UTM Zone (Integer)
# generateOutcomeRaster <- function(isochronePath, rasterPath, stationType, numberStations){
#   # load packages
#   library(sf)
#   library(raster)
#   library(mapview)
  
#   # default variables
#   hours_per_station <- 70
#   hpc_factor <- 4
  
#   # variables selected by user
#   stationType <- stationType
#   numberStations <- numberStations
  
#   # load the isochrone and reproject it to EPSG 32632
#   isochrone <- read_sf(isochronePath)
#   isochrone <- st_transform(isochrone, st_crs("EPSG:32632"))
  
#   # load the raster and reproject it if the CRS is not EPSG 32632
#   raster <- raster(rasterPath)
#   # if(crs(raster)!= "EPSG:32632"){
#   #   raster <- st_transform(raster, st_crs("EPSG:32632"))
#   # }
  
#   # Calcute by how much we have to reduce the need depending on the type of the station
#   if (stationType == "SL") {
#     hours_per_station <- hours_per_station * hpc_factor
#   }
  
#   # crop a new raster to the extent of the isochrone
#   rasterCropped <- mask(raster, isochrone)
  
#   # Herausfinden, wie viele Pixel nicht NA sind, denn nur auf diese Pixel wollen wir die Minuten verteilen
#   isNotNA <- !is.na(getValues(rasterCropped))
#   count <- 0
#   for (i in 1:length(isNotNA)) {
#     if (isNotNA[i] == TRUE){
#       count <- count +1
#     }
#   }
#   pixelNotNA <- count
#   print(paste("Anzahl Pixel, die nicht NA sind:", pixelNotNA, sep =" "))
  
#   subtrahend_minutes_per_pixel <- ((hours_per_station * numberStations)/pixelNotNA) * 60
#   print(paste("Abzuziehender Ladebedarf in Minuten/Pixel:", subtrahend_minutes_per_pixel, sep =" "))
  
#   # subtract the subtrahend calculated before from the cropped raster
#   # rasterCropped <- 0
#   # rasterCropped <- rasterCropped - 10
#   # rasterCropped
#   rasterCropped <- rasterCropped - subtrahend_minutes_per_pixel
#   writeRaster(rasterCropped, "./public/ladebedarf/mask.tif", overwrite = TRUE)
  
#   # Werte, die durch den Abzug auf unter 0 gefallen sind, m?ssen auf 0 gesetzt werden.
#   values(rasterCropped)[values(rasterCropped) < 0] = 0
#   rasterCropped
#   # merge the cropped raster with the changed value with the default raster
#   outcomeRaster <- cover(rasterCropped, raster)
  
#   # save the raster
#   writeRaster(outcomeRaster, "./public/ladebedarf/outcomeRaster.tif", overwrite = TRUE)
# }

# outcomeRaster <- generateOutcomeRaster(isochronePath, rasterPath, stationType, numberStations)
# mapview(outcomeRaster)

