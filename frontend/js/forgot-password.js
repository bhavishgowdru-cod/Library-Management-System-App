const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


const forgotEmail =
    document.getElementById(
        "forgotEmail"
    );


const forgotMessage =
    document.getElementById(
        "forgotMessage"
    );


const otpDemo =
    document.getElementById(
        "otpDemo"
    );


forgotPasswordForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const email =
            forgotEmail.value
                .trim()
                .toLowerCase();


        /* GET USERS */

        const users =
            JSON.parse(
                localStorage.getItem("libraryUsers")
            ) || [];


        /* FIND USER */

        const user =
            users.find(function (item) {

                return (
                    item.email.toLowerCase() ===
                    email
                );

            });


        /* USER NOT FOUND */

        if (!user) {

            forgotMessage.textContent =
                "No account found with this email.";

            forgotMessage.className =
                "auth-message text-danger";

            return;

        }


        /* GENERATE 6 DIGIT OTP */

        const otp =
            Math.floor(
                100000 +
                Math.random() * 900000
            );


        /* STORE RESET DATA */

        localStorage.setItem(
            "passwordResetEmail",
            email
        );


        localStorage.setItem(
            "passwordResetOTP",
            otp.toString()
        );


        /* OTP EXPIRY - 5 MINUTES */

        localStorage.setItem(
            "passwordResetOTPExpiry",
            (
                Date.now() +
                5 * 60 * 1000
            ).toString()
        );


        forgotMessage.textContent =
            "OTP generated successfully.";

        forgotMessage.className =
            "auth-message text-success";


        /*
           DUMMY PROJECT:
           Display OTP on screen.

           Later this can be replaced
           with real email/SMS service.
        */

        otpDemo.classList.remove(
            "d-none"
        );


        otpDemo.innerHTML =
            "Your Dummy OTP is: <strong>" +
            otp +
            "</strong>";


        /* OPEN OTP PAGE AFTER 1.5 SEC */

        setTimeout(function () {

            window.location.href =
                "verify-otp.html";

        }, 1500);

    }
);