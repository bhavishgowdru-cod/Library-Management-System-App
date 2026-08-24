const otpForm =
    document.getElementById("otpForm");

const otpInput =
    document.getElementById("otp");

const otpMessage =
    document.getElementById("otpMessage");


otpForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const enteredOtp =
            otpInput.value.trim();


        const savedOtp =
            localStorage.getItem(
                "passwordResetOTP"
            );


        const expiry =
            Number(
                localStorage.getItem(
                    "passwordResetOTPExpiry"
                )
            );


        /* OTP NOT FOUND */

        if (!savedOtp) {

            otpMessage.textContent =
                "OTP not found. Please request a new OTP.";

            otpMessage.className =
                "auth-message text-danger";

            return;
        }


        /* OTP EXPIRED */

        if (Date.now() > expiry) {

            otpMessage.textContent =
                "OTP expired. Please request a new OTP.";

            otpMessage.className =
                "auth-message text-danger";

            return;
        }


        /* OTP MATCHED */

        if (enteredOtp === savedOtp) {

            otpMessage.textContent =
                "OTP verified successfully.";

            otpMessage.className =
                "auth-message text-success";


            /* SAVE VERIFICATION STATUS */

            localStorage.setItem(
                "otpVerified",
                "true"
            );


            /* OPEN RESET PASSWORD PAGE */

            setTimeout(function () {

                window.location.href =
                    "reset-password.html";

            }, 500);

        }


        /* WRONG OTP */

        else {

            otpMessage.textContent =
                "Invalid OTP.";

            otpMessage.className =
                "auth-message text-danger";

        }

    }
);