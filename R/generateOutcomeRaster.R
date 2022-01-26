# test <- function(data) {
#   print(getwd())
# }
# setwd("/home/fabian-s/Documents/Studium/5. Semester/Aufladen in Münster/PTFCS")


test <- function(dummy) {
  library(mongolite)
  library(sf)
  library(raster)
  # library(mapview)
  library(sp)
  
  
  # select the right tif to work with 
  # if (data == "2022") {
  #   rasterPath <- "./public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632_newValues.tif"
  # }
  # if (data == "2025") {
  #   rasterPath <- "./public/ladebedarf/2_ladebedarf_rasterized_2025_EPSG_32632_newValues.tif"
  # }
  # if (data == "2030") {
  #   rasterPath <- "./public/ladebedarf/3_ladebedarf_rasterized_2030_EPSG_32632_newValues.tif"
  # }
  
  # load the raster and reproject it if the CRS is not EPSG 32632
  raster_2022 <- raster("./public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632_newValues.tif")
  raster_2025 <- raster("./public/ladebedarf/2_ladebedarf_rasterized_2025_EPSG_32632_newValues.tif")
  raster_2030 <- raster("./public/ladebedarf/3_ladebedarf_rasterized_2030_EPSG_32632_newValues.tif")
  # if(crs(raster)!= "EPSG:32632"){
  #   raster <- st_transform(raster, st_crs("EPSG:32632"))
  # }
  
  # This is the connection_string. You can get the exact url from your MongoDB cluster screen
  connection_string = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
  stations_collection = mongo(collection="stations", db="PTFCS-database", url=connection_string)

  alldata <- stations_collection$find('{}')
  
  if (length(alldata$type) > 0) {
    for (i in 1:length(alldata$type)) {
      # default variables
      hours_per_station <- 70
      hpc_factor <- 4
      
      # variables selected by user
      stationType <- (alldata$properties$StationType[i])
      # stationType
      numberStationsAsString <- (alldata$properties$NumberStations[i])
      numberStations <- as.numeric(numberStationsAsString)
      # isochrone <- (alldata$geometry$geometries[[i]]$coordinates[2])
      # isochrone
      # View(alldata$geometry$geometries[[i]])
      values <- alldata$geometry$geometries[[i]]$coordinates[[2]]
      vector_x = c()
      vector_y = c()
      for(j in 1:(length(values)/2)){
        coordAnzahl = (length(values)/2)
        vector_x[j] = values[j + coordAnzahl]
        vector_y[j] = values[j]
      }
      # vector_x
      # vector_y
      
      xym <- cbind(vector_y, vector_x)
      #xym
      p = Polygon(xym)
      ps = Polygons(list(p),1)
      isochrone = SpatialPolygons(list(ps))
      proj4string(isochrone) = CRS("+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0")
      isochrone <- spTransform(isochrone, crs("EPSG:32632"))
      # library(mapview)
      # mapview(isochrone)
      
      # Calcute by how much we have to reduce the need depending on the type of the station
      if (stationType == "Schnellladestation") {
        hours_per_station <- hours_per_station * hpc_factor
      }
      
      # crop a new raster to the extent of the isochrone
      rasterCropped_2022 <- mask(raster_2022, isochrone)
      rasterCropped_2025 <- mask(raster_2025, isochrone)
      rasterCropped_2030 <- mask(raster_2030, isochrone)
      # mapview(rasterCropped)
      
      # Herausfinden, wie viele Pixel nicht NA sind, denn nur auf diese Pixel wollen wir die Minuten verteilen
      isNotNA_2022 <- !is.na(getValues(rasterCropped_2022))
      isNotNA_2025 <- !is.na(getValues(rasterCropped_2025))
      isNotNA_2030 <- !is.na(getValues(rasterCropped_2030))
      pixelNotNA_2022 <- 0
      pixelNotNA_2025 <- 0
      pixelNotNA_2030 <- 0
      for (k in 1:length(isNotNA_2022)) {
        if (isNotNA_2022[k] == TRUE){
          pixelNotNA_2022 <- pixelNotNA_2022 +1
        }
      }
      for (k in 1:length(isNotNA_2025)) {
        if (isNotNA_2025[k] == TRUE){
          pixelNotNA_2025 <- pixelNotNA_2025 +1
        }
      }
      for (k in 1:length(isNotNA_2030)) {
        if (isNotNA_2030[k] == TRUE){
          pixelNotNA_2030 <- pixelNotNA_2030 +1
        }
      }
      
      subtrahend_minutes_per_pixel_2022 <- ((hours_per_station * numberStations)/pixelNotNA_2022) * 60
      subtrahend_minutes_per_pixel_2025 <- ((hours_per_station * numberStations)/pixelNotNA_2025) * 60
      subtrahend_minutes_per_pixel_2030 <- ((hours_per_station * numberStations)/pixelNotNA_2030) * 60
      
      print(paste("Anzahl Pixel, die nicht NA sind:", pixelNotNA_2022, sep =" "))
      print(paste("Abzuziehender Ladebedarf in Minuten/Pixel:", subtrahend_minutes_per_pixel_2022, sep =" "))
      print(paste("Anzahl Pixel, die nicht NA sind:", pixelNotNA_2025, sep =" "))
      print(paste("Abzuziehender Ladebedarf in Minuten/Pixel:", subtrahend_minutes_per_pixel_2025, sep =" "))
      print(paste("Anzahl Pixel, die nicht NA sind:", pixelNotNA_2030, sep =" "))
      print(paste("Abzuziehender Ladebedarf in Minuten/Pixel:", subtrahend_minutes_per_pixel_2025, sep =" "))
      
      # subtract the subtrahend calculated before from the cropped raster
      # rasterCropped <- 0
      # rasterCropped <- rasterCropped - 10
      # rasterCropped
      rasterCropped_2022 <- rasterCropped_2022 - subtrahend_minutes_per_pixel_2022
      rasterCropped_2025 <- rasterCropped_2025 - subtrahend_minutes_per_pixel_2025
      rasterCropped_2030 <- rasterCropped_2030 - subtrahend_minutes_per_pixel_2030
      
      # mapview(rasterCropped)
      # writeRaster(rasterCropped, "/public/outcome/", overwrite = TRUE)
      
      # Werte, die durch den Abzug auf unter 0 gefallen sind, m?ssen auf 0 gesetzt werden.
      values(rasterCropped_2022)[values(rasterCropped_2022) < 0] = 0
      values(rasterCropped_2025)[values(rasterCropped_2025) < 0] = 0
      values(rasterCropped_2030)[values(rasterCropped_2030) < 0] = 0
      # rasterCropped
      # merge the cropped raster with the changed value with the default raster
      raster_2022 <- cover(rasterCropped_2022, raster_2022)
      raster_2025 <- cover(rasterCropped_2025, raster_2025)
      raster_2030 <- cover(rasterCropped_2030, raster_2030)
      # mapview(raster)
    }
  }
  # save the raster
  writeRaster(raster_2022, "./public/outcome/outcomeRaster_2022.tif", overwrite = TRUE)
  writeRaster(raster_2025, "./public/outcome/outcomeRaster_2025.tif", overwrite = TRUE)
  writeRaster(raster_2030, "./public/outcome/outcomeRaster_2030.tif", overwrite = TRUE)
}
# test()


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

