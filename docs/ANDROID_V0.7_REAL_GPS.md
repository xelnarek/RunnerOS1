# RunnerOS V0.7 — rzeczywisty Android GPS

V0.7 podłącza natywny Android `FusedLocationProviderClient` przez własny plugin Capacitor `RunnerOSLocation`.

## Przepływ

1. React `RecordScreen` wykrywa platformę Capacitor.
2. Na Androidzie wywołuje `RunnerOSLocation.start()`.
3. Plugin uruchamia `RunnerLocationService`.
4. Serwis działa jako foreground service typu `location`.
5. `FusedLocationProviderClient` dostarcza rzeczywiste `android.location.Location`.
6. Punkty są emitowane do WebView i zapisywane w natywnym buforze SharedPreferences.
7. Po wznowieniu aplikacja może odczytać bufor przez `getBufferedPoints()`.

## Parametry startowe

- target interval: 1000 ms
- minimum update interval: 750 ms
- minimum displacement: 3 m
- priority: `PRIORITY_HIGH_ACCURACY`

To są wartości startowe. Po testach terenowych powinny zostać dostrojone względem dokładności, baterii i rodzaju aktywności.

## Android 14+

Manifest deklaruje `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION` oraz `POST_NOTIFICATIONS`. Usługa ma `android:foregroundServiceType="location"`.

Start serwisu jest wykonywany z aktywnego UI. Android wymaga właściwego typu foreground service i uprawnień dla lokalizacji. 

## Co wymaga testu fizycznego

- 30–60 min biegu
- wygaszony ekran
- blokada ekranu
- battery saver
- agresywne zarządzanie procesem producenta
- utrata/odzyskanie GPS
- budynki/las
- porównanie dystansu z zegarkiem
- wpływ próbkowania na baterię

V0.7 nie generuje syntetycznych pozycji. Jeśli natywny provider nie działa, aplikacja nie powinna udawać, że działa.
