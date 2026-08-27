# Plan promptów dla AI Studio

## Prompt 1 — Audyt i uruchomienie
„Najpierw uruchom istniejący RunnerOS. Nie dodawaj funkcji. Zidentyfikuj błędy budowania, testów, zależności i architektury. Napraw tylko błędy blokujące uruchomienie.”

## Prompt 2 — Android GPS RC
„Skup się wyłącznie na natywnym GPS, foreground service, permissions, wygaszonym ekranie i odzyskiwaniu sesji. Nie zmieniaj feedu ani UI poza diagnostyką potrzebną do testów.”

## Prompt 3 — Backend RC
„Uruchom PostGIS, migracje, auth, activity sync i feed. Dodaj testy integracyjne i nie obchodź błędów konfiguracji.”

## Prompt 4 — UX premium
„Przeprowadź audyt całego UI. Zachowaj funkcje, popraw hierarchy, typography, spacing, touch targets i czytelność ekranu treningu. Nie kopiuj Stravy 1:1.”

## Prompt 5 — Mapy/segmenty/routes
„Zaimplementuj map matching, segment matching, ranking i routing jako osobne moduły. Zachowaj provider abstractions.”

## Prompt 6 — Analityka
„Dodaj training load, recovery, PB, trends i AI Coach tylko na podstawie rzeczywistych danych użytkownika. Każde wyliczenie pokaż z metodologią.”
