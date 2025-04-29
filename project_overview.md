# Project Overview

This document provides a brief description of each file in the project.

*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `configModal.js`: Handles the display and interaction of the application's configuration modal.
*   `configStorage.js`: Manages saving and loading application configuration using the browser's localStorage.
*   `csv.js`: Contains utility functions for importing and exporting data in CSV format.
*   `database.js`: Provides an abstraction layer for interacting with the selected data storage provider, handling different ID formats.
*   `dataStorageInterface.js`: Defines the standard interface that all data storage providers must implement.
*   `index.html`: The main HTML file that structures the application's user interface.
*   `indexedDBProvider.js`: Implements the data storage interface using the browser's IndexedDB.
*   `jsonBinConfigUI.js`: Manages the user interface elements for configuring the JSONBin.io data provider.
*   `jsonBinProvider.js`: Implements the data storage interface using the JSONBin.io online service.
*   `leaflet.css`: Provides the necessary CSS styles for the Leaflet interactive map library.
*   `leaflet.js`: Contains the core JavaScript code for the Leaflet interactive map library.
*   `main.js`: The primary script that initializes the application and ties different modules together.
*   `map.js`: Handles the creation, display, and interaction logic for the geographical map, including handling of different data provider ID formats for deletion.
*   `modals.js`: Manages the general behavior and state of various modal dialogs within the application.
*   `papaparse.min.js`: A minified third-party library used for parsing CSV data efficiently.
*   `plan_online_storage.md`: A markdown document outlining future plans or notes regarding online data storage solutions.
*   `readme.md`: The main documentation file providing an introduction and setup instructions for the project.
*   `style.css`: Contains the custom CSS rules for styling the application's visual appearance.
*   `things.json`: A JSON file potentially used for storing default or example data for the application.
*   `thingsConfig.js`: Holds configuration settings specifically related to the "things" or items being tracked.
*   `images/`: This directory contains image assets used by the application, such as map markers and control icons.