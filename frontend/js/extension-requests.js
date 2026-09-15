/* =========================================================
   LMS - RETURN DATE EXTENSION REQUEST
   DJANGO + MYSQL VERSION
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       API
    ===================================================== */

    const API_BASE_URL = "http://127.0.0.1:8000/api";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const extensionRequestForm =
        document.getElementById("extensionRequestForm");

    if (!extensionRequestForm) {
        return;
    }

    const extensionViewMode =
        document.getElementById("extensionViewMode");

    const borrowerPanel =
        document.getElementById("borrowerPanel");

    const adminPanel =
        document.getElementById("adminPanel");

    const requestIssue =
        document.getElementById("requestIssue");

    const currentReturnDate =
        document.getElementById("currentReturnDate");

    const requestedReturnDate =
        document.getElementById("requestedReturnDate");

    const requestReason =
        document.getElementById("requestReason");

    const borrowerRequestTableBody =
        document.getElementById("borrowerRequestTableBody");

    const adminRequestList =
        document.getElementById("adminRequestList");

    const adminStatusFilter =
        document.getElementById("adminStatusFilter");

    const requestNavbarBadge =
        document.getElementById("requestNavbarBadge");

    const pendingRequestCount =
        document.getElementById("pendingRequestCount");

    const approvedRequestCount =
        document.getElementById("approvedRequestCount");

    const rejectedRequestCount =
        document.getElementById("rejectedRequestCount");

    const totalRequestCount =
        document.getElementById("totalRequestCount");

    const decisionModalElement =
        document.getElementById("requestDecisionModal");

    const decisionModal =
        decisionModalElement
            ? new bootstrap.Modal(decisionModalElement)
            : null;

    const decisionModalTitle =
        document.getElementById("decisionModalTitle");

    const decisionRequestSummary =
        document.getElementById("decisionRequestSummary");

    const approvedDateGroup =
        document.getElementById("approvedDateGroup");

    const approvedReturnDate =
        document.getElementById("approvedReturnDate");

    const adminMessage =
        document.getElementById("adminMessage");

    const confirmDecisionBtn =
        document.getElementById("confirmDecisionBtn");

    const extensionToast =
        document.getElementById("extensionToast");


    /* =====================================================
       DATA
    ===================================================== */

    let issues = [];
    let requests = [];

    let activeRequestId = null;
    let activeDecision = null;


    /* =====================================================
       COMMON HELPERS
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatDate(date) {

        if (!date) {
            return "-";
        }

        const parts = String(date).split("-");

        if (parts.length === 3) {

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


    function today() {

        const date = new Date();

        const year = date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function showToast(message) {

        if (!extensionToast) {
            alert(message);
            return;
        }

        extensionToast.textContent = message;

        extensionToast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(function () {

            extensionToast.classList.remove("show");

        }, 3000);

    }


    /* =====================================================
       CURRENT USER
    ===================================================== */

    function getCurrentIdentity() {

        let source = {};

        try {

            const currentUser =
                JSON.parse(
                    localStorage.getItem("currentUser") || "{}"
                );

            if (
                currentUser &&
                typeof currentUser === "object"
            ) {

                source = currentUser;

            }

        } catch (error) {

            console.warn(
                "Could not read currentUser",
                error
            );

        }


        return {

            memberId:
                source.memberId ||
                source.member_id ||
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
                    source.role || "Borrower"
                )

        };

    }


    function isAdministrator(identity) {

        const role =
            String(identity.role || "")
                .toLowerCase();

        return (
            role.includes("administrator") ||
            role.includes("admin") ||
            role.includes("management")
        );

    }


    /* =====================================================
       API HELPER
    ===================================================== */

    async function apiRequest(
        endpoint,
        options = {}
    ) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}${endpoint}`,
                    {
                        ...options,
                        headers: {
                            "Content-Type":
                                "application/json",
                            ...(options.headers || {})
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Something went wrong"
                );

            }


            return data;

        } catch (error) {

            console.error(
                "API Error:",
                error
            );

            throw error;

        }

    }


    /* =====================================================
       LOAD ISSUES FROM DJANGO
    ===================================================== */

    async function loadIssues() {

        try {

            const data =
                await apiRequest("/issues/");


            if (
                data.success &&
                Array.isArray(data.issues)
            ) {

                issues = data.issues;

            } else {

                issues = [];

            }


            loadIssuedBookOptions();

        } catch (error) {

            issues = [];

            loadIssuedBookOptions();

            showToast(
                "Unable to load issued books."
            );

        }

    }


    /* =====================================================
       LOAD EXTENSION REQUESTS FROM DJANGO
    ===================================================== */

    async function loadRequests() {

        try {

            const data =
                await apiRequest("/extensions/");


            if (
                data.success &&
                Array.isArray(data.extensions)
            ) {

                requests = data.extensions;

            } else {

                requests = [];

            }


            renderEverything();

        } catch (error) {

            requests = [];

            renderEverything();

            showToast(
                "Unable to load extension requests."
            );

        }

    }


    /* =====================================================
       GET ISSUED BOOKS
    ===================================================== */

    function getIssuedBooks() {

    return issues.filter(function (issue) {

        return String(issue.status).toLowerCase() === "issued";

    });

}


    /* =====================================================
       LOAD ISSUED BOOK OPTIONS
    ===================================================== */

    function loadIssuedBookOptions() {

        const issuedBooks =
            getIssuedBooks();


        requestIssue.innerHTML = `
            <option value="">
                Select issued book
            </option>
        `;


        issuedBooks.forEach(function (issue) {

            const option =
                document.createElement("option");


            option.value = issue.id;


            option.textContent =
                (
                    issue.bookName ||
                    issue.bookId ||
                    "Book"
                ) +
                " — " +
                (
                    issue.memberName ||
                    issue.memberId ||
                    ""
                ) +
                " — Due " +
                formatDate(issue.returnDate);


            requestIssue.appendChild(option);

        });

    }


    /* =====================================================
       SELECT ISSUED BOOK
    ===================================================== */

    requestIssue.addEventListener(
        "change",
        function () {

            const issue =
                issues.find(function (item) {

                    return (
                        String(item.id) ===
                        String(requestIssue.value)
                    );

                });


            if (!issue) {

                currentReturnDate.value = "";
                requestedReturnDate.value = "";

                return;

            }


            currentReturnDate.value =
                issue.returnDate || "";


            requestedReturnDate.value = "";


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
        async function (event) {

            event.preventDefault();


            const issue =
                issues.find(function (item) {

                    return (
                        String(item.id) ===
                        String(requestIssue.value)
                    );

                });


            if (!issue) {

                showToast(
                    "Please select an issued book."
                );

                return;

            }


            if (
                String(issue.status).toLowerCase() !==
                "issued"
            ) {

                showToast(
                    "This book is no longer issued."
                );

                return;

            }


            const requestedDate =
                requestedReturnDate.value;


            const reason =
                requestReason.value.trim();


            if (!requestedDate) {

                showToast(
                    "Please select requested return date."
                );

                return;

            }


            if (!reason) {

                showToast(
                    "Please enter a reason."
                );

                return;

            }


            if (
                issue.returnDate &&
                requestedDate <= issue.returnDate
            ) {

                showToast(
                    "Requested date must be later than current return date."
                );

                return;

            }


            /*
               Prevent duplicate pending request
            */

            const duplicate =
                requests.some(function (request) {

                    return (
                        String(request.issue_id) ===
                        String(issue.id) &&
                        request.status === "Pending"
                    );

                });


            if (duplicate) {

                showToast(
                    "A pending extension request already exists for this book."
                );

                return;

            }


            try {

                const data =
                    await apiRequest(
                        "/extensions/",
                        {
                            method: "POST",

                            body: JSON.stringify({
                                issue_id: issue.id,
                                requested_return_date:
                                    requestedDate,
                                reason: reason
                            })
                        }
                    );


                if (data.success) {

                    showToast(
                        "Extension request sent successfully."
                    );


                    extensionRequestForm.reset();

                    currentReturnDate.value = "";


                    /*
                       Reload directly from MySQL
                    */

                    await loadRequests();

                    await loadIssues();

                }

            } catch (error) {

                showToast(
                    error.message ||
                    "Failed to create extension request."
                );

            }

        }
    );


    /* =====================================================
       BORROWER REQUEST TABLE
    ===================================================== */

    function renderBorrowerRequests() {

        const identity =
            getCurrentIdentity();


        let ownRequests =
            requests;


        if (identity.memberId) {

            const filtered =
                requests.filter(function (request) {

                    return (
                        String(request.member_id) ===
                        String(identity.memberId)
                    );

                });


            if (filtered.length) {

                ownRequests = filtered;

            }

        }


        if (!ownRequests.length) {

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
            ownRequests.map(function (request) {

                return `
                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    request.book_name
                                )}
                            </strong>

                            <div class="small text-muted">
                                ${escapeHTML(
                                    request.book_id || ""
                                )}
                            </div>

                        </td>


                        <td>
                            ${formatDate(
                                request.current_return_date
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                request.requested_return_date
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
                            -
                        </td>

                    </tr>
                `;

            }).join("");

    }


    /* =====================================================
       ADMIN REQUESTS
    ===================================================== */

    function renderAdminRequests() {

        if (!adminRequestList) {
            return;
        }


        let filteredRequests =
            [...requests];


        const filter =
            adminStatusFilter.value;


        if (filter !== "all") {

            filteredRequests =
                filteredRequests.filter(
                    function (request) {

                        return (
                            request.status ===
                            filter
                        );

                    }
                );

        }


        if (!filteredRequests.length) {

            adminRequestList.innerHTML = `
                <div class="empty-request-state">
                    <i class="bi bi-inbox"></i>
                    No extension requests found.
                </div>
            `;

            return;

        }


        adminRequestList.innerHTML =
            filteredRequests.map(function (request) {

                const pending =
                    request.status === "Pending";


                return `

                    <div class="admin-request-card">

                        <div class="admin-request-top">

                            <div>

                                <h6 class="admin-request-book">

                                    ${escapeHTML(
                                        request.book_name
                                    )}

                                </h6>


                                <p class="admin-request-member">

                                    <i class="bi bi-person me-1"></i>

                                    ${escapeHTML(
                                        request.member_id || ""
                                    )}

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
                                        request.current_return_date
                                    )}
                                </strong>

                            </div>


                            <div class="request-detail">

                                <small>
                                    Requested Date
                                </small>

                                <strong>
                                    ${formatDate(
                                        request.requested_return_date
                                    )}
                                </strong>

                            </div>


                            <div class="request-detail">

                                <small>
                                    Issue ID
                                </small>

                                <strong>
                                    ${escapeHTML(
                                        request.issue_id
                                    )}
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
                            pending
                                ? `

                                    <div class="admin-actions">

                                        <button
                                            type="button"
                                            class="btn btn-outline-danger reject-request-btn"
                                            data-request-id="${request.id}"
                                        >
                                            <i class="bi bi-x-circle me-1"></i>
                                            Reject
                                        </button>


                                        <button
                                            type="button"
                                            class="btn btn-success approve-request-btn"
                                            data-request-id="${request.id}"
                                        >
                                            <i class="bi bi-check2-circle me-1"></i>
                                            Approve
                                        </button>

                                    </div>

                                `
                                : ""
                        }

                    </div>

                `;

            }).join("");


        bindAdminButtons();

    }


    /* =====================================================
       ADMIN BUTTONS
    ===================================================== */

    function bindAdminButtons() {

        document
            .querySelectorAll(".approve-request-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openDecisionModal(
                            button.dataset.requestId,
                            "approve"
                        );

                    }
                );

            });


        document
            .querySelectorAll(".reject-request-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openDecisionModal(
                            button.dataset.requestId,
                            "reject"
                        );

                    }
                );

            });

    }


    /* =====================================================
       OPEN DECISION MODAL
    ===================================================== */

    function openDecisionModal(
        requestId,
        decision
    ) {

        const request =
            requests.find(function (item) {

                return (
                    String(item.id) ===
                    String(requestId)
                );

            });


        if (!request) {
            return;
        }


        activeRequestId =
            request.id;

        activeDecision =
            decision;


        if (decision === "approve") {

            decisionModalTitle.textContent =
                "Approve Extension Request";


            approvedDateGroup.classList.remove(
                "d-none"
            );


            approvedReturnDate.value =
                request.requested_return_date;


            approvedReturnDate.min =
                request.current_return_date;


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
                    request.book_name
                )}
            </strong>

            <br>

            ${escapeHTML(
                request.member_id || ""
            )}

            requested return date

            ${formatDate(
                request.requested_return_date
            )}

        `;


        adminMessage.value = "";


        if (decisionModal) {
            decisionModal.show();
        }

    }


    /* =====================================================
       CONFIRM DECISION
    ===================================================== */

    confirmDecisionBtn.addEventListener(
        "click",
        async function () {

            if (
                !activeRequestId ||
                !activeDecision
            ) {
                return;
            }


            const newStatus =
                activeDecision === "approve"
                    ? "Approved"
                    : "Rejected";


            try {

                /*
                   Django API accepts status.
                   When Approved, Django automatically
                   updates Issue.return_date to the
                   requested extension date.
                */

                const data =
                    await apiRequest(
                        `/extensions/${activeRequestId}/`,
                        {
                            method: "PUT",

                            body: JSON.stringify({
                                status: newStatus
                            })
                        }
                    );


                if (data.success) {

                    if (decisionModal) {
                        decisionModal.hide();
                    }


                    if (newStatus === "Approved") {

                        showToast(
                            "Request approved. Return date updated successfully."
                        );

                    } else {

                        showToast(
                            "Extension request rejected."
                        );

                    }


                    clearDecision();


                    /*
                       Reload latest database data
                    */

                    await loadIssues();

                    await loadRequests();

                }

            } catch (error) {

                showToast(
                    error.message ||
                    "Unable to update extension request."
                );

            }

        }
    );


    /* =====================================================
       CLEAR DECISION
    ===================================================== */

    function clearDecision() {

        activeRequestId = null;

        activeDecision = null;

        approvedReturnDate.value = "";

        adminMessage.value = "";

    }


    /* =====================================================
       STATUS BADGE
    ===================================================== */

    function statusBadge(status) {

        let icon =
            "bi-hourglass-split";


        if (status === "Approved") {

            icon =
                "bi-check2-circle";

        }


        if (status === "Rejected") {

            icon =
                "bi-x-circle";

        }


        return `

            <span
                class="request-status ${String(
                    status
                ).toLowerCase()}"
            >

                <i class="bi ${icon}"></i>

                ${escapeHTML(status)}

            </span>

        `;

    }


    /* =====================================================
       COUNTS
    ===================================================== */

    function updateRequestCounts() {

    const pending =
        requests.filter(function (request) {
            return request.status === "Pending";
        }).length;

    const approved =
        requests.filter(function (request) {
            return request.status === "Approved";
        }).length;

    const rejected =
        requests.filter(function (request) {
            return request.status === "Rejected";
        }).length;


    if (pendingRequestCount) {
        pendingRequestCount.textContent = pending;
    }

    if (approvedRequestCount) {
        approvedRequestCount.textContent = approved;
    }

    if (rejectedRequestCount) {
        rejectedRequestCount.textContent = rejected;
    }

    if (totalRequestCount) {
        totalRequestCount.textContent = requests.length;
    }

    if (requestNavbarBadge) {
        requestNavbarBadge.textContent =
            pending > 99 ? "99+" : pending;

        requestNavbarBadge.classList.toggle(
            "show",
            pending > 0
        );
    }

}


    /* =====================================================
       RENDER EVERYTHING
    ===================================================== */

    function renderEverything() {

        loadIssuedBookOptions();

        renderBorrowerRequests();

        renderAdminRequests();

        updateRequestCounts();

    }


    /* =====================================================
       BORROWER / ADMIN VIEW
    ===================================================== */

    function applyViewMode() {

        const adminMode =
            extensionViewMode.value === "admin";


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
       INITIAL ROLE
    ===================================================== */

    function setInitialView() {

        const identity =
            getCurrentIdentity();


        if (
            isAdministrator(identity)
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
       INITIAL LOAD
    ===================================================== */

    async function initializeExtensionPage() {

        setInitialView();

        await loadIssues();

        await loadRequests();

    }


    initializeExtensionPage();

})();