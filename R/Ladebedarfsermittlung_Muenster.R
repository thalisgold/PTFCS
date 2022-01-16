# Projekt PTCS
# Umrechnung der StandortTOOL Skala in Ladestunden anhand von Muenster
# PKWs, die Ladesäulen benötigen:
                             # 01.01.2021: 1599 + 1182 = 2781
                             # 01.07.2021: 2048 + 1834 = 3882 (Zuwachs: 1101)
                             # Prognose fuer 01.01.2022: 3882 + vorherigen Zuwachs -> ca. 5000 PKWs

rm(list=ls()) # remove all variables from current environment
library(raster)
library(sf)

# set working directory
setwd("C:/Users/thali/Documents/GitHub/PTFCS/Daten StandortTOOL Szenarien")

# load Muenster
muenster <- st_read("Muenster_Flaeche_2022.gpkg")

# Gewichtete Berechung der Stunden pro Pixel fuer Muenster
# Die Flaeche wird fuer jedes Polygon ausgelesen und mit dem Potenzial multipliziert (deswegen gewichtet)
flaeche <- 0
for (i in 1:416) {
  flaeche <- flaeche + (muenster$area[i] * muenster$Potenzial[i])
}
flaeche

# Ein Pixel ist 10m x 10m groß. Folglich, muss man die berechnete Flaeche durch 100 teilen, um auf die Anzahl der Pixel zu kommen.
anzahl_pixel <- flaeche/100
anzahl_pixel

ladebedarf_pro_woche_in_stunden <- 10937.5   # hier den ermittelten Bedarf an Ladestunden pro Woche für Muenster eintragen (5000 PKWs *2,1875h = 10.937,5h) 

ladebedarf_pro_woche_pro_pixel_in_stunden <- ladebedarf_pro_woche_in_stunden/anzahl_pixel # (für Potenzial = 1)
ladebedarf_pro_woche_pro_pixel_in_minuten <- ladebedarf_pro_woche_pro_pixel_in_stunden * 60 # (für Potenzial = 1)
# Gibt nun den Bedarf an Ladestunden für eines unserer Pixel an,
# wenn im StandortTOOL für den Ladebedarf das Potenzial 1 angegeben ist.
# Für den Wert 2 des StandortTOOL ergibt sich damit: Potenzial = 2 -> 2 * ladebedarf_pro_pixel_in_stunden
# Für die weiteren Werte analog.