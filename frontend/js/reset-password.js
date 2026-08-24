/* =====================================================
   GET RESET PASSWORD ELEMENTS
===================================================== */

const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );


const newPassword =
    document.getElementById(
        "newPassword"
    );


const confirmNewPassword =
    document.getElementById(
        "confirmNewPassword"
    );


const resetMessage =
    document.getElementById(
        "resetMessage"
    );


/* =====================================================
   BLOCK DIRECT ACCESS
===================================================== */

if (
    localStorage.getItem("otpVerified") !== "true"
) {

    window.location.href =
        "forgot-password.html";

}


/* =====================================================
   RESET PASSWORD FORM
===================================================== */

resetPasswordForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /* =================================================
           GET PASSWORD VALUES
        ================================================= */

        const password =
            newPassword.value;


        const confirmPassword =
            confirmNewPassword.value;


        /* =================================================
           PASSWORD RULE
        ================================================= */

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;


        if (
            !passwordPattern.test(password)
        ) {

            resetMessage.textContent =
                "Password must contain uppercase, lowercase, number, special character and minimum 8 characters.";

            resetMessage.className =
                "auth-message text-danger";

            return;

        }


        /* =================================================
           CONFIRM PASSWORD
        ================================================= */

        if (
            password !== confirmPassword
        ) {

            resetMessage.textContent =
                "Password and Confirm Password do not match.";

            resetMessage.className =
                "auth-message text-danger";

            return;

        }


        /* =================================================
           GET RESET EMAIL
        ================================================= */

        const resetEmail =
            localStorage.getItem(
                "passwordResetEmail"
            );


        /* =================================================
           CHECK RESET EMAIL EXISTS
        ================================================= */

        if (!resetEmail) {

            resetMessage.textContent =
                "Reset session expired. Please try Forgot Password again.";

            resetMessage.className =
                "auth-message text-danger";

            return;

        }


        /* =================================================
           GET REGISTERED USERS
        ================================================= */

        const users =
            JSON.parse(
                localStorage.getItem(
                    "libraryUsers"
                )
            ) || [];


        /* =================================================
           CHECK USERS EXIST
        ================================================= */

        if (users.length === 0) {

            resetMessage.textContent =
                "No registered users found.";

            resetMessage.className =
                "auth-message text-danger";

            return;

        }


        /* =================================================
           FIND USER
        ================================================= */

        const userIndex =
            users.findIndex(
                function (user) {

                    return (
                        user.email &&
                        user.email.toLowerCase() ===
                        resetEmail.toLowerCase()
                    );

                }
            );


        /* =================================================
           USER NOT FOUND
        ================================================= */

        if (userIndex === -1) {

            resetMessage.textContent =
                "User account not found.";

            resetMessage.className =
                "auth-message text-danger";

            return;

        }


        /* =================================================
           UPDATE PASSWORD
        ================================================= */

        users[userIndex].password =
            password;


        /* =================================================
           SAVE UPDATED USERS
        ================================================= */

        localStorage.setItem(
            "libraryUsers",
            JSON.stringify(users)
        );


        /* =================================================
           CLEAR RESET DATA
        ================================================= */

        localStorage.removeItem(
            "passwordResetOTP"
        );


        localStorage.removeItem(
            "passwordResetOTPExpiry"
        );


        localStorage.removeItem(
            "passwordResetEmail"
        );


        localStorage.removeItem(
            "otpVerified"
        );


        /* =================================================
           SUCCESS MESSAGE
        ================================================= */

        resetMessage.textContent =
            "Password changed successfully. Redirecting to login...";

        resetMessage.className =
            "auth-message text-success";


        /* =================================================
           CLEAR INPUTS
        ================================================= */

        newPassword.value = "";

        confirmNewPassword.value = "";


        /* =================================================
           OPEN LOGIN PAGE
        ================================================= */

        setTimeout(
            function () {

                window.location.href =
                    "login.html";

            },
            1000
        );

    }
);