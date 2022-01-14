# Projekt PTCS
# Umrechnung der StandortTOOL Skala in Ladestunden anhand von Gievenbeck

rm(list=ls()) # remove all variables from current environment
library(raster)
library(sf)

# set working directory
setwd("C:/Users/lgits/sciebo/Uni_Geoinfo/A2_Studienprojekt_Aufladen/Projekt/PTFCS/Daten StandortTOOL Szenarien/gpkg und andere EPSG codes")

# load Gievenbeck
gievenbeck <- st_read("Gievenbeck2022_Flaeche.gpkg")

# Berechung des Gesamtpotenzials für Gievenbeck
gesamtpotenzial <- 0
for (i in 1:19) {
  numberPixels <- ((gievenbeck$Flaeche[i])/100)  # Flaeche durch 100 teilen, da ein Pixel 10mx10m groß ist
  potenzial <- numberPixels * (gievenbeck$Potenzial[i])
  gesamtpotenzial <- (gesamtpotenzial + potenzial)
}
gesamtpotenzial

# Umrechnung in Stunden pro Wert 1 des StandortTOOls pro Pixel (klein/eigene)
bedarf_std <- 358.75   # ermittelter Bedarf an Ladestunden für Gievenbeck
                    # (übernommen aus dem Projekt von Dominik Zubel + Dominik Waldmann)
wert1_Std <- bedarf_std/gesamtpotenzial
wert1_Std
wert1_min <- wert1_Std*60
wert1_min
# wert1_Std/wert1_min gibt nun den Bedarf an Ladestunden/-minuten für eines unserer Pixel an,
# wenn im StandortTOOL fuer den Ladebedarf der Wert 1 angegeben ist.
# Fuer den Wert 2 des StandortTOOL ergibt sich damit: wert2 = 2 * wert1
# Fuer die weiteren Werte analog.