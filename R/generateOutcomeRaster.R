data = "2022"

test <- function(data) {
  library(mongolite)
  library(sf)
  library(raster)
  library(mapview)
  library(sp)
  
  setwd("~/GitHub/PTFCS")
  
  # select the right tif to work with 
  if (data == "2022") {
    rasterPath <- "./public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632_newValues.tif"
  }
  if (data == "2025") {
    rasterPath <- "./public/ladebedarf/2_ladebedarf_rasterized_2025_EPSG_32632_newValues.tif"
  }
  if (data == "2030") {
    rasterPath <- "./public/ladebedarf/3_ladebedarf_rasterized_2030_EPSG_32632_newValues.tif"
  }
  
  # load the raster and reproject it if the CRS is not EPSG 32632
  raster <- raster(rasterPath)
  # if(crs(raster)!= "EPSG:32632"){
  #   raster <- st_transform(raster, st_crs("EPSG:32632"))
  # }
  
  # This is the connection_string. You can get the exact url from your MongoDB cluster screen
  # connection_string = 'mongodb://localhost:27017/?readPreference=primary&ap=MongoDB%20Compass&directConnection=true&ssl=false'
  connection_string = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
  stations_collection = mongo(collection="stations", db="PTFCS-database", url=connection_string)

  alldata <- stations_collection$find('{}')
  
  # default variables
  hours_per_station <- 70
  hpc_factor <- 4
  
  i=1
  
  for (i in 1:length(alldata)) {
    # variables selected by user
    stationType <- (alldata$properties$StationType[i])
    stationType
    numberStationsAsString <- (alldata$properties$NumberStations[i])
    numberStations <- as.numeric(numberStationsAsString)
    # isochrone <- (alldata$geometry$geometries[[i]]$coordinates[2])
    # isochrone
    # View(alldata$geometry$geometries[[i]])
    values <- alldata$geometry$geometries[[i]]$coordinates[[2]]
    vector_x = c()
    vector_y = c()
    for(i in 1:(length(values)/2)){
      coordAnzahl = (length(values)/2)
      vector_x[i] = values[i + coordAnzahl]
      vector_y[i] = values[i]
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
    rasterCropped <- mask(raster, isochrone)
    # mapview(rasterCropped)
    
    # Herausfinden, wie viele Pixel nicht NA sind, denn nur auf diese Pixel wollen wir die Minuten verteilen
    isNotNA <- !is.na(getValues(rasterCropped))
    count <- 0
    for (i in 1:length(isNotNA)) {
      if (isNotNA[i] == TRUE){
        count <- count +1
      }
    }
    pixelNotNA <- count
    print(paste("Anzahl Pixel, die nicht NA sind:", pixelNotNA, sep =" "))

    subtrahend_minutes_per_pixel <- ((hours_per_station * numberStations)/pixelNotNA) * 60
    print(paste("Abzuziehender Ladebedarf in Minuten/Pixel:", subtrahend_minutes_per_pixel, sep =" "))

    # subtract the subtrahend calculated before from the cropped raster
    # rasterCropped <- 0
    # rasterCropped <- rasterCropped - 10
    # rasterCropped
    rasterCropped <- rasterCropped - subtrahend_minutes_per_pixel
    # mapview(rasterCropped)
    # writeRaster(rasterCropped, "/public/outcome/", overwrite = TRUE)

    # Werte, die durch den Abzug auf unter 0 gefallen sind, m?ssen auf 0 gesetzt werden.
    values(rasterCropped)[values(rasterCropped) < 0] = 0
    # rasterCropped
    # merge the cropped raster with the changed value with the default raster
    raster <- cover(rasterCropped, raster)
    # mapview(raster)
  }
  # save the raster
  writeRaster(raster, "./public/outcome/outcomeRaster.tif", overwrite = TRUE)
}
# test("2022")


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

