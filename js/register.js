const registerForm = document.getElementById("registerForm");

const firstName = document.getElementById("firstName");
const middleName = document.getElementById("middleName");
const lastName = document.getElementById("lastName");
const dob = document.getElementById("dob");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");
const registerMessage = document.getElementById("registerMessage");


registerForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const firstNameValue = firstName.value.trim();
    const middleNameValue = middleName.value.trim();
    const lastNameValue = lastName.value.trim();

    const dobValue = dob.value;

    const emailValue =
        registerEmail.value.trim().toLowerCase();

    const passwordValue =
        registerPassword.value;

    const confirmPasswordValue =
        confirmPassword.value;


    /* PASSWORD RULE */

    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;


    if (!passwordPattern.test(passwordValue)) {

        registerMessage.textContent =
            "Password must contain uppercase, lowercase, number and special character.";

        registerMessage.className =
            "text-danger mb-3";

        return;
    }


    /* CONFIRM PASSWORD */

    if (passwordValue !== confirmPasswordValue) {

        registerMessage.textContent =
            "Password and Confirm Password do not match.";

        registerMessage.className =
            "text-danger mb-3";

        return;
    }


    /* GET EXISTING USERS */

    const users =
        JSON.parse(
            localStorage.getItem("libraryUsers")
        ) || [];


    /* CHECK EMAIL */

    const existingUser =
        users.find(function (user) {

            return user.email === emailValue;

        });


    if (existingUser) {

        registerMessage.textContent =
            "Account already exists with this email.";

        registerMessage.className =
            "text-danger mb-3";

        return;
    }


    /* CREATE USER */

    const newUser = {

        firstName: firstNameValue,

        middleName: middleNameValue,

        lastName: lastNameValue,

        dob: dobValue,

        email: emailValue,

        password: passwordValue

    };


    /* ADD USER */

    users.push(newUser);


    /* SAVE USER */

    localStorage.setItem(
        "libraryUsers",
        JSON.stringify(users)
    );


    registerMessage.textContent =
        "Account created successfully.";

    registerMessage.className =
        "text-success mb-3";


    /* OPEN LOGIN PAGE */

    setTimeout(function () {

        window.location.href =
            "login.html";

    }, 1000);

});