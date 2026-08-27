# Prompt do Google AI Studio — RunnerOS V1.6

Pracuj na istniejącym projekcie RunnerOS. Nie zaczynaj od zera.

Cele:
1. uruchom `npm ci`, `npm run preflight`, `npm run verify`, `npm run typecheck`, `npm test`, `npm run build`;
2. nie usuwaj funkcji w celu obejścia błędu;
3. uruchom backend w Docker Compose i sprawdź `/health`, w tym `postgis=true`;
4. wykonaj `npx cap sync android` i sprawdź projekt Android;
5. sprawdź manifest, foreground service location, permissions i pluginy Capacitor;
6. utwórz debug APK tylko po przejściu preflight/typecheck/test/build;
7. nie twierdź, że GPS terenowy działa, dopóki aplikacja nie zostanie uruchomiona na fizycznym urządzeniu;
8. zachowaj offline-first, realny FusedLocationProviderClient, BLE HR, Health Connect i PostGIS;
9. raportuj każdy błąd jako: plik → linia → przyczyna → poprawka → test regresyjny.
