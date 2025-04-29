# Project Overview

This document provides a brief description of each file in the project.

*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `index.html`: The main HTML file that structures the application's user interface.
*   `readme.md`: The main documentation file providing an introduction and setup instructions for the project.
*   `things.json`: A JSON file potentially used for storing default or example data for the application.
*   `project_overview.md`: This document provides a brief description of each file in the project.
*   `tasks/`: This directory contains markdown documents outlining tasks and plans.
*   `tasks/distribute_files_into_directories.md`: Outlines the plan for organizing project files into a new directory structure.
*   `tasks/fix_small_modal_edit.md`: Outlines the task and plan for fixing the edit option in the small marker modal.
    *   `tasks/update_js_imports_exports.md`: Describes the task of updating JavaScript import and export paths after file distribution.
*   `images/`: This directory contains image assets used by the application, such as map markers and control icons.
*   `css/`: This directory contains CSS files.
    *   `css/leaflet.css`: Provides the necessary CSS styles for the Leaflet interactive map library.
    *   `css/style.css`: Contains the custom CSS rules for styling the application's visual appearance.
*   `js/`: This directory contains JavaScript files.
    *   `js/main.js`: The primary script that initializes the application and ties different modules together, including setting up the data refresh callback.
    *   `js/map.js`: Handles the creation, display, and interaction logic for the geographical map, including handling of different data provider ID formats for deletion and using thing color for markers.
    *   `js/thingsConfig.js`: Holds configuration settings specifically related to the "things" or items being tracked, including default colors for thing types.
    *   `js/providers/`: This directory contains JavaScript files for data storage providers.
        *   `js/providers/dataStorageInterface.js`: Defines the standard interface that all data storage providers must implement.
        *   `js/providers/indexedDBProvider.js`: Implements the data storage interface using the browser's IndexedDB, now supporting storage of thing colors.
        *   `js/providers/jsonBinProvider.js`: Implements the data storage interface using the JSONBin.io online service, now supporting storage of thing colors, generating string IDs, and handling automatic data refresh.
    *   `js/ui/`: This directory contains JavaScript files for user interface components.
        *   `js/ui/configModal.js`: Handles the display and interaction of the application's configuration modal, including loading and displaying saved provider configurations.
        *   `js/ui/jsonBinConfigUI.js`: Manages the user interface elements for configuring the JSONBin.io data provider, including auto-refresh settings.
        *   `js/ui/modals.js`: Manages the general behavior and state of various modal dialogs within the application, now including a color picker for things and fixes for editing existing things and displaying their color.
    *   `js/utils/`: This directory contains utility JavaScript functions.
        *   `js/utils/configStorage.js`: Manages saving and loading application configuration using the browser's localStorage.
        *   `js/utils/csv.js`: Contains utility functions for importing and exporting data in CSV format.
        *   `js/utils/database.js`: Provides an abstraction layer for interacting with the selected data storage provider, handling different ID formats, thing colors, and managing the data refresh callback.
    *   `js/vendor/`: This directory contains third-party vendor JavaScript files.
        *   `js/vendor/leaflet.js`: Contains the core JavaScript code for the Leaflet interactive map library.
        *   `js/vendor/papaparse.min.js`: A minified third-party library used for parsing CSV data efficiently.
    *   `plan_online_storage.md`: A markdown document outlining future plans or notes regarding online data storage solutions.
    *   `tasks/add_color_to_things.md`: Outlines the task and plan for adding color configuration to things.
    *   `tasks/implement_jsonbin_auto_refresh.md`: Outlines the task and plan for implementing automatic data refresh from JSONBin.io.