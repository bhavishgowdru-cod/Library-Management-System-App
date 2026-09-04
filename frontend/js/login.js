/* =====================================================
   LOGIN ELEMENTS
===================================================== */

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginError =
    document.getElementById("loginError");

const togglePassword =
    document.getElementById("togglePassword");


/* =====================================================
   SHOW / HIDE PASSWORD
===================================================== */

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            const isPassword =
                loginPassword.type === "password";

            loginPassword.type =
                isPassword
                    ? "text"
                    : "password";

            const icon =
                togglePassword.querySelector("i");

            icon.className =
                isPassword
                    ? "bi bi-eye-slash"
                    : "bi bi-eye";

        }
    );

}


/* =====================================================
   LOGIN API
===================================================== */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const enteredEmail =
            loginEmail.value.trim().toLowerCase();

        const enteredPassword =
            loginPassword.value;


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/login/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: enteredEmail,
                        password: enteredPassword
                    })
                }
            );


            const data = await response.json();


            if (data.success) {

                loginError.textContent =
                    "Login successful.";

                loginError.className =
                    "login-message text-success";


                setTimeout(function () {

                    window.location.href =
                        "index.html";

                }, 500);

            }

            else {

                loginError.textContent =
                    data.message ||
                    "Invalid email or password.";

                loginError.className =
                    "login-message text-danger";

            }

        }

        catch (error) {

            console.error(error);

            loginError.textContent =
                "Unable to connect to server. Please make sure Django server is running.";

            loginError.className =
                "login-message text-danger";

        }

    }
);