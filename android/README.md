# RunnerOS Android

V0.9: Capacitor 8 + FusedLocationProviderClient + foreground location service + persistent GPS buffer + Health Connect.

## GPS
Uruchamianie usługi musi następować podczas aktywnej, widocznej sesji treningu. Android 12+ ogranicza start foreground service z tła, a Android 14+ wymaga prawidłowego typu `location` i uprawnień.

## Health Connect
RunnerOS używa `androidx.health.connect:connect-client:1.2.0-alpha05`. Implementowane są: dostępność, zgoda użytkownika, zapis sesji/dystansu oraz odczyt tętna. Uprawnienia są sprawdzane przed użyciem.
