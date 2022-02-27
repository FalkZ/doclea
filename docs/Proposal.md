Doclea ist eine Web-Applikation um Dokumente zu erstellen und gemeinsam zu bearbeiten. Der Editor ermöglicht das Erstellen von Markdown-Dokumenten mit grafischer Oberfläche und besitzt eine einfache Handzeichnungsfunktion. Doclea soll eine Opensource Alternative zu OneNote und Notion sein.

Technisches:

- Doclea wird in Typescript entwickelt
- Doclea wird nicht komplett neu entwickelt, sondern baut auf bestehenden Projekten auf:
- Markdown Editor: https://github.com/Saul-Mirone/milkdown
- Handzeichnungs Editor: https://github.com/tldraw/tldraw
- Doclea soll ohne Backend-Server auskommen, um dies zu erreichen wird ein Storageframework entwickelt.
- Das Storageframework besteht aus einer File API (Interface) welche das Verhalten eines Linux Filesystems imitiert.
- Für diese File API werden verschiedene Implementationen für verschiedene Backends erstellt, dazu gehören:
  - Browser: File and Directory Entries API https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API
  - Solid https://solidproject.org/
  - Github API https://docs.github.com/en/rest
- Das Storageframework soll generisch designt werden, so dass es für weitere Projekte und Implementationen verwendet werden kann.

Doclea ist Einzigartig weil:

- Es die Kontrolle über seine persönlichen Daten und Dokumente ermöglicht, dies dank Solid und der vielseitigen Storageframework.
- Doclea im Gegensatz, zu den oben erwähnten Tools, komplett Opensource ist.
- Doclea einfach zu bedienen und nicht überladen mit unnützen Funktionen ist.
- Doclea browserbasiert ist und dadurch keine Installation notwendig ist.
- Doclea ermöglicht das Bearbeiten von Dokumenten ohne sich bei einer Platform zu registrieren.
- Doclea Dokumente sind Plain Text, dies ermöglicht die Versionskontrolle mit Git.
