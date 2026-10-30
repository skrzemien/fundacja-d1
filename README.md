# Ćwiczenia praktyczne – Moduł 1: Obsługa komputera

Interaktywne ćwiczenia do modułu 1 kursu „Kompetencje cyfrowe i bezpieczeństwo online” (InvertArt IFG).
Dziewięć ćwiczeń, około 60 minut, maksymalnie 225 punktów.

Strona jest napisana w czystym HTML, CSS i JavaScript. Nie wymaga instalacji, budowania ani zewnętrznych bibliotek i działa także offline (wystarczy otworzyć `index.html` w przeglądarce).

## Struktura

```
index.html          strona główna
assets/style.css    wygląd (tryb jasny i ciemny)
assets/script.js    logika ćwiczeń
.nojekyll           wyłącza przetwarzanie Jekyll na GitHub Pages
```

## Publikacja na GitHub Pages

1. Utwórz nowe repozytorium na GitHubie (może być publiczne), np. `cwiczenia-modul-1`.
2. Wgraj do niego całą zawartość tego folderu: **Add file → Upload files**, przeciągnij pliki i folder `assets`, potem **Commit changes**.
   Plik `.nojekyll` jest ukryty w niektórych systemach – jeśli go nie widać, można go pominąć, strona zadziała bez niego.
3. Wejdź w **Settings → Pages**.
4. W sekcji **Build and deployment** wybierz **Source: Deploy from a branch**, gałąź **main** i folder **/ (root)**, potem **Save**.
5. Po 1–2 minutach strona będzie dostępna pod adresem
   `https://NAZWA-UZYTKOWNIKA.github.io/cwiczenia-modul-1/`

## Uwagi

- Wyniki uczestników zapisują się lokalnie w ich przeglądarce (localStorage). Nic nie jest wysyłane na serwer.
- Ćwiczenie „Skróty klawiaturowe” wymaga fizycznej klawiatury.
- Ścieżki w ćwiczeniu „Ustawienia systemu” dotyczą Windows 11.
- Treść ćwiczeń (pytania, pliki, komunikaty) znajduje się w `assets/script.js` w tablicach `QWIN`, `QNAMES`, `QFAKE`, `SQ` i `QGOV` oraz w funkcjach `stFiles` i `stInstall`.
