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


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const enteredEmail =
            loginEmail.value
                .trim()
                .toLowerCase();


        const enteredPassword =
            loginPassword.value;


        /* GET REGISTERED USERS */

        const users =
            JSON.parse(
                localStorage.getItem("libraryUsers")
            ) || [];


        /* NO USERS */

        if (users.length === 0) {

            loginError.textContent =
                "No account found. Please create an account.";

            return;

        }


        /* FIND USER */

        const matchedUser =
            users.find(function (user) {

                return (
                    user.email.toLowerCase() === enteredEmail &&
                    user.password === enteredPassword
                );

            });


        /* SUCCESS */

        if (matchedUser) {

            loginError.textContent = "";


            localStorage.setItem(
                "isLoggedIn",
                "true"
            );


            localStorage.setItem(
                "currentUser",
                JSON.stringify(matchedUser)
            );


            window.location.href =
                "index.html";

        }


        /* FAILED */

        else {

            loginError.textContent =
                "Invalid email or password.";

        }

    }
);