document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "changePasswordForm"
            );

        const currentPassword =
            document.getElementById(
                "currentPassword"
            );

        const newPassword =
            document.getElementById(
                "newPassword"
            );

        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );

        const messageBox =
            document.getElementById(
                "passwordMessage"
            );


        /* ==========================================
           SHOW MESSAGE
        ========================================== */

        function showMessage(
            message,
            type
        ) {

            messageBox.textContent =
                message;

            messageBox.className =
                "password-message show " + type;

        }


        /* ==========================================
           SHOW / HIDE PASSWORD
        ========================================== */

        document
            .querySelectorAll(
                ".password-toggle"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const input =
                                document.getElementById(
                                    this.dataset.target
                                );

                            const icon =
                                this.querySelector("i");


                            if (
                                input.type === "password"
                            ) {

                                input.type = "text";

                                icon.classList.remove(
                                    "bi-eye"
                                );

                                icon.classList.add(
                                    "bi-eye-slash"
                                );

                            }
                            else {

                                input.type = "password";

                                icon.classList.remove(
                                    "bi-eye-slash"
                                );

                                icon.classList.add(
                                    "bi-eye"
                                );

                            }

                        }
                    );

                }
            );


        /* ==========================================
           CHANGE PASSWORD
        ========================================== */

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const current =
                    currentPassword.value;

                const newPass =
                    newPassword.value;

                const confirmPass =
                    confirmPassword.value;


                /* EMPTY CHECK */

                if (
                    !current ||
                    !newPass ||
                    !confirmPass
                ) {

                    showMessage(
                        "Please fill all fields.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   GET CURRENT LOGGED-IN USER
                ================================== */

                const currentUser =
                    JSON.parse(
                        localStorage.getItem(
                            "currentUser"
                        )
                    );


                if (!currentUser) {

                    showMessage(
                        "No logged-in user found.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   CHECK CURRENT PASSWORD
                ================================== */

                if (
                    current !==
                    currentUser.password
                ) {

                    showMessage(
                        "Current password is incorrect.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   NEW PASSWORD CANNOT BE SAME
                ================================== */

                if (
                    newPass ===
                    currentUser.password
                ) {

                    showMessage(
                        "New password must be different from current password.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   MINIMUM PASSWORD LENGTH
                ================================== */

                if (
                    newPass.length < 8
                ) {

                    showMessage(
                        "New password must contain at least 8 characters.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   CONFIRM PASSWORD
                ================================== */

                if (
                    newPass !==
                    confirmPass
                ) {

                    showMessage(
                        "New password and confirm password do not match.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   GET ALL REGISTERED USERS
                ================================== */

                const users =
                    JSON.parse(
                        localStorage.getItem(
                            "libraryUsers"
                        )
                    ) || [];


                /* ==================================
                   FIND CURRENT USER
                ================================== */

                const userIndex =
                    users.findIndex(
                        function (user) {

                            return (
                                user.email
                                    .toLowerCase() ===
                                currentUser.email
                                    .toLowerCase()
                            );

                        }
                    );


                if (
                    userIndex === -1
                ) {

                    showMessage(
                        "User account not found.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   UPDATE PASSWORD
                ================================== */

                users[userIndex].password =
                    newPass;


                currentUser.password =
                    newPass;


                /* ==================================
                   SAVE UPDATED USERS
                ================================== */

                localStorage.setItem(
                    "libraryUsers",
                    JSON.stringify(users)
                );


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(currentUser)
                );


                showMessage(
                    "Password changed successfully.",
                    "success"
                );


                form.reset();

            }
        );

    }
);