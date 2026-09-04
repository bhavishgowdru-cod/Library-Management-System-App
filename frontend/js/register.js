const registerForm = document.getElementById("registerForm");

const firstName = document.getElementById("firstName");
const middleName = document.getElementById("middleName");
const lastName = document.getElementById("lastName");
const dob = document.getElementById("dob");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");

const registerMessage = document.getElementById("registerError");


registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const firstNameValue = firstName.value.trim();

    // Middle name is optional
    const middleNameValue = middleName.value.trim();

    const lastNameValue = lastName.value.trim();

    const dobValue = dob.value;

    const emailValue = registerEmail.value
        .trim()
        .toLowerCase();

    const passwordValue = registerPassword.value;

    const confirmPasswordValue = confirmPassword.value;


    // PASSWORD VALIDATION

    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;


    if (!passwordPattern.test(passwordValue)) {

        registerMessage.textContent =
            "Password must contain uppercase, lowercase, number and special character.";

        registerMessage.className =
            "login-message text-danger mb-3";

        return;
    }


    // CONFIRM PASSWORD VALIDATION

    if (passwordValue !== confirmPasswordValue) {

        registerMessage.textContent =
            "Password and Confirm Password do not match.";

        registerMessage.className =
            "login-message text-danger mb-3";

        return;
    }


    // CREATE FULL NAME
    // Middle name optional hai

    const fullName = [
        firstNameValue,
        middleNameValue,
        lastNameValue
    ]
        .filter(Boolean)
        .join(" ");


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/register/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: fullName,

                    email: emailValue,

                    dob: dobValue,

                    password: passwordValue

                })

            }
        );


        const data = await response.json();


        if (data.success) {

            registerMessage.textContent =
                "Account created successfully.";

            registerMessage.className =
                "login-message text-success mb-3";


            registerForm.reset();


            setTimeout(function () {

                window.location.href =
                    "login.html";

            }, 1000);

        }

        else {

            registerMessage.textContent =
                data.message || "Registration failed.";

            registerMessage.className =
                "login-message text-danger mb-3";

        }

    }

    catch (error) {

        console.error(error);

        registerMessage.textContent =
            "Unable to connect to server.";

        registerMessage.className =
            "login-message text-danger mb-3";

    }

});