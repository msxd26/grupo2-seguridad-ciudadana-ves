// leaflet.heat es un plugin clásico que espera `L` como variable global.
// Este módulo se importa antes que el plugin para definirla.
import L from 'leaflet'

window.L = L
