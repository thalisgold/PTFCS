# Projekt PTCS
# Umrechnung der StandortTOOL Skala in Ladestunden anhand von Gievenbeck

rm(list=ls()) # remove all variables from current environment
library(raster)
library(sf)

# set working directory
setwd("C:/Users/lgits/sciebo/Uni_Geoinfo/A2_Studienprojekt_Aufladen/Projekt/PTFCS/Daten StandortTOOL Szenarien")

# load Gievenbeck
gievenbeck <- st_read("GievenbeckFlaeche.gpkg")

# Berechung des Gesamtpotenzials für Gievenbeck
gesamtpotenzial <- 0
for (i in 1:19) {
  numberPixels <- ((gievenbeck$Flaeche[i])/100)  # Fläche durch 100 teilen, da ein Pixel 10mx10m groß ist
  potenzial <- numberPixels * (gievenbeck$Potenzial[i])
  gesamtpotenzial <- (gesamtpotenzial + potenzial)
}
gesamtpotenzial

# Umrechnung in Stunden pro Wert 1 des StandortTOOls pro Pixel (klein/eigene)
bedarf_std <- 136   # hier den ermittelten Bedarf an Ladestunden für Gievenbeck eintragen
wert1 <- bedarf_std/gesamtpotenzial
wert1
# wert1 gibt nun den Bedarf an Ladestunden für eines unserer Pixel an,
# wenn im StandortTOOL für den Ladebedarf der Wert 1 angegeben ist.
# Für den Wert 2 des StandortTOOL ergibt sich damit: wert2 = 2 * wert1
# Für die weiteren Werte analog.