/* =========================================================
   LMS
   RETURN DATE EXTENSION REQUEST FEATURE
========================================================= */


(function () {

    "use strict";



    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const EXTENSION_KEYS = {

        issues:
            "libraryIssues",

        requests:
            "libraryExtensionRequests",

        notifications:
            "notifications",

        currentUser:
            "currentUser",

        profile:
            "libraryProfile"

    };



    /* =====================================================
       >>> LOCAL STORAGE <<<
       READ DATA
    ===================================================== */

    function readStorage(
        key,
        fallback
    ) {

        try {


            // >>> LOCAL STORAGE <<<

            const value =
                localStorage.getItem(
                    key
                );


            if (!value) {

                return fallback;

            }


            return JSON.parse(
                value
            );


        } catch (error) {


            console.error(
                "LocalStorage read error:",
                error
            );


            return fallback;

        }

    }



    /* =====================================================
       >>> LOCAL STORAGE <<<
       SAVE DATA
    ===================================================== */

    function writeStorage(
        key,
        value
    ) {


        // >>> LOCAL STORAGE <<<

        localStorage.setItem(

            key,

            JSON.stringify(
                value
            )

        );


        window.dispatchEvent(

            new CustomEvent(

                "libraryDataChanged",

                {

                    detail: {

                        key: key

                    }

                }

            )

        );

    }



    /* =====================================================
       ISSUES
    ===================================================== */

    function getIssues() {


        const issues =
            readStorage(

                EXTENSION_KEYS.issues,

                []

            );


        return Array.isArray(
            issues
        )
            ? issues
            : [];

    }



    function saveIssues(
        issues
    ) {


        // >>> LOCAL STORAGE <<<

        writeStorage(

            EXTENSION_KEYS.issues,

            issues

        );

    }



    /* =====================================================
       REQUESTS
    ===================================================== */

    function getRequests() {


        const requests =
            readStorage(

                EXTENSION_KEYS.requests,

                []

            );


        return Array.isArray(
            requests
        )
            ? requests
            : [];

    }



    function saveRequests(
        requests
    ) {


        // >>> LOCAL STORAGE <<<

        writeStorage(

            EXTENSION_KEYS.requests,

            requests

        );

    }



    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    function getNotifications() {


        const data =
            readStorage(

                EXTENSION_KEYS.notifications,

                []

            );


        return Array.isArray(
            data
        )
            ? data
            : [];

    }



    function saveNotifications(
        notifications
    ) {


        // >>> LOCAL STORAGE <<<

        writeStorage(

            EXTENSION_KEYS.notifications,

            notifications

        );

    }



    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {


        return String(
            value ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }



    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatDate(
        date
    ) {


        if (!date) {

            return "-";

        }


        const parts =
            String(date)
                .split("-");


        if (
            parts.length === 3
        ) {

            return (

                parts[2] +
                "-" +
                parts[1] +
                "-" +
                parts[0]

            );

        }


        return date;

    }



    /* =====================================================
       TODAY
    ===================================================== */

    function today() {


        const date =
            new Date();


        const year =
            date.getFullYear();


        const month =
            String(

                date.getMonth() + 1

            ).padStart(
                2,
                "0"
            );


        const day =
            String(

                date.getDate()

            ).padStart(
                2,
                "0"
            );


        return (

            year +
            "-" +
            month +
            "-" +
            day

        );

    }



    /* =====================================================
       REQUEST ID
    ===================================================== */

    function generateRequestId() {


        return (

            "ER" +
            Date.now()

        );

    }



    /* =====================================================
       CURRENT USER
    ===================================================== */

    function getCurrentIdentity() {


        // >>> LOCAL STORAGE <<<

        const currentUser =
            readStorage(

                EXTENSION_KEYS.currentUser,

                {}

            );


        // >>> LOCAL STORAGE <<<

        const profile =
            readStorage(

                EXTENSION_KEYS.profile,

                {}

            );


        let source = {};


        if (
            currentUser &&
            typeof currentUser ===
                "object" &&
            Object.keys(
                currentUser
            ).length
        ) {

            source =
                currentUser;

        } else {

            source =
                profile || {};

        }



        return {


            memberId:

                source.memberId ||

                source.id ||

                source.userId ||

                "",


            name:

                source.name ||

                source.fullName ||

                source.firstName ||

                "Borrower",


            role:

                String(

                    source.role ||

                    "Borrower"

                )

        };

    }



    /* =====================================================
       CHECK ADMIN
    ===================================================== */

    function isAdministrator(
        identity
    ) {


        const role =
            String(

                identity.role || ""

            ).toLowerCase();


        return (

            role.includes(
                "administrator"
            ) ||

            role.includes(
                "admin"
            ) ||

            role.includes(
                "management"
            )

        );

    }



    /* =====================================================
       CREATE NOTIFICATION
    ===================================================== */

    function createNotification(

        title,

        description,

        type,

        referenceId,

        memberId

    ) {


        let notifications =
            getNotifications();



        const alreadyExists =
            notifications.some(

                function (
                    notification
                ) {


                    return (

                        notification.type ===
                            type &&

                        notification.referenceId ===
                            referenceId

                    );

                }

            );



        if (
            alreadyExists
        ) {

            return;

        }



        const notification = {


            id:
                Date.now(),


            type:
                type,


            title:
                title,


            description:
                description,


            referenceId:
                referenceId,


            memberId:
                memberId || null,


            date:
                new Date()
                    .toLocaleString(),


            read:
                false

        };



        notifications.unshift(
            notification
        );



        // >>> LOCAL STORAGE <<<

        saveNotifications(
            notifications
        );



        /* =============================================
           EXISTING NOTIFICATION PANEL
        ============================================== */

        if (

            typeof
            window.displayNotifications ===
            "function"

        ) {


            window.displayNotifications();

        }



        /* =============================================
           EXISTING NOTIFICATION SOUND
        ============================================== */

        if (

            typeof
            window.playNotificationSound ===
            "function"

        ) {


            window.playNotificationSound();

        }

    }



    /* =====================================================
       ELEMENTS
    ===================================================== */

    const extensionRequestForm =
        document.getElementById(
            "extensionRequestForm"
        );


    if (
        !extensionRequestForm
    ) {

        return;

    }



    const extensionViewMode =
        document.getElementById(
            "extensionViewMode"
        );


    const borrowerPanel =
        document.getElementById(
            "borrowerPanel"
        );


    const adminPanel =
        document.getElementById(
            "adminPanel"
        );


    const requestIssue =
        document.getElementById(
            "requestIssue"
        );


    const currentReturnDate =
        document.getElementById(
            "currentReturnDate"
        );


    const requestedReturnDate =
        document.getElementById(
            "requestedReturnDate"
        );


    const requestReason =
        document.getElementById(
            "requestReason"
        );


    const borrowerRequestTableBody =
        document.getElementById(
            "borrowerRequestTableBody"
        );


    const adminRequestList =
        document.getElementById(
            "adminRequestList"
        );


    const adminStatusFilter =
        document.getElementById(
            "adminStatusFilter"
        );


    const requestNavbarBadge =
        document.getElementById(
            "requestNavbarBadge"
        );


    const pendingRequestCount =
        document.getElementById(
            "pendingRequestCount"
        );


    const approvedRequestCount =
        document.getElementById(
            "approvedRequestCount"
        );


    const rejectedRequestCount =
        document.getElementById(
            "rejectedRequestCount"
        );


    const totalRequestCount =
        document.getElementById(
            "totalRequestCount"
        );


    const decisionModalElement =
        document.getElementById(
            "requestDecisionModal"
        );


    const decisionModal =
        new bootstrap.Modal(
            decisionModalElement
        );


    const decisionModalTitle =
        document.getElementById(
            "decisionModalTitle"
        );


    const decisionRequestSummary =
        document.getElementById(
            "decisionRequestSummary"
        );


    const approvedDateGroup =
        document.getElementById(
            "approvedDateGroup"
        );


    const approvedReturnDate =
        document.getElementById(
            "approvedReturnDate"
        );


    const adminMessage =
        document.getElementById(
            "adminMessage"
        );


    const confirmDecisionBtn =
        document.getElementById(
            "confirmDecisionBtn"
        );


    const extensionToast =
        document.getElementById(
            "extensionToast"
        );



    let activeRequestId =
        null;


    let activeDecision =
        null;



    /* =====================================================
       INITIAL ROLE
    ===================================================== */

    function setInitialView() {


        const identity =
            getCurrentIdentity();


        if (
            isAdministrator(
                identity
            )
        ) {

            extensionViewMode.value =
                "admin";

        } else {

            extensionViewMode.value =
                "borrower";

        }


        applyViewMode();

    }



    /* =====================================================
       SWITCH BORROWER / ADMIN
    ===================================================== */

    function applyViewMode() {


        const adminMode =
            extensionViewMode.value ===
            "admin";


        borrowerPanel.classList.toggle(

            "d-none",

            adminMode

        );


        adminPanel.classList.toggle(

            "d-none",

            !adminMode

        );


        renderEverything();

    }



    extensionViewMode.addEventListener(

        "change",

        applyViewMode

    );



    /* =====================================================
       GET ISSUED BOOKS
    ===================================================== */

    function getIssuedBooks() {


        const identity =
            getCurrentIdentity();


        const issues =
            getIssues();


        const issuedBooks =
            issues.filter(

                function (
                    issue
                ) {


                    return (

                        String(
                            issue.status
                        ).toLowerCase() ===
                        "issued"

                    );

                }

            );



        /*
           If logged in member ID exists,
           show their issued books.
        */

        if (
            identity.memberId
        ) {


            const memberBooks =
                issuedBooks.filter(

                    function (
                        issue
                    ) {


                        return (

                            String(
                                issue.memberId
                            ) ===

                            String(
                                identity.memberId
                            )

                        );

                    }

                );


            if (
                memberBooks.length
            ) {

                return memberBooks;

            }

        }



        /*
           FRONTEND TESTING FALLBACK
        */

        return issuedBooks;

    }



    /* =====================================================
       LOAD ISSUED BOOK OPTIONS
    ===================================================== */

    function loadIssuedBookOptions() {


        const issues =
            getIssuedBooks();


        requestIssue.innerHTML = `

            <option value="">

                Select issued book

            </option>

        `;



        issues.forEach(

            function (
                issue
            ) {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    issue.id;


                option.textContent =

                    (
                        issue.bookName ||
                        issue.bookId
                    ) +

                    " — " +

                    (
                        issue.memberName ||
                        issue.memberId
                    ) +

                    " — Due " +

                    formatDate(
                        issue.returnDate
                    );


                requestIssue.appendChild(
                    option
                );

            }

        );

    }



    /* =====================================================
       SELECT BOOK
    ===================================================== */

    requestIssue.addEventListener(

        "change",

        function () {


            const issues =
                getIssues();


            const issue =
                issues.find(

                    function (
                        item
                    ) {


                        return (

                            String(
                                item.id
                            ) ===

                            String(
                                requestIssue.value
                            )

                        );

                    }

                );



            if (
                !issue
            ) {


                currentReturnDate.value =
                    "";


                requestedReturnDate.value =
                    "";


                return;

            }



            currentReturnDate.value =
                issue.returnDate || "";



            requestedReturnDate.value =
                "";



            requestedReturnDate.min =
                issue.returnDate ||
                today();

        }

    );



    /* =====================================================
       CREATE EXTENSION REQUEST
    ===================================================== */

    extensionRequestForm.addEventListener(

        "submit",

        function (
            event
        ) {


            event.preventDefault();



            const issues =
                getIssues();



            const issue =
                issues.find(

                    function (
                        item
                    ) {


                        return (

                            String(
                                item.id
                            ) ===

                            String(
                                requestIssue.value
                            )

                        );

                    }

                );



            if (
                !issue
            ) {


                showToast(

                    "Please select an issued book."

                );


                return;

            }



            if (

                String(
                    issue.status
                ).toLowerCase() !==
                "issued"

            ) {


                showToast(

                    "This book is no longer issued."

                );


                return;

            }



            const requestedDate =
                requestedReturnDate.value;



            if (
                !requestedDate
            ) {


                showToast(

                    "Please select requested return date."

                );


                return;

            }



            if (

                issue.returnDate &&

                requestedDate <=
                issue.returnDate

            ) {


                showToast(

                    "Requested date must be later than current return date."

                );


                return;

            }



            let requests =
                getRequests();



            /* =============================================
               PREVENT DUPLICATE PENDING REQUEST
            ============================================== */

            const pendingExists =
                requests.some(

                    function (
                        request
                    ) {


                        return (

                            String(
                                request.issueId
                            ) ===

                            String(
                                issue.id
                            ) &&

                            request.status ===
                                "Pending"

                        );

                    }

                );



            if (
                pendingExists
            ) {


                showToast(

                    "A pending extension request already exists for this book."

                );


                return;

            }



            const identity =
                getCurrentIdentity();



            const newRequest = {


                id:
                    generateRequestId(),


                issueId:
                    issue.id,


                bookId:
                    issue.bookId,


                bookName:

                    issue.bookName ||

                    issue.bookId ||

                    "Book",


                memberId:

                    issue.memberId ||

                    identity.memberId ||

                    "",


                memberName:

                    issue.memberName ||

                    identity.name ||

                    "Borrower",


                currentReturnDate:
                    issue.returnDate,


                requestedReturnDate:
                    requestedDate,


                reason:
                    requestReason.value.trim(),


                status:
                    "Pending",


                requestedAt:
                    new Date().toISOString(),


                processedAt:
                    null,


                approvedReturnDate:
                    null,


                adminMessage:
                    ""

            };



            requests.unshift(
                newRequest
            );



            /* =============================================
               >>> LOCAL STORAGE <<<
               SAVE REQUEST
            ============================================== */

            saveRequests(
                requests
            );



            /* =============================================
               CREATE ADMIN NOTIFICATION
            ============================================== */

            createNotification(

                "New Extension Request",

                newRequest.memberName +

                ' requested an extension for "' +

                newRequest.bookName +

                '" until ' +

                formatDate(
                    newRequest.requestedReturnDate
                ) +

                ".",

                "extension-request",

                newRequest.id,

                newRequest.memberId

            );



            extensionRequestForm.reset();


            currentReturnDate.value =
                "";



            showToast(

                "Extension request sent successfully."

            );



            renderEverything();

        }

    );



    /* =====================================================
       BORROWER REQUEST TABLE
    ===================================================== */

    function renderBorrowerRequests() {


        const identity =
            getCurrentIdentity();


        let requests =
            getRequests();



        if (
            identity.memberId
        ) {


            const ownRequests =
                requests.filter(

                    function (
                        request
                    ) {


                        return (

                            String(
                                request.memberId
                            ) ===

                            String(
                                identity.memberId
                            )

                        );

                    }

                );


            if (
                ownRequests.length
            ) {

                requests =
                    ownRequests;

            }

        }



        if (
            !requests.length
        ) {


            borrowerRequestTableBody.innerHTML = `

                <tr>

                    <td colspan="6">

                        <div class="empty-request-state">

                            <i class="bi bi-calendar2-plus"></i>

                            No extension requests yet.

                        </div>

                    </td>

                </tr>

            `;


            return;

        }



        borrowerRequestTableBody.innerHTML =

            requests.map(

                function (
                    request
                ) {


                    return `

                        <tr>


                            <td>

                                <strong>

                                    ${escapeHTML(
                                        request.bookName
                                    )}

                                </strong>


                                <div class="small text-muted">

                                    ${escapeHTML(
                                        request.bookId || ""
                                    )}

                                </div>

                            </td>



                            <td>

                                ${formatDate(
                                    request.currentReturnDate
                                )}

                            </td>



                            <td>

                                ${formatDate(

                                    request.approvedReturnDate ||

                                    request.requestedReturnDate

                                )}

                            </td>



                            <td class="request-reason">

                                ${escapeHTML(
                                    request.reason
                                )}

                            </td>



                            <td>

                                ${statusBadge(
                                    request.status
                                )}

                            </td>



                            <td>

                                ${escapeHTML(

                                    request.adminMessage ||

                                    "-"

                                )}

                            </td>


                        </tr>

                    `;

                }

            ).join("");

    }



    /* =====================================================
       ADMIN REQUESTS
    ===================================================== */

    function renderAdminRequests() {


        let requests =
            getRequests();



        const filter =
            adminStatusFilter.value;



        if (
            filter !== "all"
        ) {


            requests =
                requests.filter(

                    function (
                        request
                    ) {


                        return (

                            request.status ===
                            filter

                        );

                    }

                );

        }



        if (
            !requests.length
        ) {


            adminRequestList.innerHTML = `

                <div class="empty-request-state">

                    <i class="bi bi-inbox"></i>

                    No extension requests found.

                </div>

            `;


            return;

        }



        adminRequestList.innerHTML =

            requests.map(

                function (
                    request
                ) {


                    const pending =

                        request.status ===
                        "Pending";



                    return `

                        <div class="admin-request-card">


                            <div class="admin-request-top">


                                <div>


                                    <h6 class="admin-request-book">

                                        ${escapeHTML(
                                            request.bookName
                                        )}

                                    </h6>


                                    <p class="admin-request-member">

                                        <i class="bi bi-person me-1"></i>

                                        ${escapeHTML(
                                            request.memberName
                                        )}

                                        ${

                                            request.memberId

                                                ? "(" +

                                                escapeHTML(
                                                    request.memberId
                                                ) +

                                                ")"

                                                : ""

                                        }

                                    </p>


                                </div>



                                ${statusBadge(
                                    request.status
                                )}


                            </div>



                            <div class="admin-request-grid">


                                <div class="request-detail">

                                    <small>

                                        Current Return Date

                                    </small>


                                    <strong>

                                        ${formatDate(
                                            request.currentReturnDate
                                        )}

                                    </strong>

                                </div>



                                <div class="request-detail">

                                    <small>

                                        Requested Date

                                    </small>


                                    <strong>

                                        ${formatDate(
                                            request.requestedReturnDate
                                        )}

                                    </strong>

                                </div>



                                <div class="request-detail">

                                    <small>

                                        Processed Date

                                    </small>


                                    <strong>

                                        ${

                                            request.processedAt

                                                ? new Date(

                                                    request.processedAt

                                                ).toLocaleString()

                                                : "-"

                                        }

                                    </strong>

                                </div>


                            </div>



                            <div class="admin-request-reason">

                                <strong>

                                    Reason:

                                </strong>

                                ${escapeHTML(
                                    request.reason
                                )}

                            </div>



                            ${

                                request.adminMessage

                                    ? `

                                    <p>

                                        <strong>

                                            Admin Message:

                                        </strong>

                                        ${escapeHTML(
                                            request.adminMessage
                                        )}

                                    </p>

                                    `

                                    : ""

                            }



                            ${

                                pending

                                    ? `

                                    <div class="admin-actions">


                                        <button
                                            type="button"
                                            class="btn btn-outline-danger reject-request-btn"
                                            data-request-id="${request.id}">

                                            <i class="bi bi-x-circle me-1"></i>

                                            Reject

                                        </button>



                                        <button
                                            type="button"
                                            class="btn btn-success approve-request-btn"
                                            data-request-id="${request.id}">

                                            <i class="bi bi-check2-circle me-1"></i>

                                            Approve

                                        </button>


                                    </div>

                                    `

                                    : ""

                            }


                        </div>

                    `;

                }

            ).join("");



        bindAdminButtons();

    }



    adminStatusFilter.addEventListener(

        "change",

        renderAdminRequests

    );



    /* =====================================================
       BIND ADMIN BUTTONS
    ===================================================== */

    function bindAdminButtons() {


        document
            .querySelectorAll(
                ".approve-request-btn"
            )
            .forEach(

                function (
                    button
                ) {


                    button.addEventListener(

                        "click",

                        function () {


                            openDecisionModal(

                                button.dataset.requestId,

                                "approve"

                            );

                        }

                    );

                }

            );



        document
            .querySelectorAll(
                ".reject-request-btn"
            )
            .forEach(

                function (
                    button
                ) {


                    button.addEventListener(

                        "click",

                        function () {


                            openDecisionModal(

                                button.dataset.requestId,

                                "reject"

                            );

                        }

                    );

                }

            );

    }



    /* =====================================================
       OPEN ADMIN MODAL
    ===================================================== */

    function openDecisionModal(

        requestId,

        decision

    ) {


        const requests =
            getRequests();



        const request =
            requests.find(

                function (
                    item
                ) {


                    return (

                        item.id ===
                        requestId

                    );

                }

            );



        if (
            !request
        ) {

            return;

        }



        activeRequestId =
            requestId;


        activeDecision =
            decision;



        if (
            decision ===
            "approve"
        ) {


            decisionModalTitle.textContent =

                "Approve Extension Request";


            approvedDateGroup.classList.remove(
                "d-none"
            );


            approvedReturnDate.value =

                request.requestedReturnDate;


            approvedReturnDate.min =

                request.currentReturnDate;


            confirmDecisionBtn.className =

                "btn btn-success";


            confirmDecisionBtn.innerHTML = `

                <i class="bi bi-check2-circle me-1"></i>

                Approve

            `;


        } else {


            decisionModalTitle.textContent =

                "Reject Extension Request";


            approvedDateGroup.classList.add(
                "d-none"
            );


            confirmDecisionBtn.className =

                "btn btn-danger";


            confirmDecisionBtn.innerHTML = `

                <i class="bi bi-x-circle me-1"></i>

                Reject

            `;

        }



        decisionRequestSummary.innerHTML = `

            <strong>

                ${escapeHTML(
                    request.bookName
                )}

            </strong>

            <br>

            ${escapeHTML(
                request.memberName
            )}

            requested return date

            ${formatDate(
                request.requestedReturnDate
            )}.

        `;



        adminMessage.value =
            "";



        decisionModal.show();

    }



    /* =====================================================
       CONFIRM ADMIN DECISION
    ===================================================== */

    confirmDecisionBtn.addEventListener(

        "click",

        function () {


            if (

                !activeRequestId ||

                !activeDecision

            ) {

                return;

            }



            let requests =
                getRequests();



            const requestIndex =
                requests.findIndex(

                    function (
                        request
                    ) {


                        return (

                            request.id ===
                            activeRequestId

                        );

                    }

                );



            if (
                requestIndex === -1
            ) {

                return;

            }



            if (
                activeDecision ===
                "approve"
            ) {


                approveRequest(

                    requests,

                    requestIndex

                );


            } else {


                rejectRequest(

                    requests,

                    requestIndex

                );

            }

        }

    );



    /* =====================================================
       APPROVE REQUEST
    ===================================================== */

    function approveRequest(

        requests,

        requestIndex

    ) {


        const request =
            requests[
                requestIndex
            ];



        const newReturnDate =
            approvedReturnDate.value;



        if (
            !newReturnDate
        ) {


            showToast(

                "Select approved return date."

            );


            return;

        }



        if (

            request.currentReturnDate &&

            newReturnDate <=
            request.currentReturnDate

        ) {


            showToast(

                "Approved date must be later than current return date."

            );


            return;

        }



        let issues =
            getIssues();



        const issueIndex =
            issues.findIndex(

                function (
                    issue
                ) {


                    return (

                        String(
                            issue.id
                        ) ===

                        String(
                            request.issueId
                        )

                    );

                }

            );



        if (
            issueIndex === -1
        ) {


            showToast(

                "Issue record was not found."

            );


            return;

        }



        if (

            String(
                issues[
                    issueIndex
                ].status
            ).toLowerCase() !==
            "issued"

        ) {


            showToast(

                "This book has already been returned."

            );


            return;

        }



        /* =================================================
           MOST IMPORTANT PART

           UPDATE THE ACTUAL RETURN DATE
           INSIDE libraryIssues
        ================================================= */



        issues[
            issueIndex
        ].returnDate =
            newReturnDate;



        issues[
            issueIndex
        ].extensionApproved =
            true;



        issues[
            issueIndex
        ].extensionRequestId =
            request.id;



        /* =================================================
           >>> LOCAL STORAGE <<<
           SAVE UPDATED ISSUE
        ================================================= */

        saveIssues(
            issues
        );



        /* =================================================
           UPDATE REQUEST
        ================================================= */

        request.status =
            "Approved";


        request.approvedReturnDate =
            newReturnDate;


        request.processedAt =
            new Date()
                .toISOString();


        request.adminMessage =
            adminMessage.value.trim();



        requests[
            requestIndex
        ] = request;



        // >>> LOCAL STORAGE <<<

        saveRequests(
            requests
        );



        /* =================================================
           BORROWER NOTIFICATION
        ================================================= */

        createNotification(

            "Extension Request Approved",

            'Your return date for "' +

            request.bookName +

            '" has been extended to ' +

            formatDate(
                newReturnDate
            ) +

            ".",

            "extension-approved",

            request.id,

            request.memberId

        );



        decisionModal.hide();



        showToast(

            "Request approved. Return date updated successfully."

        );



        clearDecision();


        renderEverything();

    }



    /* =====================================================
       REJECT REQUEST
    ===================================================== */

    function rejectRequest(

        requests,

        requestIndex

    ) {


        const request =
            requests[
                requestIndex
            ];



        request.status =
            "Rejected";


        request.processedAt =
            new Date()
                .toISOString();


        request.approvedReturnDate =
            null;


        request.adminMessage =

            adminMessage.value.trim() ||

            "The extension request was not approved.";



        requests[
            requestIndex
        ] = request;



        // >>> LOCAL STORAGE <<<

        saveRequests(
            requests
        );



        createNotification(

            "Extension Request Rejected",

            'Your extension request for "' +

            request.bookName +

            '" was rejected.',

            "extension-rejected",

            request.id,

            request.memberId

        );



        decisionModal.hide();



        showToast(

            "Extension request rejected."

        );



        clearDecision();


        renderEverything();

    }



    /* =====================================================
       CLEAR MODAL DATA
    ===================================================== */

    function clearDecision() {


        activeRequestId =
            null;


        activeDecision =
            null;


        approvedReturnDate.value =
            "";


        adminMessage.value =
            "";

    }



    /* =====================================================
       STATUS BADGE
    ===================================================== */

    function statusBadge(
        status
    ) {


        let icon =
            "bi-hourglass-split";


        if (
            status ===
            "Approved"
        ) {


            icon =
                "bi-check2-circle";

        }


        if (
            status ===
            "Rejected"
        ) {


            icon =
                "bi-x-circle";

        }



        return `

            <span
                class="request-status ${String(status).toLowerCase()}">

                <i class="bi ${icon}"></i>

                ${escapeHTML(status)}

            </span>

        `;

    }



    /* =====================================================
       COUNTS
    ===================================================== */

    function updateRequestCounts() {


        const requests =
            getRequests();



        const pending =
            requests.filter(

                function (
                    request
                ) {


                    return (

                        request.status ===
                        "Pending"

                    );

                }

            ).length;



        const approved =
            requests.filter(

                function (
                    request
                ) {


                    return (

                        request.status ===
                        "Approved"

                    );

                }

            ).length;



        const rejected =
            requests.filter(

                function (
                    request
                ) {


                    return (

                        request.status ===
                        "Rejected"

                    );

                }

            ).length;



        pendingRequestCount.textContent =
            pending;


        approvedRequestCount.textContent =
            approved;


        rejectedRequestCount.textContent =
            rejected;


        totalRequestCount.textContent =
            requests.length;



        requestNavbarBadge.textContent =

            pending > 99

                ? "99+"

                : pending;



        requestNavbarBadge.classList.toggle(

            "show",

            pending > 0

        );

    }



    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message
    ) {


        extensionToast.textContent =
            message;



        extensionToast.classList.add(
            "show"
        );



        clearTimeout(
            showToast.timer
        );



        showToast.timer =
            setTimeout(

                function () {


                    extensionToast
                        .classList
                        .remove(
                            "show"
                        );

                },

                3000

            );

    }



    /* =====================================================
       RENDER ALL
    ===================================================== */

    function renderEverything() {


        loadIssuedBookOptions();


        renderBorrowerRequests();


        renderAdminRequests();


        updateRequestCounts();

    }



    /* =====================================================
       OTHER TAB STORAGE UPDATE
    ===================================================== */

    window.addEventListener(

        "storage",

        function (
            event
        ) {


            if (

                event.key ===
                    EXTENSION_KEYS.issues ||

                event.key ===
                    EXTENSION_KEYS.requests ||

                event.key ===
                    EXTENSION_KEYS.notifications

            ) {


                renderEverything();

            }

        }

    );



    /* =====================================================
       SAME PAGE UPDATE
    ===================================================== */

    window.addEventListener(

        "libraryDataChanged",

        function () {


            renderEverything();

        }

    );



    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    setInitialView();


    renderEverything();


})();