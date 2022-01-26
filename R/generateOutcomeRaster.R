test <- function(dummy) {
  library(mongolite)
  library(sf)
  library(raster)
  library(sp)
  # library(mapview)
  
  # load the raster of each scenario
  raster_2022 <- raster("./public/ladebedarf/1_ladebedarf_rasterized_2022_EPSG_32632_newValues.tif")
  raster_2025 <- raster("./public/ladebedarf/2_ladebedarf_rasterized_2025_EPSG_32632_newValues.tif")
  raster_2030 <- raster("./public/ladebedarf/3_ladebedarf_rasterized_2030_EPSG_32632_newValues.tif")
  
  # string to connect to mongodb
  connection_string = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
  stations_collection = mongo(collection="stations", db="PTFCS-database", url=connection_string)
  
  # load all stations from database
  alldata <- stations_collection$find('{}')
  
  # if there are stations in the database, calculate the outcome raster by iterating over the stations
  if (length(alldata$type) > 0) {
    for (i in 1:length(alldata$type)) {
      
      # default variables
      hours_per_station <- 70
      hpc_factor <- 4
      
      # variables selected by user
      stationType <- (alldata$properties$StationType[i])
      numberStations <- as.numeric((alldata$properties$NumberStations[i]))
      
      # recreate the polygon of the isochrone
      values <- alldata$geometry$geometries[[i]]$coordinates[[2]]
      vector_x = c()
      vector_y = c()
      for(j in 1:(length(values)/2)){
        coordAnzahl = (length(values)/2)
        vector_x[j] = values[j + coordAnzahl]
        vector_y[j] = values[j]
      }
      xym <- cbind(vector_y, vector_x)
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
      
      # crop a new raster to the extent of the isochrone for each scenario
      rasterCropped_2022 <- mask(raster_2022, isochrone)
      rasterCropped_2025 <- mask(raster_2025, isochrone)
      rasterCropped_2030 <- mask(raster_2030, isochrone)
      # mapview(rasterCropped)
      
      # find out how many pixels are not na, because only on these pixels we want to distribute the minutes
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
      
      # calculate by how much every pixel has to be reduced
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
      rasterCropped_2022 <- rasterCropped_2022 - subtrahend_minutes_per_pixel_2022
      rasterCropped_2025 <- rasterCropped_2025 - subtrahend_minutes_per_pixel_2025
      rasterCropped_2030 <- rasterCropped_2030 - subtrahend_minutes_per_pixel_2030
      
      # values that have fallen below 0 due to the deduction must be set to 0.
      values(rasterCropped_2022)[values(rasterCropped_2022) < 0] = 0
      values(rasterCropped_2025)[values(rasterCropped_2025) < 0] = 0
      values(rasterCropped_2030)[values(rasterCropped_2030) < 0] = 0
  
      # merge the cropped raster with the changed value with the default raster
      raster_2022 <- cover(rasterCropped_2022, raster_2022)
      raster_2025 <- cover(rasterCropped_2025, raster_2025)
      raster_2030 <- cover(rasterCropped_2030, raster_2030)
    }
  }
  # save the raster
  writeRaster(raster_2022, "./public/outcome/outcomeRaster_2022.tif", overwrite = TRUE)
  writeRaster(raster_2025, "./public/outcome/outcomeRaster_2025.tif", overwrite = TRUE)
  writeRaster(raster_2030, "./public/outcome/outcomeRaster_2030.tif", overwrite = TRUE)
}
test(dummy)
