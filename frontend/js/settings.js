document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           STORAGE KEYS
        ===================================================== */

        const PROFILE_KEY =
            "libraryProfile";


        const SETTINGS_KEY =
            "librarySettings";



        /* =====================================================
           DEFAULT SETTINGS
        ===================================================== */

        const defaultSettings = {

            notificationsEnabled: true,

            dueDateReminder: true,

            overdueAlerts: true,

            bookIssueNotifications: true,

            bookReturnNotifications: true,

            theme: "light"

        };



        /* =====================================================
           GET SETTINGS
        ===================================================== */

        function getSettings() {


            const stored =
                localStorage.getItem(
                    SETTINGS_KEY
                );


            if (!stored) {

                return {
                    ...defaultSettings
                };

            }


            try {

                return {

                    ...defaultSettings,

                    ...JSON.parse(stored)

                };

            }
            catch (error) {

                return {
                    ...defaultSettings
                };

            }

        }



        /* =====================================================
           SAVE SETTINGS
        ===================================================== */

        function saveSettings(
            settings
        ) {


            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

        }



        /* =====================================================
           SETTINGS TAB NAVIGATION
        ===================================================== */

        const settingsTabs =
            document.querySelectorAll(
                ".settings-tab"
            );


        const settingsSections =
            document.querySelectorAll(
                ".settings-section"
            );


        settingsTabs.forEach(
            function (tab) {


                tab.addEventListener(
                    "click",
                    function () {


                        const target =
                            this.dataset.target;


                        settingsTabs.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        settingsSections.forEach(
                            function (section) {

                                section.classList.remove(
                                    "active"
                                );

                            }
                        );


                        this.classList.add(
                            "active"
                        );


                        const targetSection =
                            document.getElementById(
                                target
                            );


                        if (targetSection) {

                            targetSection.classList.add(
                                "active"
                            );

                        }

                    }
                );

            }
        );



        /* =====================================================
           LOAD PROFILE INFORMATION
        ===================================================== */

        function loadProfileInformation() {


            let profile = {};


            const storedProfile =
                localStorage.getItem(
                    PROFILE_KEY
                );


            if (storedProfile) {

                try {

                    profile =
                        JSON.parse(
                            storedProfile
                        );

                }
                catch (error) {

                    profile = {};

                }

            }



            const name =
                document.getElementById(
                    "settingsName"
                );


            const memberId =
                document.getElementById(
                    "settingsMemberId"
                );


            const email =
                document.getElementById(
                    "settingsEmail"
                );


            const phone =
                document.getElementById(
                    "settingsPhone"
                );


            const role =
                document.getElementById(
                    "settingsRole"
                );


            const department =
                document.getElementById(
                    "settingsDepartment"
                );


            const status =
                document.getElementById(
                    "settingsStatus"
                );



            name.value =
                profile.name ||
                "Library Administrator";


            memberId.value =
                profile.memberId ||
                "M001";


            email.value =
                profile.email ||
                "admin@library.com";


            phone.value =
                profile.phone ||
                "9876543210";


            role.value =
                profile.role ||
                "Administrator";


            department.value =
                profile.department ||
                "Library";



            const currentStatus =
                profile.accountStatus ||
                "Active";


            status.textContent =
                currentStatus;


            status.classList.remove(
                "status-active",
                "status-inactive"
            );


            if (
                currentStatus.toLowerCase() ===
                "active"
            ) {

                status.classList.add(
                    "status-active"
                );

            }
            else {

                status.classList.add(
                    "status-inactive"
                );

            }

        }



        /* =====================================================
           NOTIFICATION ELEMENTS
        ===================================================== */

        const enableNotifications =
            document.getElementById(
                "enableNotifications"
            );


        const dueDateReminder =
            document.getElementById(
                "dueDateReminder"
            );


        const overdueAlerts =
            document.getElementById(
                "overdueAlerts"
            );


        const bookIssueNotifications =
            document.getElementById(
                "bookIssueNotifications"
            );


        const bookReturnNotifications =
            document.getElementById(
                "bookReturnNotifications"
            );


        const notificationChildren =
            document.querySelectorAll(
                ".notification-child"
            );


        const saveNotificationBtn =
            document.getElementById(
                "saveNotificationBtn"
            );



        /* =====================================================
           LOAD NOTIFICATIONS
        ===================================================== */

        function loadNotificationSettings() {


            const settings =
                getSettings();


            enableNotifications.checked =
                settings.notificationsEnabled;


            dueDateReminder.checked =

                settings.dueDateReminder;


            overdueAlerts.checked =
                settings.overdueAlerts;


            bookIssueNotifications.checked =
                settings.bookIssueNotifications;


            bookReturnNotifications.checked =
                settings.bookReturnNotifications;


            updateNotificationState();

        }


function updateNotificationState() {

    const enabled =
        enableNotifications.checked;

    notificationChildren.forEach(
        function(toggle) {

            toggle.disabled =
                !enabled;

        }
    );
}

/* =====================================================
   ENABLE / DISABLE NOTIFICATIONS
===================================================== */

enableNotifications.addEventListener(
    "change",
    function () {

        const settings =
            getSettings();


        /* FIRST SAVE MASTER NOTIFICATION VALUE */

        settings.notificationsEnabled =
            this.checked;

        saveSettings(settings);


        /* THEN HANDLE CHILD OPTIONS */

        if (!this.checked) {

            dueDateReminder.checked = false;

            overdueAlerts.checked = false;

            bookIssueNotifications.checked = false;

            bookReturnNotifications.checked = false;

        }


        /* DISABLE / ENABLE CHILD SWITCHES */

        updateNotificationState();


        /* SAVE CHILD SETTINGS */

        settings.dueDateReminder =
            dueDateReminder.checked;

        settings.overdueAlerts =
            overdueAlerts.checked;

        settings.bookIssueNotifications =
            bookIssueNotifications.checked;

        settings.bookReturnNotifications =
            bookReturnNotifications.checked;


        saveSettings(settings);

    }
);
 /* =====================================================
   SAVE NOTIFICATIONS
===================================================== */

saveNotificationBtn.addEventListener(
    "click",
    function () {

        const settings =
            getSettings();


        /* SAVE MASTER SWITCH */

        settings.notificationsEnabled =
            enableNotifications.checked;


        /* IF MASTER SWITCH IS OFF */

        if (!enableNotifications.checked) {

            dueDateReminder.checked = false;

            overdueAlerts.checked = false;

            bookIssueNotifications.checked = false;

            bookReturnNotifications.checked = false;

        }


        /* SAVE CHILD SWITCHES */

        settings.dueDateReminder =
            dueDateReminder.checked;

        settings.overdueAlerts =
            overdueAlerts.checked;

        settings.bookIssueNotifications =
            bookIssueNotifications.checked;

        settings.bookReturnNotifications =
            bookReturnNotifications.checked;


        saveSettings(
            settings
        );


        showMessage(
            "Notification preferences saved successfully.",
            "success"
        );

    }
);


       /* =====================================================
   APPEARANCE
===================================================== */

const lightTheme =
    document.getElementById("lightTheme");

const darkTheme =
    document.getElementById("darkTheme");

const lightThemeCard =
    document.getElementById("lightThemeCard");

const darkThemeCard =
    document.getElementById("darkThemeCard");


function applyTheme(theme) {

    lightThemeCard.classList.remove("active");

    darkThemeCard.classList.remove("active");


    if (theme === "dark") {

        document.body.classList.add("dark-mode");

        darkTheme.checked = true;

        darkThemeCard.classList.add("active");

    }
    else {

        document.body.classList.remove("dark-mode");

        lightTheme.checked = true;

        lightThemeCard.classList.add("active");

    }

}


function changeTheme(theme) {

    const stored =
        localStorage.getItem("librarySettings");


    let settings = {};


    if (stored) {

        try {

            settings =
                JSON.parse(stored);

        }
        catch (error) {

            settings = {};

        }

    }


    settings.theme = theme;


    localStorage.setItem(
        "librarySettings",
        JSON.stringify(settings)
    );


    applyTheme(theme);

}


/* LIGHT MODE */

lightTheme.addEventListener(
    "change",
    function () {

        if (this.checked) {

            changeTheme("light");

        }

    }
);


/* DARK MODE */

darkTheme.addEventListener(
    "change",
    function () {

        if (this.checked) {

            changeTheme("dark");

        }

    }
);


/* LOAD SAVED THEME */

const savedSettings =
    JSON.parse(
        localStorage.getItem("librarySettings")
        || "{}"
    );


applyTheme(
    savedSettings.theme || "light"
);


        /* =====================================================
           LOGOUT
        ===================================================== */

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        const logoutPopup =
            document.getElementById(
                "logoutPopup"
            );


        const cancelLogoutBtn =
            document.getElementById(
                "cancelLogoutBtn"
            );


        const confirmLogoutBtn =
            document.getElementById(
                "confirmLogoutBtn"
            );



        logoutBtn.addEventListener(
            "click",
            function () {


                logoutPopup.classList.add(
                    "show"
                );

            }
        );



        cancelLogoutBtn.addEventListener(
            "click",
            function () {


                logoutPopup.classList.remove(
                    "show"
                );

            }
        );



        logoutPopup.addEventListener(
            "click",
            function (event) {


                if (
                    event.target ===
                    logoutPopup
                ) {

                    logoutPopup.classList.remove(
                        "show"
                    );

                }

            }
        );



        confirmLogoutBtn.addEventListener(
            "click",
            function () {


                localStorage.removeItem(
                    "isLoggedIn"
                );


                localStorage.removeItem(
                    "loggedInUser"
                );


                window.location.href =
                    "login.html";

            }
        );



        /* =====================================================
           MESSAGE
        ===================================================== */

        function showMessage(
            message,
            type
        ) {


            const messageBox =
                document.getElementById(
                    "settingsMessage"
                );


            messageBox.textContent =
                message;


            messageBox.className =
                "settings-message show " +
                type;


            setTimeout(
                function () {


                    messageBox.classList.remove(
                        "show"
                    );


                },
                3000
            );

        }



        /* =====================================================
           SIDEBAR TOGGLE
        ===================================================== */

        const sidebarToggle =
            document.getElementById(
                "sidebarToggle"
            );


        const sidebar =
            document.getElementById(
                "sidebar"
            );


        if (
            sidebarToggle &&
            sidebar
        ) {

            sidebarToggle.addEventListener(
                "click",
                function () {


                    sidebar.classList.toggle(
                        "sidebar-open"
                    );

                }
            );

        }



        /* =====================================================
           INITIAL LOAD
        ===================================================== */

        loadProfileInformation();


        loadNotificationSettings();


        const settings =
            getSettings();


        applyTheme(
            settings.theme
        );


    }
);