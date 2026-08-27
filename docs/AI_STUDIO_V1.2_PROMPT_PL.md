# Prompt do Google AI Studio – RunnerOS V1.2

Rozwijaj istniejący projekt RunnerOS, nie twórz nowego projektu od zera.

Priorytet:
1. uruchom `npm install`, `npm run typecheck`, `npm test`, `npm run build`;
2. wdroż produkcyjne endpointy z `server/API_CONTRACT_V1.2.md`;
3. JWT + refresh-token rotation;
4. PostgreSQL/PostGIS + privacy zones dla startu i końca trasy;
5. idempotentna synchronizacja offline -> online;
6. feed tylko z aktywności użytkowników, których obserwujemy;
7. kudos i comments;
8. heatmap query po bbox/zoom;
9. nearby segment matching;
10. suggested routes z provider abstraction;
11. nie usuwaj GPS/Android/Health Connect/BLE/offline.

Wymagania jakości:
- TypeScript strict.
- Walidacja wejścia i rate limiting po stronie serwera.
- Żadnych sekretów w frontendzie.
- Prywatność trasy jest domyślna; dokładne start/end maskuj w publicznych widokach.
- Każdą zmianę testuj.
- Jeśli build nie przechodzi, pokaż konkretny błąd zamiast usuwać funkcję.
