/* LIBRARY MANAGEMENT SYSTEM
   COMMON JAVASCRIPT */


const KEYS = {
    members: "libraryMembers",
    books: "libraryBooks",
    issues: "libraryIssues",
    profile: "libraryProfile"
};


/* 
   COMMON STORAGE FUNCTIONS */

function getData(key) {

    try {

        const data = JSON.parse(
            localStorage.getItem(key)
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.error(
            "Error reading localStorage:",
            error
        );

        return [];
    }
}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );


    window.dispatchEvent(
        new Event("libraryDataChanged")
    );
}


/*
   DATE FUNCTIONS
*/

function today() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parts =
        String(date).split("-");

    if (parts.length === 3) {

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
}


/* 
   AUTOMATIC ID  */

function getNextId(key, prefix) {

    const data =
        getData(key);

    let max = 0;

    data.forEach(function(item) {

        const match =
            String(item.id || "").match(
                new RegExp(
                    "^" + prefix + "(\\d+)$"
                )
            );

        if (match) {

            const number =
                parseInt(
                    match[1],
                    10
                );

            if (number > max) {
                max = number;
            }
        }
    });

    return prefix +
        String(max + 1).padStart(3, "0");
}


/*  
   EMPTY TABLE
  */

function emptyRow(
    columns,
    message
) {

    return `
        <tr>
            <td
                colspan="${columns}"
                class="text-center text-muted py-4">

                <i class="bi bi-info-circle me-2"></i>

                ${message}

            </td>
        </tr>
    `;
}


/*  
   ESCAPE HTML
  */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*  
   DASHBOARD
  */

let issuePage = 1;
let returnPage = 1;

const dashboardRowsPerPage = 5;


function updateDashboard() {

    const books =
        getData(KEYS.books);

    const members =
        getData(KEYS.members);

    const issues =
        getData(KEYS.issues);


    /*  
       BOOK COUNTS
    */

    const totalBooks =
        books.length;


    const availableBooks =
        books.filter(function(book) {

            return book.status === "Available";

        }).length;


    const issuedBooks =
        books.filter(function(book) {

            return book.status === "Issued";

        }).length;


    /*
       MEMBER COUNTS
    */

    const totalMembers =
        members.length;


    const activeMembers =
        members.filter(function(member) {

            return member.status === "Active";

        }).length;


    /*
       ISSUE COUNTS
    */

    const issuedRecords =
        issues.filter(function(issue) {

            return issue.status === "Issued";

        });


    const returnedRecords =
        issues.filter(function(issue) {

            return issue.status === "Returned";

        });


    /*
       OVERDUE BOOKS
    */

    const overdueBooks =
        issuedRecords.filter(function(issue) {

            return (
                issue.returnDate &&
                issue.returnDate < today()
            );

        }).length;


    /*
       UPDATE DASHBOARD CARDS
    */

    const values = {

        totalBooks:
            totalBooks,

        availableBooks:
            availableBooks,

        booksIssued:
            issuedBooks,

        totalMembers:
            totalMembers,

        activeMembers:
            activeMembers,

        overdueBooks:
            overdueBooks

    };


    Object.entries(values).forEach(
        function([id, value]) {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value;

            }

        }
    );


    /*
       UPDATE DASHBOARD TABLES
    */

    displayIssuedBooks(
        issuedRecords
    );


    displayReturnedBooks(
        returnedRecords
    );


    /*
       UPDATE PIE CHART
    */

    createLibraryPieChart(
        totalBooks,
        issuedBooks,
        totalMembers,
        overdueBooks,
        activeMembers,
        availableBooks
    );

}

let libraryPieChart = null;


function createLibraryPieChart(
    totalBooks,
    issuedBooks,
    totalMembers,
    overdueBooks,
    activeMembers,
    availableBooks
) {

    const canvas =
        document.getElementById("libraryPieChart");


    if (!canvas) {
        console.log("Canvas not found");
        return;
    }


    const chartData = [

        totalBooks,
        issuedBooks,
        totalMembers,
        overdueBooks,
        activeMembers,
        availableBooks

    ];


    if (libraryPieChart === null) {

        libraryPieChart = new Chart(
            canvas,
            {

                type: "pie",

                data: {

                    labels: [

                        "Total Books",
                        "Books Issued",
                        "Total Members",
                        "Overdue Books",
                        "Active Members",
                        "Available Books"

                    ],

                    datasets: [{

                        data: chartData

                    }]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                color:
                                    document.body.classList.contains("dark-mode")
                                        ? "#ffffff"
                                        : "#212529",

                                font: {
                                    size: 14,
                                    weight: "bold"
                                }

                            }

                        }

                   },

                    /*
                       CLICK EVENT
                    */

                    onClick: function(event, elements) {

                        if (!elements.length) {
                            return;
                        }


                        const index =
                            elements[0].index;


                        /*
                           PAGE NAVIGATION
                        */

                        switch (index) {

                            case 0:
                                // Total Books
                                window.location.href =
                                    "books.html";
                                break;


                            case 1:
                                // Books Issued
                                window.location.href =
                                    "issue-return.html";
                                break;


                            case 2:
                                // Total Members
                                window.location.href =
                                    "members.html";
                                break;


                            case 3:
                                // Overdue Books
                                window.location.href =
                                    "issue-return.html";
                                break;


                            case 4:
                                // Active Members
                                window.location.href =
                                    "members.html";
                                break;


                            case 5:
                                // Available Books
                                window.location.href =
                                    "books.html";
                                break;

                        }

                    }

                }

            }
        );

    }


    else {

        libraryPieChart.data.datasets[0].data =
            chartData;

        libraryPieChart.update();

    }

}
   /*---DASHBOARD - ISSUED BOOKS TABLE---*/


function displayIssuedBooks(issues) {

    const table =
        document.getElementById(
            "IssuedBookstable"
        );


    if (!table) {
        return;
    }


    const books =
        getData(KEYS.books);


    const list =
        issues
            .slice()
            .reverse();


    if (!list.length) {

        table.innerHTML =
            emptyRow(
                10,
                "No books are currently issued."
            );

        updateIssuePagination(0);

        return;
    }


    const totalPages =
        Math.ceil(
            list.length /
            dashboardRowsPerPage
        );


    if (issuePage > totalPages) {
        issuePage = totalPages;
    }


    const start =
        (issuePage - 1) *
        dashboardRowsPerPage;


    const pageList =
        list.slice(
            start,
            start + dashboardRowsPerPage
        );


    table.innerHTML =
        pageList.map(
            function(issue, index) {

                const book =
                    books.find(function(book) {

                        return book.id ===
                            issue.bookId;

                    });


                const overdue =
                    issue.returnDate &&
                    issue.returnDate <
                    today();


                let status;


                if (overdue) {

                    status = `
                        <span class="badge bg-danger">
                            Overdue
                        </span>
                    `;

                } else {

                    status = `
                        <span class="badge bg-primary">
                            Issued
                        </span>
                    `;
                }


                return `
                    <tr>

                        <td>
                            ${start + index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                issue.bookId
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                book?.title ||
                                issue.bookName ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                issue.memberName ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                issue.issueDate
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                issue.returnDate
                            )}
                        </td>

                        <td>
                            ${status}
                        </td>

                    </tr>
                `;

            }
        ).join("");


    updateIssuePagination(
        list.length
    );
}
/*  
   DASHBOARD - ISSUED BOOKS PAGINATION
  */

function setupTablePagination(
    tableBodyId,
    paginationId,
    rowsPerPage = 5
) {

    const tableBody = document.getElementById(tableBodyId);
    const pagination = document.getElementById(paginationId);

    if (!tableBody || !pagination) {
        return;
    }

    let currentPage = 1;

    function getRows() {
        return Array.from(
            tableBody.querySelectorAll("tr")
        ).filter(row => {
            return !row.querySelector("td[colspan]");
        });
    }

    function displayPage(page) {

        const rows = getRows();

        const totalRows = rows.length;

        const totalPages = Math.ceil(
            totalRows / rowsPerPage
        );

        if (totalPages === 0) {

            pagination.innerHTML = "";

            return;
        }

        if (page < 1) {
            page = 1;
        }

        if (page > totalPages) {
            page = totalPages;
        }

        currentPage = page;

        rows.forEach(row => {
            row.style.display = "none";
        });

        const start =
            (currentPage - 1) * rowsPerPage;

        const end =
            start + rowsPerPage;

        rows
            .slice(start, end)
            .forEach(row => {
                row.style.display = "";
            });

        createPagination(
            totalRows,
            totalPages
        );
    }

    function createPagination(
        totalRows,
        totalPages
    ) {

        const start =
            (currentPage - 1) * rowsPerPage + 1;

        const end =
            Math.min(
                currentPage * rowsPerPage,
                totalRows
            );

        pagination.innerHTML = `
            
            <div class="pagination-container w-100">

                <div class="pagination-info">

                    Showing ${start} to ${end}
                    of ${totalRows} entries

                </div>

                <nav>

                    <ul class="pagination pagination-sm mb-0">

                        <li class="page-item ${
                            currentPage === 1
                                ? "disabled"
                                : ""
                        }">

                            <button
                                class="page-link"
                                data-page="${currentPage - 1}">

                                Previous

                            </button>

                        </li>

                        ${createPageNumbers(totalPages)}

                        <li class="page-item ${
                            currentPage === totalPages
                                ? "disabled"
                                : ""
                        }">

                            <button
                                class="page-link"
                                data-page="${currentPage + 1}">

                                Next

                            </button>

                        </li>

                    </ul>

                </nav>

            </div>
        `;

        pagination
            .querySelectorAll("[data-page]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const page =
                            Number(
                                this.dataset.page
                            );

                        if (
                            page >= 1 &&
                            page <= totalPages
                        ) {
                            displayPage(page);
                        }

                    }
                );

            });
    }

    function createPageNumbers(totalPages) {

        let html = "";

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            html += `
                <li class="page-item ${
                    page === currentPage
                        ? "active"
                        : ""
                }">

                    <button
                        class="page-link"
                        data-page="${page}">

                        ${page}

                    </button>

                </li>
            `;
        }

        return html;
    }

    displayPage();
    
}




/*DASHBOARD - RETURNED BOOKS TABLE*/

function displayReturnedBooks(issues) {

    const table =
        document.getElementById(
            "returnedBooksTable"
        );


    if (!table) {
        return;
    }


    const books =
        getData(KEYS.books);


    const list =
        issues
            .slice()
            .reverse();


    if (!list.length) {

        table.innerHTML =
            emptyRow(
                8,
                "No books have been returned."
            );

        updateReturnPagination(0);

        return;
    }


    const totalPages =
        Math.ceil(
            list.length /
            dashboardRowsPerPage
        );


    if (returnPage > totalPages) {
        returnPage = totalPages;
    }


    const start =
        (returnPage - 1) *
        dashboardRowsPerPage;


    const pageList =
        list.slice(
            start,
            start + dashboardRowsPerPage
        );


    table.innerHTML =
        pageList.map(
            function(issue, index) {

                const book =
                    books.find(function(book) {

                        return book.id ===
                            issue.bookId;

                    });


                return `
                    <tr>

                        <td>
                            ${start + index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                issue.bookId
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                book?.title ||
                                issue.bookName ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                issue.memberName ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                issue.issueDate
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                issue.returnDate
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                issue.actualReturnDate
                            )}
                        </td>

                        <td>
                            <span class="badge bg-success">
                                Returned
                            </span>
                        </td>

                    </tr>
                `;

            }
        ).join("");


    updateReturnPagination(
        list.length
    );
}


/*ISSUE PAGINATION*/

function updateIssuePagination(total) {

    const box =
        document.getElementById(
            "issuePagination"
        );


    if (!box) {
        return;
    }


    box.innerHTML = "";


    if (total <= dashboardRowsPerPage) {
        return;
    }


    const pages =
        Math.ceil(
            total /
            dashboardRowsPerPage
        );


    let html = `
        <nav>
            <ul class="pagination">

                <li class="page-item
                    ${issuePage === 1
                        ? "disabled"
                        : ""}">

                    <button
                        class="page-link"
                        onclick="changeIssuePage(
                            ${issuePage - 1}
                        )">

                        Previous

                    </button>

                </li>
    `;


    for (
        let i = 1;
        i <= pages;
        i++
    ) {

        html += `
            <li class="page-item
                ${i === issuePage
                    ? "active"
                    : ""}">

                <button
                    class="page-link"
                    onclick="changeIssuePage(${i})">

                    ${i}

                </button>

            </li>
        `;
    }


    html += `
                <li class="page-item
                    ${issuePage === pages
                        ? "disabled"
                        : ""}">

                    <button
                        class="page-link"
                        onclick="changeIssuePage(
                            ${issuePage + 1}
                        )">

                        Next

                    </button>

                </li>

            </ul>
        </nav>
    `;


    box.innerHTML = html;
}


window.changeIssuePage =
function(page) {

    const issues =
        getData(KEYS.issues)
            .filter(function(issue) {

                return issue.status ===
                    "Issued";

            });


    const pages =
        Math.ceil(
            issues.length /
            dashboardRowsPerPage
        );


    if (
        page < 1 ||
        page > pages
    ) {
        return;
    }


    issuePage = page;


    displayIssuedBooks(
        issues
    );
};


/* RETURN PAGINATION */

function updateReturnPagination(total) {

    const box =
        document.getElementById(
            "returnPagination"
        );


    if (!box) {
        return;
    }


    box.innerHTML = "";


    if (total <= dashboardRowsPerPage) {
        return;
    }


    const pages =
        Math.ceil(
            total /
            dashboardRowsPerPage
        );


    let html = `
        <nav>
            <ul class="pagination">

                <li class="page-item
                    ${returnPage === 1
                        ? "disabled"
                        : ""}">

                    <button
                        class="page-link"
                        onclick="changeReturnPage(
                            ${returnPage - 1}
                        )">

                        Previous

                    </button>

                </li>
    `;


    for (
        let i = 1;
        i <= pages;
        i++
    ) {

        html += `
            <li class="page-item
                ${i === returnPage
                    ? "active"
                    : ""}">

                <button
                    class="page-link"
                    onclick="changeReturnPage(${i})">

                    ${i}

                </button>

            </li>
        `;
    }


    html += `
                <li class="page-item
                    ${returnPage === pages
                        ? "disabled"
                        : ""}">

                    <button
                        class="page-link"
                        onclick="changeReturnPage(
                            ${returnPage + 1}
                        )">

                        Next

                    </button>

                </li>

            </ul>
        </nav>
    `;


    box.innerHTML = html;
}


window.changeReturnPage =
function(page) {

    const issues =
        getData(KEYS.issues)
            .filter(function(issue) {

                return issue.status ===
                    "Returned";

            });


    const pages =
        Math.ceil(
            issues.length /
            dashboardRowsPerPage
        );


    if (
        page < 1 ||
        page > pages
    ) {
        return;
    }


    returnPage = page;


    displayReturnedBooks(
        issues
    );
};


/*  
   MEMBERS
   WITH PAGINATION
  */

function initMembers() {

    const table =
        document.getElementById("memberTableBody");

    const form =
        document.getElementById("addMemberForm");

    if (!table || !form) {
        return;
    }

    const phoneInput =
    document.getElementById("addPhone");


if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        function() {

            // Remove letters and special characters
            this.value =
                this.value.replace(/\D/g, "");

            // Maximum 10 digits
            this.value =
                this.value.slice(0, 10);

        }
    );

}

    let members =
        getData(KEYS.members);

    const rowsPerPage = 5;

    let currentPage = 1;

    let currentList = members;


    /* =====================================================
       CREATE PAGINATION BOX IF IT DOES NOT EXIST
    ===================================================== */

    let pagination =
        document.getElementById("memberPagination");

    if (!pagination) {

        pagination =
            document.createElement("div");

        pagination.id =
            "memberPagination";

        pagination.className =
            "mt-3 d-flex justify-content-center";

        const tableContainer =
            table.closest(".table-responsive");

        if (tableContainer) {

            tableContainer.parentNode.insertBefore(
                pagination,
                tableContainer.nextSibling
            );

        } else {

            table.parentNode.appendChild(
                pagination
            );
        }
    }


    /* =====================================================
       DISPLAY MEMBERS
    ===================================================== */

    function display(list = members) {

        currentList = list;

        const totalRows =
            currentList.length;

        const totalPages =
            Math.ceil(
                totalRows / rowsPerPage
            );


        /* If current page is greater than total pages */

        if (
            currentPage > totalPages &&
            totalPages > 0
        ) {

            currentPage =
                totalPages;
        }


        if (currentPage < 1) {
            currentPage = 1;
        }


        /* NO DATA */

        if (!totalRows) {

            table.innerHTML =
                emptyRow(
                    7,
                    "No members found."
                );

            pagination.innerHTML = "";

            return;
        }


        /* =================================================
           GET CURRENT PAGE DATA
        ================================================= */

        const start =
            (currentPage - 1) *
            rowsPerPage;

        const end =
            start + rowsPerPage;

        const pageList =
            currentList.slice(
                start,
                end
            );


        /* =================================================
           DISPLAY TABLE
        ================================================= */

        table.innerHTML =
            pageList.map(function(member) {

                const badge =
                    member.status === "Active"
                        ? "bg-success"
                        : "bg-danger";


                return `
                    <tr>

                        <td>
                            ${escapeHTML(member.id)}
                        </td>

                        <td>
                            ${escapeHTML(member.name)}
                        </td>

                        <td>
                            ${escapeHTML(member.email)}
                        </td>

                        <td>
                            ${escapeHTML(member.phone)}
                        </td>

                        <td>
                            ${escapeHTML(
                                member.membership
                            )}
                        </td>

                        <td>
                            <span class="badge ${badge}">
                                ${escapeHTML(
                                    member.status
                                )}
                            </span>
                        </td>

                        <td>

                            <button
                                class="btn btn-sm btn-warning"
                                onclick="editMember('${member.id}')">

                                <i class="bi bi-pencil"></i>
                                Edit

                            </button>


                            <button
                                class="btn btn-sm btn-danger"
                                onclick="deleteMember('${member.id}')">

                                <i class="bi bi-trash"></i>
                                Delete

                            </button>

                        </td>

                    </tr>
                `;

            }).join("");


        /* =================================================
           UPDATE PAGINATION
        ================================================= */

        createMemberPagination(
            totalRows,
            totalPages
        );
    }


    /* =====================================================
       MEMBER PAGINATION
    ===================================================== */

    function createMemberPagination(
        totalRows,
        totalPages
    ) {

        pagination.innerHTML = "";


        /* Do not show pagination if only one page */

        if (totalPages <= 1) {
            return;
        }


        const start =
            (currentPage - 1) *
            rowsPerPage + 1;

        const end =
            Math.min(
                currentPage * rowsPerPage,
                totalRows
            );


        pagination.innerHTML = `

            <div class="w-100">

                <div class="d-flex
                            justify-content-between
                            align-items-center
                            flex-wrap
                            gap-2">

                    <div class="text-muted">

                        Showing
                        ${start}
                        to
                        ${end}
                        of
                        ${totalRows}
                        entries

                    </div>


                    <nav>

                        <ul class="pagination mb-0">


                            <!-- PREVIOUS -->

                            <li class="page-item
                                ${
                                    currentPage === 1
                                        ? "disabled"
                                        : ""
                                }">

                                <button
                                    type="button"
                                    class="page-link"
                                    id="memberPrevious">

                                    Previous

                                </button>

                            </li>


                            <!-- PAGE NUMBERS -->

                            ${Array.from(
                                {
                                    length: totalPages
                                },
                                function(_, index) {

                                    const page =
                                        index + 1;

                                    return `

                                        <li class="page-item
                                            ${
                                                page === currentPage
                                                    ? "active"
                                                    : ""
                                            }">

                                            <button
                                                type="button"
                                                class="page-link"
                                                data-member-page="${page}">

                                                ${page}

                                            </button>

                                        </li>

                                    `;

                                }
                            ).join("")}


                            <!-- NEXT -->

                            <li class="page-item
                                ${
                                    currentPage === totalPages
                                        ? "disabled"
                                        : ""
                                }">

                                <button
                                    type="button"
                                    class="page-link"
                                    id="memberNext">

                                    Next

                                </button>

                            </li>

                        </ul>

                    </nav>

                </div>

            </div>
        `;


        /* =================================================
           PREVIOUS BUTTON
        ================================================= */

        const previous =
            document.getElementById(
                "memberPrevious"
            );

        if (previous) {

            previous.addEventListener(
                "click",
                function() {

                    if (currentPage > 1) {

                        currentPage--;

                        display(currentList);
                    }

                }
            );
        }


        /* =================================================
           NEXT BUTTON
        ================================================= */

        const next =
            document.getElementById(
                "memberNext"
            );

        if (next) {

            next.addEventListener(
                "click",
                function() {

                    if (
                        currentPage <
                        totalPages
                    ) {

                        currentPage++;

                        display(currentList);
                    }

                }
            );
        }


        /* =================================================
           PAGE NUMBER BUTTONS
        ================================================= */

        pagination
            .querySelectorAll(
                "[data-member-page]"
            )
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        currentPage =
                            Number(
                                this.dataset.memberPage
                            );

                        display(currentList);

                    }
                );

            });
    }


    /* =====================================================
       ADD MEMBER
    ===================================================== */

    form.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();

            const memberId =
    document.getElementById(
        "addMemberId"
    ).value.trim();


            const name =
                document.getElementById(
                    "addName"
                ).value.trim();


            const email =
                document.getElementById(
                    "addEmail"
                ).value.trim();


            const phone =
                document.getElementById(
                    "addPhone"
                ).value.trim();


            const membership =
                document.getElementById(
                    "addMembership"
                ).value;


           if (
    !memberId ||
    !name ||
    !email ||
    !phone ||
    !membership
) {
    alert(
        "Please fill all fields."
    );

    return;
}

/* PHONE NUMBER VALIDATION */

if (!/^[6-9][0-9]{9}$/.test(phone)) {

    alert(
        "Please enter a valid 10-digit phone number."
    );

    return;
}


            const member = {

    id: memberId,

    name: name,

    email: email,

    phone: phone,

    membership: membership,

    status: "Active"
};


            members.push(member);

saveData(
    KEYS.members,
    members
);

// 🔔 New Member Notification
notifyNewMember(member.name);

currentPage = 1;


            display(members);


            form.reset();


            updateDashboard();


            alert(
                "Member added successfully!"
            );

        }
    );


    /* =====================================================
       SEARCH MEMBER
    ===================================================== */

    const search =
        document.getElementById(
            "memberSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            function() {

                const text =
                    search.value
                        .toLowerCase()
                        .trim();


                const filtered =
                    members.filter(
                        function(member) {

                            const data =
                                `${member.id}
                                 ${member.name}
                                 ${member.email}
                                 ${member.phone}
                                 ${member.membership}`
                                    .toLowerCase();


                            return data.includes(
                                text
                            );

                        }
                    );


                currentPage = 1;


                display(filtered);

            }
        );
    }


    /* =====================================================
       EDIT MEMBER
    ===================================================== */

    window.editMember =
        function(memberId) {

            const member =
                members.find(
                    function(m) {

                        return m.id ===
                            memberId;

                    }
                );


            if (!member) {
                return;
            }


            const fields = {

                editMemberId:
                    member.id,

                editName:
                    member.name,

                editEmail:
                    member.email,

                editPhone:
                    member.phone,

                editMembership:
                    member.membership,

                editStatus:
                    member.status

            };


            Object.entries(fields)
                .forEach(
                    function([id, value]) {

                        const element =
                            document.getElementById(
                                id
                            );


                        if (element) {

                            element.value =
                                value;

                        }

                    }
                );


            const modal =
                document.getElementById(
                    "editMemberModal"
                );


            if (
                modal &&
                typeof bootstrap !==
                "undefined"
            ) {

                bootstrap.Modal
                    .getOrCreateInstance(
                        modal
                    )
                    .show();
            }

        };


    /* =====================================================
       UPDATE MEMBER
    ===================================================== */

    const editForm =
        document.getElementById(
            "editMemberForm"
        );


    if (editForm) {

        editForm.addEventListener(
            "submit",
            function(e) {

                e.preventDefault();


                const id =
                    document.getElementById(
                        "editMemberId"
                    ).value;


                const member =
                    members.find(
                        function(m) {

                            return m.id === id;

                        }
                    );


                if (!member) {
                    return;
                }


                member.name =
                    document.getElementById(
                        "editName"
                    ).value.trim();


                member.email =
                    document.getElementById(
                        "editEmail"
                    ).value.trim();


                member.phone =
                    document.getElementById(
                        "editPhone"
                    ).value.trim();


                member.membership =
                    document.getElementById(
                        "editMembership"
                    ).value;


                member.status =
                    document.getElementById(
                        "editStatus"
                    ).value;


                saveData(
                    KEYS.members,
                    members
                );


                display(
                    members
                );


                updateDashboard();


                const modal =
                    document.getElementById(
                        "editMemberModal"
                    );


                if (modal) {

                    bootstrap.Modal
                        .getOrCreateInstance(
                            modal
                        )
                        .hide();

                }


                alert(
                    "Member updated successfully!"
                );

            }
        );
    }


    /* =====================================================
       DELETE MEMBER
    ===================================================== */

    window.deleteMember =
        function(memberId) {

            const member =
                members.find(
                    function(m) {

                        return m.id ===
                            memberId;

                    }
                );


            if (!member) {
                return;
            }


            if (
                !confirm(
                    `Are you sure you want to delete ${member.name}?`
                )
            ) {

                return;
            }


            members =
                members.filter(
                    function(m) {

                        return m.id !==
                            memberId;

                    }
                );


            saveData(
                KEYS.members,
                members
            );


            const totalPages =
                Math.ceil(
                    members.length /
                    rowsPerPage
                );


            if (
                currentPage >
                totalPages
            ) {

                currentPage =
                    totalPages || 1;

            }


            display(members);


            updateDashboard();


            alert(
                "Member deleted successfully!"
            );

        };


    /* =====================================================
       DATA UPDATE
    ===================================================== */

    window.addEventListener(
        "libraryDataChanged",
        function() {

            members =
                getData(
                    KEYS.members
                );


            currentPage = 1;


            display(members);

        }
    );


    /* =====================================================
       INITIAL DISPLAY
    ===================================================== */

    display(members);

}

/*BOOKS */

function initBooks() {

    const form =
        document.getElementById(
            "bookForm"
        );


    const editForm =
        document.getElementById(
            "editBookForm"
        );


    const table =
        document.getElementById(
            "bookTableBody"
        );


    const summary =
        document.getElementById(
            "bookSummaryBody"
        );


    if (!form || !table || !summary) {
        return;
    }


    let books =
        getData(KEYS.books);


    let bookPage = 1;

    let departmentPage = 1;

    const booksPerPage = 5;

    const departmentsPerPage = 5;


    /* 
       DISPLAY BOOKS WITH PAGINATION
     */

    function display(list = books) {

        if (!list.length) {

            table.innerHTML =
                emptyRow(
                    7,
                    "No books found."
                );

            updateBookPagination(0);

            return;
        }


        const totalPages =
            Math.ceil(
                list.length /
                booksPerPage
            );


        if (bookPage > totalPages) {
            bookPage = totalPages;
        }


        const start =
            (bookPage - 1) *
            booksPerPage;


        const pageList =
            list.slice(
                start,
                start + booksPerPage
            );


        table.innerHTML =
            pageList.map(function(book) {

                const badge =
                    book.status === "Available"
                        ? "bg-success"
                        : "bg-danger";


                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    book.id
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                book.title
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                book.author
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                book.category
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                book.department
                            )}
                        </td>

                        <td>

                            <span class="badge ${badge}">
                                ${escapeHTML(
                                    book.status
                                )}
                            </span>

                        </td>

                        <td>

                            <button
                                class="btn btn-sm btn-outline-primary"
                                onclick="editBook(
                                    '${book.id}'
                                )">

                                <i class="bi bi-pencil"></i>

                            </button>


                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick="deleteBook(
                                    '${book.id}'
                                )">

                                <i class="bi bi-trash"></i>

                            </button>

                        </td>

                    </tr>
                `;

            }).join("");


        updateBookPagination(
            list.length
        );
    }


    /* =====================================================
       BOOK LIST PAGINATION
    ===================================================== */

    function updateBookPagination(total) {

        const box =
            document.getElementById(
                "bookPagination"
            );


        if (!box) {
            return;
        }


        box.innerHTML = "";


        if (total <= booksPerPage) {
            return;
        }


        const pages =
            Math.ceil(
                total /
                booksPerPage
            );


        let html = `
            <nav>
                <ul class="pagination justify-content-center">

                    <li class="page-item
                        ${bookPage === 1
                            ? "disabled"
                            : ""}">

                        <button
                            class="page-link"
                            onclick="changeBookPage(
                                ${bookPage - 1}
                            )">

                            Previous

                        </button>

                    </li>
        `;


        for (
            let i = 1;
            i <= pages;
            i++
        ) {

            html += `
                <li class="page-item
                    ${i === bookPage
                        ? "active"
                        : ""}">

                    <button
                        class="page-link"
                        onclick="changeBookPage(${i})">

                        ${i}

                    </button>

                </li>
            `;
        }


        html += `
                    <li class="page-item
                        ${bookPage === pages
                            ? "disabled"
                            : ""}">

                        <button
                            class="page-link"
                            onclick="changeBookPage(
                                ${bookPage + 1}
                            )">

                            Next

                        </button>

                    </li>

                </ul>
            </nav>
        `;


        box.innerHTML =
            html;
    }


    /* =====================================================
       CHANGE BOOK PAGE
    ===================================================== */

    window.changeBookPage =
        function(page) {

            const pages =
                Math.ceil(
                    books.length /
                    booksPerPage
                );


            if (
                page < 1 ||
                page > pages
            ) {
                return;
            }


            bookPage =
                page;


            display();
        };


    /* =====================================================
       ADD BOOK
       
       THIS WAS MISSING IN YOUR CODE.
    ===================================================== */

    form.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            /*
                Always get the latest books
                from localStorage.
            */

            books =
                getData(
                    KEYS.books
                );


            /* =============================================
               GET FORM VALUES
            ============================================= */

            const titleElement =
                document.getElementById(
                    "bookTitle"
                );


            const authorElement =
                document.getElementById(
                    "bookAuthor"
                );


            const categoryElement =
                document.getElementById(
                    "bookCategory"
                );


            const departmentElement =
                document.getElementById(
                    "bookDepartment"
                );


            const statusElement =
                document.getElementById(
                    "bookStatus"
                );


            /*
                Check that all required
                elements exist.
            */

            if (
                !titleElement ||
                !authorElement ||
                !categoryElement ||
                !departmentElement ||
                !statusElement
            ) {

                console.error(
                    "Book form fields not found. Check the IDs in your HTML."
                );

                return;
            }


            const title =
                titleElement.value.trim();


            const author =
                authorElement.value.trim();


            const category =
                categoryElement.value.trim();


            const department =
                departmentElement.value.trim();


            const status =
                statusElement.value;


            /* =============================================
               VALIDATION
            ============================================= */

            if (
                !title ||
                !author ||
                !category ||
                !department ||
                !status
            ) {

                alert(
                    "Please fill all book fields."
                );

                return;
            }


            /* =============================================
               CREATE NEW BOOK
            ============================================= */

            const newBook = {

                id:
                    getNextId(
                        KEYS.books,
                        "B"
                    ),

                title:
                    title,

                author:
                    author,

                category:
                    category,

                department:
                    department,

                status:
                    status

            };


            /* =============================================
               ADD BOOK TO ARRAY
            ============================================= */

books.push(
    newBook
);


/* =============================================
   SAVE BOOK TO LOCAL STORAGE
============================================= */

saveData(
    KEYS.books,
    books
);


/* =============================================
   NEW BOOK NOTIFICATION
============================================= */

notifyNewBook(
    newBook.title,
    newBook.author
);


/*
    IMPORTANT:
    Start from page 1 so the newly
    added book can immediately be seen.
*/

bookPage = 1;

departmentPage = 1;


            /* =============================================
               REFRESH BOOK TABLE
            ============================================= */

            display();


            /* =============================================
               REFRESH STATISTICS
            ============================================= */

            updateBookStatistics();


            /* =============================================
               REFRESH DEPARTMENT SUMMARY
            ============================================= */

            updateDepartmentSummary();


            /* =============================================
               REFRESH DASHBOARD
            ============================================= */

            updateDashboard();


            /* =============================================
               CLEAR FORM
            ============================================= */

            form.reset();


            /* =============================================
               CLOSE MODAL IF BOOK FORM IS IN MODAL
            ============================================= */

            const addBookModal =
                document.getElementById(
                    "addBookModal"
                );


            if (
                addBookModal &&
                typeof bootstrap !==
                    "undefined"
            ) {

                bootstrap.Modal
                    .getOrCreateInstance(
                        addBookModal
                    )
                    .hide();
            }


            /* =============================================
               SUCCESS MESSAGE
            ============================================= */

            alert(
                "Book added successfully!"
            );

        }
    );


    /* =====================================================
       BOOK STATISTICS
    ===================================================== */

    function updateBookStatistics() {

        const total =
            books.length;


        const available =
            books.filter(
                function(book) {

                    return book.status ===
                        "Available";

                }
            ).length;


        const issued =
            books.filter(
                function(book) {

                    return book.status ===
                        "Issued";

                }
            ).length;


        const totalElement =
            document.getElementById(
                "totalBooks"
            );


        const availableElement =
            document.getElementById(
                "availableBooks"
            );


        const issuedElement =
            document.getElementById(
                "issuedBooks"
            );


        if (totalElement) {

            totalElement.textContent =
                total;
        }


        if (availableElement) {

            availableElement.textContent =
                available;
        }


        if (issuedElement) {

            issuedElement.textContent =
                issued;
        }
    }


    /* =====================================================
       DEPARTMENT SUMMARY WITH PAGINATION
    ===================================================== */

    function updateDepartmentSummary() {

        summary.innerHTML = "";


        if (!books.length) {

            summary.innerHTML =
                emptyRow(
                    4,
                    "No department data available."
                );

            updateDepartmentPagination(0);

            return;
        }


        const departments = {};


        books.forEach(
            function(book) {

                const department =
                    book.department ||
                    "General";


                if (
                    !departments[
                        department
                    ]
                ) {

                    departments[
                        department
                    ] = {

                        total: 0,

                        issued: 0,

                        available: 0

                    };
                }


                departments[
                    department
                ].total++;


                if (
                    book.status ===
                    "Issued"
                ) {

                    departments[
                        department
                    ].issued++;
                }


                if (
                    book.status ===
                    "Available"
                ) {

                    departments[
                        department
                    ].available++;
                }

            }
        );


        const departmentList =
            Object.keys(
                departments
            ).sort();


        const totalPages =
            Math.ceil(
                departmentList.length /
                departmentsPerPage
            );


        if (
            departmentPage >
            totalPages
        ) {

            departmentPage =
                totalPages || 1;
        }


        const start =
            (departmentPage - 1) *
            departmentsPerPage;


        const pageDepartments =
            departmentList.slice(
                start,
                start + departmentsPerPage
            );


        pageDepartments.forEach(
            function(department) {

                const data =
                    departments[
                        department
                    ];


                const row =
                    document.createElement(
                        "tr"
                    );


                row.style.cursor =
                    "pointer";


                row.title =
                    "Click to view books";


                row.addEventListener(
                    "click",
                    function() {

                        const departmentBooks =
                            books.filter(
                                function(book) {

                                    return book.department ===
                                        department;

                                }
                            );


                        bookPage = 1;


                        display(
                            departmentBooks
                        );


                        const title =
                            document.getElementById(
                                "bookListTitle"
                            );


                        if (title) {

                            title.textContent =
                                `${department} Books (${departmentBooks.length})`;
                        }


                        const tableBody =
                            document.getElementById(
                                "bookTableBody"
                            );


                        if (tableBody) {

                            window.scrollTo({

                                top:
                                    tableBody
                                        .getBoundingClientRect()
                                        .top +
                                    window.scrollY -
                                    150,

                                behavior:
                                    "smooth"

                            });
                        }

                    }
                );


                row.innerHTML = `

                    <td>

                        <strong>
                            ${escapeHTML(
                                department
                            )}
                        </strong>

                    </td>

                    <td>
                        ${data.total}
                    </td>

                    <td>
                        <span class="badge bg-danger">
                            ${data.issued}
                        </span>
                    </td>

                    <td>
                        <span class="badge bg-success">
                            ${data.available}
                        </span>
                    </td>

                `;


                summary.appendChild(
                    row
                );

            }
        );


        updateDepartmentPagination(
            departmentList.length
        );
    }


    /* =====================================================
       DEPARTMENT PAGINATION
    ===================================================== */

    function updateDepartmentPagination(total) {

        const box =
            document.getElementById(
                "departmentPagination"
            );


        if (!box) {
            return;
        }


        box.innerHTML = "";


        if (
            total <=
            departmentsPerPage
        ) {
            return;
        }


        const pages =
            Math.ceil(
                total /
                departmentsPerPage
            );


        let html = `
            <nav>
                <ul class="pagination justify-content-center">

                    <li class="page-item
                        ${departmentPage === 1
                            ? "disabled"
                            : ""}">

                        <button
                            class="page-link"
                            onclick="changeDepartmentPage(
                                ${departmentPage - 1}
                            )">

                            Previous

                        </button>

                    </li>
        `;


        for (
            let i = 1;
            i <= pages;
            i++
        ) {

            html += `
                <li class="page-item
                    ${i === departmentPage
                        ? "active"
                        : ""}">

                    <button
                        class="page-link"
                        onclick="changeDepartmentPage(${i})">

                        ${i}

                    </button>

                </li>
            `;
        }


        html += `
                    <li class="page-item
                        ${departmentPage === pages
                            ? "disabled"
                            : ""}">

                        <button
                            class="page-link"
                            onclick="changeDepartmentPage(
                                ${departmentPage + 1}
                            )">

                            Next

                        </button>

                    </li>

                </ul>
            </nav>
        `;


        box.innerHTML =
            html;
    }


    /* =====================================================
       CHANGE DEPARTMENT PAGE
    ===================================================== */

    window.changeDepartmentPage =
        function(page) {

            const departments = {};


            books.forEach(
                function(book) {

                    const department =
                        book.department ||
                        "General";


                    if (
                        !departments[
                            department
                        ]
                    ) {

                        departments[
                            department
                        ] = true;
                    }

                }
            );


            const total =
                Object.keys(
                    departments
                ).length;


            const pages =
                Math.ceil(
                    total /
                    departmentsPerPage
                );


            if (
                page < 1 ||
                page > pages
            ) {
                return;
            }


            departmentPage =
                page;


            updateDepartmentSummary();
        };


    /* =====================================================
       EDIT BOOK
    ===================================================== */

    window.editBook =
        function(bookId) {

            const book =
                books.find(
                    function(item) {

                        return item.id ===
                            bookId;

                    }
                );


            if (!book) {
                return;
            }


            const editBookId =
                document.getElementById(
                    "editBookId"
                );

            const editBookTitle =
                document.getElementById(
                    "editBookTitle"
                );

            const editBookAuthor =
                document.getElementById(
                    "editBookAuthor"
                );

            const editBookStatus =
                document.getElementById(
                    "editBookStatus"
                );

            const editBookCategory =
                document.getElementById(
                    "editBookCategory"
                );

            const editBookDepartment =
                document.getElementById(
                    "editBookDepartment"
                );


            if (editBookId) {
                editBookId.value =
                    book.id;
            }


            if (editBookTitle) {
                editBookTitle.value =
                    book.title;
            }


            if (editBookAuthor) {
                editBookAuthor.value =
                    book.author;
            }


            if (editBookStatus) {
                editBookStatus.value =
                    book.status;
            }


            if (editBookCategory) {
                editBookCategory.value =
                    book.category;
            }


            if (editBookDepartment) {
                editBookDepartment.value =
                    book.department;
            }


            const modal =
                document.getElementById(
                    "editBookModal"
                );


            if (modal) {

                bootstrap.Modal
                    .getOrCreateInstance(
                        modal
                    )
                    .show();
            }
        };


    /* =====================================================
       UPDATE BOOK
    ===================================================== */

    if (editForm) {

        editForm.addEventListener(
            "submit",
            function(e) {

                e.preventDefault();


                books =
                    getData(
                        KEYS.books
                    );


                const bookId =
                    document.getElementById(
                        "editBookId"
                    ).value;


                const book =
                    books.find(
                        function(item) {

                            return item.id ===
                                bookId;

                        }
                    );


                if (!book) {
                    return;
                }


                book.title =
                    document.getElementById(
                        "editBookTitle"
                    ).value.trim();


                book.author =
                    document.getElementById(
                        "editBookAuthor"
                    ).value.trim();


                book.status =
                    document.getElementById(
                        "editBookStatus"
                    ).value;


                book.category =
                    document.getElementById(
                        "editBookCategory"
                    ).value;


                book.department =
                    document.getElementById(
                        "editBookDepartment"
                    ).value;


                saveData(
                    KEYS.books,
                    books
                );


                bookPage = 1;


                display();


                updateBookStatistics();


                updateDepartmentSummary();


                updateDashboard();


                const modal =
                    document.getElementById(
                        "editBookModal"
                    );


                if (modal) {

                    bootstrap.Modal
                        .getOrCreateInstance(
                            modal
                        )
                        .hide();
                }


                alert(
                    "Book updated successfully!"
                );

            }
        );
    }


    /* =====================================================
       DELETE BOOK
    ===================================================== */

    window.deleteBook =
        function(bookId) {

            books =
                getData(
                    KEYS.books
                );


            const book =
                books.find(
                    function(item) {

                        return item.id ===
                            bookId;

                    }
                );


            if (!book) {
                return;
            }


            if (
                !confirm(
                    `Are you sure you want to delete "${book.title}"?`
                )
            ) {
                return;
            }


            if (
                book.status ===
                "Issued"
            ) {

                alert(
                    "This book is currently issued. Return the book before deleting it."
                );

                return;
            }


            books =
                books.filter(
                    function(item) {

                        return item.id !==
                            bookId;

                    }
                );


            saveData(
                KEYS.books,
                books
            );


            bookPage = 1;


            display();


            updateBookStatistics();


            updateDepartmentSummary();


            updateDashboard();


            alert(
                "Book deleted successfully!"
            );
        };


    /* =====================================================
       SEARCH BOOK
    ===================================================== */

    const search =
        document.getElementById(
            "bookSearch"
        );


    const listTitle =
        document.getElementById(
            "bookListTitle"
        );


    if (search) {

        search.addEventListener(
            "input",
            function() {

                const text =
                    search.value
                        .toLowerCase()
                        .trim();


                if (!text) {

                    bookPage = 1;

                    display();


                    if (listTitle) {

                        listTitle.textContent =
                            "All Books";
                    }

                    return;
                }


                const filtered =
                    books.filter(
                        function(book) {

                            const data =
                                `${book.id}
                                 ${book.title}
                                 ${book.author}
                                 ${book.category}
                                 ${book.department}
                                 ${book.status}`
                                    .toLowerCase();


                            return data.includes(
                                text
                            );
                        }
                    );


                bookPage = 1;


                display(
                    filtered
                );


                if (listTitle) {

                    listTitle.textContent =
                        `${filtered.length} result(s) found`;
                }

            }
        );
    }


    /* =====================================================
       SHOW ALL BOOKS
    ===================================================== */

    const showAll =
        document.getElementById(
            "showAllBooks"
        );


    if (showAll) {

        showAll.addEventListener(
            "click",
            function() {

                if (search) {
                    search.value = "";
                }


                bookPage = 1;


                display();


                if (listTitle) {

                    listTitle.textContent =
                        "All Books";
                }

            }
        );
    }


    /* =====================================================
       UPDATE WHEN DATA CHANGES
    ===================================================== */

    window.addEventListener(
        "libraryDataChanged",
        function() {

            books =
                getData(
                    KEYS.books
                );


            display();


            updateBookStatistics();


            updateDepartmentSummary();

        }
    );


    window.addEventListener(
        "storage",
        function(e) {

            if (
                e.key ===
                KEYS.books
            ) {

                books =
                    getData(
                        KEYS.books
                    );


                display();


                updateBookStatistics();


                updateDepartmentSummary();

            }

        }
    );


    /* =====================================================
       INITIAL DISPLAY
    ===================================================== */

    display();

    updateBookStatistics();

    updateDepartmentSummary();

}


/* =========================================================
   ISSUE / RETURN
   TWO SEPARATE TABLES WITH SEPARATE PAGINATION
========================================================= */

function initIssueReturn() {

    /* =====================================================
       FORM ELEMENTS
    ===================================================== */

    const form =
        document.getElementById("issueForm");

    const bookSelect =
        document.getElementById("issueBook");

    const memberSelect =
        document.getElementById("issueMember");

    const issueDate =
        document.getElementById("issueDate");

    const returnDate =
        document.getElementById("returnDate");


    /* =====================================================
       TWO TABLES
    ===================================================== */

    const issuedTable =
        document.getElementById(
            "issuedTableBody"
        );

    const returnTable =
        document.getElementById(
            "returnTableBody"
        );


    if (
        !form ||
        !bookSelect ||
        !memberSelect ||
        !issueDate ||
        !returnDate ||
        !issuedTable ||
        !returnTable
    ) {
        return;
    }


    /* =====================================================
       DATA
    ===================================================== */

    let books =
        getData(KEYS.books);

    let members =
        getData(KEYS.members);

    let issues =
        getData(KEYS.issues);


    /* =====================================================
       PAGINATION SETTINGS
    ===================================================== */

    const rowsPerPage = 5;


    /* =====================================================
       SEPARATE CURRENT PAGES
    ===================================================== */

    let issuedCurrentPage = 1;

    let returnCurrentPage = 1;


    /* =====================================================
       PAGINATION ELEMENTS
    ===================================================== */

    const issuedPagination =
        document.getElementById(
            "issuedPagination"
        );

    const returnPagination =
        document.getElementById(
            "returnPagination"
        );


    if (
        !issuedPagination ||
        !returnPagination
    ) {
        return;
    }


    /* =====================================================
       DATE SETUP
    ===================================================== */

    issueDate.value =
        today();

    issueDate.min =
        today();

    issueDate.max =
        today();

    returnDate.min =
        today();


    /* =====================================================
       LOAD BOOKS AND MEMBERS
    ===================================================== */

    function loadOptions() {

        books =
            getData(KEYS.books);

        members =
            getData(KEYS.members);


        /* BOOKS */

        bookSelect.innerHTML =
            `
            <option value="">
                Select Book
            </option>
            `;


        books
            .filter(function(book) {

                return book.status ===
                    "Available";

            })
            .forEach(function(book) {

                bookSelect.innerHTML +=
                    `
                    <option value="${escapeHTML(book.id)}">

                        ${escapeHTML(book.title)}
                        -
                        ${escapeHTML(book.author)}

                    </option>
                    `;

            });


        /* MEMBERS */

        memberSelect.innerHTML =
            `
            <option value="">
                Select Member
            </option>
            `;


        members
            .filter(function(member) {

                return member.status ===
                    "Active";

            })
            .forEach(function(member) {

                memberSelect.innerHTML +=
                    `
                    <option value="${escapeHTML(member.id)}">

                        ${escapeHTML(member.name)}
                        -
                        ${escapeHTML(member.id)}

                    </option>
                    `;

            });
    }


    /* =====================================================
       GET ISSUED RECORDS
    ===================================================== */

    function getIssuedRecords() {

        issues =
            getData(KEYS.issues);

        return issues.filter(
            function(issue) {

                return issue.status ===
                    "Issued";

            }
        );
    }


    /* =====================================================
       GET RETURNED RECORDS
    ===================================================== */

    function getReturnedRecords() {

        issues =
            getData(KEYS.issues);

        return issues.filter(
            function(issue) {

                return issue.status ===
                    "Returned";

            }
        );
    }


    /* =====================================================
       DISPLAY ISSUED TABLE
    ===================================================== */

    function displayIssuedTable() {

        const issuedList =
            getIssuedRecords();


        const totalRows =
            issuedList.length;


        const totalPages =
            Math.ceil(
                totalRows /
                rowsPerPage
            );


        /* Correct page if records are deleted/returned */

        if (
            issuedCurrentPage >
                totalPages &&
            totalPages > 0
        ) {

            issuedCurrentPage =
                totalPages;

        }


        if (issuedCurrentPage < 1) {

            issuedCurrentPage = 1;

        }


        /* NO DATA */

        if (!totalRows) {

            issuedTable.innerHTML =
                emptyRow(
                    6,
                    "No issued books found."
                );

            issuedPagination.innerHTML =
                "";

            return;
        }


        /* CURRENT PAGE */

        const start =
            (issuedCurrentPage - 1) *
            rowsPerPage;


        const end =
            start +
            rowsPerPage;


        const pageList =
            issuedList
                .slice()
                .reverse()
                .slice(
                    start,
                    end
                );


        /* DISPLAY ISSUED RECORDS */

        issuedTable.innerHTML =
            pageList
                .map(function(issue) {

                    const overdue =
                        issue.returnDate &&
                        issue.returnDate <
                            today();


                    let status;


                    if (overdue) {

                        status =
                            `
                            <span class="badge bg-danger">
                                Overdue
                            </span>
                            `;

                    } else {

                        status =
                            `
                            <span class="badge bg-primary">
                                Issued
                            </span>
                            `;
                    }


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    issue.bookName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    issue.memberName
                                )}
                            </td>

                            <td>
                                ${formatDate(
                                    issue.issueDate
                                )}
                            </td>

                            <td>
                                ${formatDate(
                                    issue.returnDate
                                )}
                            </td>

                            <td>
                                ${status}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-success"
                                    onclick="returnBook('${issue.id}')">

                                    <i class="bi bi-arrow-return-left"></i>

                                    Return

                                </button>

                            </td>

                        </tr>
                    `;

                })
                .join("");


        createIssuedPagination(
            totalRows,
            totalPages
        );
    }


    /* =====================================================
       ISSUED PAGINATION
    ===================================================== */

    function createIssuedPagination(
        totalRows,
        totalPages
    ) {

        issuedPagination.innerHTML =
            "";


        if (totalPages <= 1) {
            return;
        }


        issuedPagination.innerHTML =
            `
            <nav>

                <ul class="pagination mb-0">

                    <!-- PREVIOUS -->

                    <li class="page-item
                        ${
                            issuedCurrentPage === 1
                                ? "disabled"
                                : ""
                        }">

                        <button
                            type="button"
                            class="page-link"
                            id="issuedPrevious">

                            Previous

                        </button>

                    </li>


                    <!-- PAGE NUMBERS -->

                    ${Array.from(
                        {
                            length: totalPages
                        },
                        function(_, index) {

                            const page =
                                index + 1;


                            return `
                                <li class="page-item
                                    ${
                                        page ===
                                        issuedCurrentPage
                                            ? "active"
                                            : ""
                                    }">

                                    <button
                                        type="button"
                                        class="page-link"
                                        data-issued-page="${page}">

                                        ${page}

                                    </button>

                                </li>
                            `;

                        }
                    ).join("")}


                    <!-- NEXT -->

                    <li class="page-item
                        ${
                            issuedCurrentPage ===
                            totalPages
                                ? "disabled"
                                : ""
                        }">

                        <button
                            type="button"
                            class="page-link"
                            id="issuedNext">

                            Next

                        </button>

                    </li>

                </ul>

            </nav>
            `;


        /* =================================================
           PREVIOUS
        ================================================= */

        const previous =
            document.getElementById(
                "issuedPrevious"
            );


        if (previous) {

            previous.addEventListener(
                "click",
                function() {

                    if (
                        issuedCurrentPage > 1
                    ) {

                        issuedCurrentPage--;

                        displayIssuedTable();

                    }

                }
            );
        }


        /* =================================================
           NEXT
        ================================================= */

        const next =
            document.getElementById(
                "issuedNext"
            );


        if (next) {

            next.addEventListener(
                "click",
                function() {

                    if (
                        issuedCurrentPage <
                        totalPages
                    ) {

                        issuedCurrentPage++;

                        displayIssuedTable();

                    }

                }
            );
        }


        /* =================================================
           PAGE NUMBERS
        ================================================= */

        issuedPagination
            .querySelectorAll(
                "[data-issued-page]"
            )
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        issuedCurrentPage =
                            Number(
                                this.dataset
                                    .issuedPage
                            );

                        displayIssuedTable();

                    }
                );

            });
    }


    /* =====================================================
       DISPLAY RETURNED TABLE
    ===================================================== */

    function displayReturnTable() {

        const returnedList =
            getReturnedRecords();


        const totalRows =
            returnedList.length;


        const totalPages =
            Math.ceil(
                totalRows /
                rowsPerPage
            );


        /* Correct page */

        if (
            returnCurrentPage >
                totalPages &&
            totalPages > 0
        ) {

            returnCurrentPage =
                totalPages;

        }


        if (returnCurrentPage < 1) {

            returnCurrentPage = 1;

        }


        /* NO DATA */

        if (!totalRows) {

            returnTable.innerHTML =
                emptyRow(
                    6,
                    "No returned books found."
                );

            returnPagination.innerHTML =
                "";

            return;
        }


        /* CURRENT PAGE */

        const start =
            (returnCurrentPage - 1) *
            rowsPerPage;


        const end =
            start +
            rowsPerPage;


        const pageList =
            returnedList
                .slice()
                .reverse()
                .slice(
                    start,
                    end
                );


        /* DISPLAY RETURNED RECORDS */

        returnTable.innerHTML =
            pageList
                .map(function(issue) {

                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    issue.bookName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    issue.memberName
                                )}
                            </td>

                            <td>
                                ${formatDate(
                                    issue.issueDate
                                )}
                            </td>

                            <td>
                                ${formatDate(
                                    issue.returnDate
                                )}
                            </td>

                            <td>
                                ${
                                    issue.actualReturnDate
                                        ? formatDate(
                                            issue.actualReturnDate
                                        )
                                        : "-"
                                }
                            </td>

                            <td>

                                <span
                                    class="badge bg-success">

                                    Returned

                                </span>

                            </td>

                        </tr>
                    `;

                })
                .join("");


        createReturnPagination(
            totalRows,
            totalPages
        );
    }


    /* =====================================================
       RETURN PAGINATION
    ===================================================== */

    function createReturnPagination(
        totalRows,
        totalPages
    ) {

        returnPagination.innerHTML =
            "";


        if (totalPages <= 1) {
            return;
        }


        returnPagination.innerHTML =
            `
            <nav>

                <ul class="pagination mb-0">

                    <!-- PREVIOUS -->

                    <li class="page-item
                        ${
                            returnCurrentPage === 1
                                ? "disabled"
                                : ""
                        }">

                        <button
                            type="button"
                            class="page-link"
                            id="returnPrevious">

                            Previous

                        </button>

                    </li>


                    <!-- PAGE NUMBERS -->

                    ${Array.from(
                        {
                            length: totalPages
                        },
                        function(_, index) {

                            const page =
                                index + 1;


                            return `
                                <li class="page-item
                                    ${
                                        page ===
                                        returnCurrentPage
                                            ? "active"
                                            : ""
                                    }">

                                    <button
                                        type="button"
                                        class="page-link"
                                        data-return-page="${page}">

                                        ${page}

                                    </button>

                                </li>
                            `;

                        }
                    ).join("")}


                    <!-- NEXT -->

                    <li class="page-item
                        ${
                            returnCurrentPage ===
                            totalPages
                                ? "disabled"
                                : ""
                        }">

                        <button
                            type="button"
                            class="page-link"
                            id="returnNext">

                            Next

                        </button>

                    </li>

                </ul>

            </nav>
            `;


        /* =================================================
           PREVIOUS
        ================================================= */

        const previous =
            document.getElementById(
                "returnPrevious"
            );


        if (previous) {

            previous.addEventListener(
                "click",
                function() {

                    if (
                        returnCurrentPage > 1
                    ) {

                        returnCurrentPage--;

                        displayReturnTable();

                    }

                }
            );
        }


        /* =================================================
           NEXT
        ================================================= */

        const next =
            document.getElementById(
                "returnNext"
            );


        if (next) {

            next.addEventListener(
                "click",
                function() {

                    if (
                        returnCurrentPage <
                        totalPages
                    ) {

                        returnCurrentPage++;

                        displayReturnTable();

                    }

                }
            );
        }


        /* =================================================
           PAGE NUMBERS
        ================================================= */

        returnPagination
            .querySelectorAll(
                "[data-return-page]"
            )
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        returnCurrentPage =
                            Number(
                                this.dataset
                                    .returnPage
                            );

                        displayReturnTable();

                    }
                );

            });
    }


    /* =====================================================
       ISSUE BOOK
    ===================================================== */

    form.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            books =
                getData(KEYS.books);

            members =
                getData(KEYS.members);

            issues =
                getData(KEYS.issues);


            const selectedBookId =
                bookSelect.value;


            const selectedMemberId =
                memberSelect.value;


            const book =
                books.find(
                    function(b) {

                        return b.id ===
                            selectedBookId;

                    }
                );


            const member =
                members.find(
                    function(m) {

                        return m.id ===
                            selectedMemberId;

                    }
                );


            if (
                !book ||
                !member ||
                !issueDate.value ||
                !returnDate.value
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }


            if (
                returnDate.value <
                issueDate.value
            ) {

                alert(
                    "Return date cannot be before issue date."
                );

                return;
            }


            if (
                book.status !==
                "Available"
            ) {

                alert(
                    "This book is already issued."
                );

                return;
            }


            const alreadyIssued =
                issues.some(
                    function(issue) {

                        return (
                            issue.bookId ===
                                book.id &&
                            issue.status ===
                                "Issued"
                        );

                    }
                );


            if (alreadyIssued) {

                alert(
                    "This book already has an active issue record."
                );

                return;
            }


            const issue = {

                id:
                    "I" +
                    Date.now(),

                bookId:
                    book.id,

                bookName:
                    book.title,

                memberId:
                    member.id,

                memberName:
                    member.name,

                issueDate:
                    issueDate.value,

                returnDate:
                    returnDate.value,

                actualReturnDate:
                    null,

                status:
                    "Issued"

            };


            issues.push(issue);


            book.status =
                "Issued";


            localStorage.setItem(
                KEYS.issues,
                JSON.stringify(issues)
            );


            localStorage.setItem(
                KEYS.books,
                JSON.stringify(books)
            );

            addNotification(
    "Book Successfully Issued",
    `The book "${book.title}" has been issued to ${member.name}.`,
    "issued"
);


            window.dispatchEvent(
                new Event(
                    "libraryDataChanged"
                )
            );


            issuedCurrentPage = 1;


            loadOptions();

            displayIssuedTable();

            displayReturnTable();

            updateDashboard();


            form.reset();


            issueDate.value =
                today();

            issueDate.min =
                today();

            issueDate.max =
                today();

            returnDate.min =
                today();


            alert(
                "Book issued successfully!"
            );

        }
    );


/* =====================================================
   RETURN BOOK
===================================================== */

window.returnBook =
    function(issueId) {

        issues =
            getData(KEYS.issues);

        books =
            getData(KEYS.books);


        const issue =
            issues.find(
                function(item) {

                    return item.id === issueId;

                }
            );


        if (!issue) {
            return;
        }


        if (
            !confirm(
                `Return "${issue.bookName}" borrowed by ${issue.memberName}?`
            )
        ) {

            return;
        }


        /* CHANGE ISSUE STATUS */

        issue.status =
            "Returned";


        /* SAVE ACTUAL RETURN DATE */

        issue.actualReturnDate =
            today();


        /* FIND BOOK */

        const book =
            books.find(
                function(item) {

                    return item.id ===
                        issue.bookId;

                }
            );


        /* MAKE BOOK AVAILABLE */

        if (book) {

            book.status =
                "Available";

        }


        /* SAVE ISSUES */

        localStorage.setItem(
            KEYS.issues,
            JSON.stringify(issues)
        );


        /* SAVE BOOKS */

        localStorage.setItem(
            KEYS.books,
            JSON.stringify(books)
        );


        /* =================================================
           RETURNED BOOK NOTIFICATION
        ================================================= */

        notifyBookReturned(
            issue.bookName,
            issue.memberName,
            issue.id
        );


        /* INFORM OTHER LMS SECTIONS */

        window.dispatchEvent(
            new Event(
                "libraryDataChanged"
            )
        );


        /* RESET PAGINATION */

        issuedCurrentPage = 1;

        returnCurrentPage = 1;


        /* REFRESH PAGE */

        loadOptions();

        displayIssuedTable();

        displayReturnTable();

        updateDashboard();


        alert(
            "Book returned successfully!"
        );

    };
    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadOptions();

    displayIssuedTable();

    displayReturnTable();


    /* =====================================================
       DATA UPDATE
    ===================================================== */

    window.addEventListener(
        "libraryDataChanged",
        function() {

            books =
                getData(KEYS.books);

            members =
                getData(KEYS.members);

            issues =
                getData(KEYS.issues);


            issuedCurrentPage = 1;

            returnCurrentPage = 1;


            loadOptions();

            displayIssuedTable();

            displayReturnTable();

        }
    );


    /* =====================================================
       STORAGE UPDATE
    ===================================================== */

    window.addEventListener(
        "storage",
        function(e) {

            if (
                e.key === KEYS.books ||
                e.key === KEYS.members ||
                e.key === KEYS.issues
            ) {

                books =
                    getData(KEYS.books);

                members =
                    getData(KEYS.members);

                issues =
                    getData(KEYS.issues);


                issuedCurrentPage = 1;

                returnCurrentPage = 1;


                loadOptions();

                displayIssuedTable();

                displayReturnTable();

            }

        }
    );

}

/* =========================================================
   PROFILE
========================================================= */

function initProfile() {

    const form =
        document.getElementById("profileForm");

    if (!form) {
        return;
    }


    /* =====================================================
       FORM ELEMENTS
    ===================================================== */

    const name =
        document.getElementById("profileName");

    const email =
        document.getElementById("profileEmail");

    const phone =
        document.getElementById("profilePhone");

    const role =
        document.getElementById("profileRole");

    const memberId =
        document.getElementById("memberId");

    const department =
        document.getElementById("profileDepartment");

    const accountStatus =
        document.getElementById("accountStatus");

    const joiningDate =
        document.getElementById("joiningDate");

    const address =
        document.getElementById("profileAddress");

    const profilePhoto =
        document.getElementById("profilePhoto");

    /* set current date*/
    if (joiningDate && !joiningDate.value) {

    const today =
        new Date().toISOString().split("T")[0];

    joiningDate.value = today;
}


    /* =====================================================
       RESET BUTTON
    ===================================================== */

    const reset =
        document.getElementById("resetProfile");


    /* =====================================================
       PROFILE PREVIEW
    ===================================================== */

const previewName =
    document.getElementById("profilePreviewName");

const previewEmail =
    document.getElementById("profilePreviewEmail");

const previewPhoto =
    document.getElementById("profilePreviewPhoto");

const previewIcon =
    document.getElementById("profilePreviewIcon");

const previewRole =
    document.getElementById("profilePreviewRole");

if (profilePicture) {

    profilePicture.addEventListener(
        "change",
        function() {

            const file =
                profilePicture.files[0];

            if (!file) {
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function(e) {

                    previewPhoto.src =
                        e.target.result;

                    previewPhoto.classList.remove(
                        "d-none"
                    );

                    previewIcon.classList.add(
                        "d-none"
                    );

                    profile.profilePicture =
                        e.target.result;

                };

            reader.readAsDataURL(file);

        }
    );

}
    /* =====================================================
       DEFAULT PROFILE DATA
    ===================================================== */

    const defaultProfile = {

        name: "",

        email: "",

        phone: "",

        memberId: "M001",

        role: "Administrator",

        department: "",

        accountStatus: "Active",

        joiningDate: " ",

        address: "",

        profilePhoto: ""

    };


    /* =====================================================
       LOAD PROFILE FROM LOCAL STORAGE
    ===================================================== */

    let profile;

    try {

        profile = {

            ...defaultProfile,

            ...JSON.parse(
                localStorage.getItem(
                    KEYS.profile
                ) || "{}"
            )

        };

    } catch {

        profile = {
            ...defaultProfile
        };

    }


    /* =====================================================
       DISPLAY PROFILE
    ===================================================== */

    function display() {

        if (name) {

            name.value =
                profile.name || "";

        }


        if (email) {

            email.value =
                profile.email || "";

        }


        if (phone) {

            phone.value =
                profile.phone || "";

        }


        if (memberId) {

            memberId.value =
                profile.memberId || "M001";

        }
        if (role) {
    role.value = profile.role || "";
}




        if (department) {

            department.value =
                profile.department || "";

        }


        if (accountStatus) {

            accountStatus.value =
                profile.accountStatus ||
                "Active";

        }


/* =================================================
   CURRENT DATE
================================================= */

if (joiningDate) {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    joiningDate.value =
        `${year}-${month}-${day}`;

}

        if (address) {

            address.value =
                profile.address || "";

        }

        


        if (previewName) {

            previewName.textContent =
                profile.name ||
                "Library Administrator";

        }


        if (previewEmail) {

            previewEmail.textContent =
                profile.email ||
                "admin@library.com";

        }

  if (previewPhoto && previewIcon) {

    if (profile.profilePicture) {

        // PHOTO EXISTS

        previewPhoto.src =
            profile.profilePicture;

        previewPhoto.classList.remove("d-none");

        previewIcon.classList.add("d-none");

    } else {

        // NO PHOTO

        previewPhoto.src = "";

        previewPhoto.classList.add("d-none");

        previewIcon.classList.remove("d-none");

    }

}

    }


    /* =====================================================
       INITIAL DISPLAY
    ===================================================== */

    display();


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    form.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            /* =============================================
               REQUIRED FIELD VALIDATION
            ============================================= */

            if (
                !name ||
                !name.value.trim()
            ) {

                alert(
                    "Please enter your full name."
                );

                name.focus();

                return;
            }


            if (
                !email ||
                !email.value.trim()
            ) {

                alert(
                    "Please enter your email address."
                );

                email.focus();

                return;
            }


            if (
                !phone ||
                !phone.value.trim()
            ) {

                alert(
                    "Please enter your phone number."
                );

                phone.focus();

                return;
            }


            if (
                !department ||
                !department.value.trim()
            ) {

                alert(
                    "Please enter your department."
                );

                department.focus();

                return;
            }


            /* =============================================
               EMAIL VALIDATION
            ============================================= */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email.value.trim()
                )
            ) {

                alert(
                    "Please enter a valid email address."
                );

                email.focus();

                return;
            }


            /* =============================================
               PHONE VALIDATION
            ============================================= */

            if (
                !/^[0-9]{10}$/.test(
                    phone.value.trim()
                )
            ) {

                alert(
                    "Please enter a valid 10 digit phone number."
                );

                phone.focus();

                return;
            }


            /* =============================================
               SAVE PROFILE DATA
            ============================================= */

            profile = {

                name:
                    name.value.trim(),

                email:
                    email.value.trim(),

                phone:
                    phone.value.trim(),

                memberId:
                    memberId ?
                    memberId.value :
                    "M001",

                role:
                    role
                        ? Array.from(role.selectedOptions)
                                        .map(function(option) {

                                        return option.value;

              })
        : [],

                department:
                    department.value.trim(),

                accountStatus:
                    accountStatus ?
                    accountStatus.value :
                    "Active",

                joiningDate:
                    joiningDate ?
                    joiningDate.value :
                    "",

                address:
                    address ?
                    address.value.trim() :
                    "",

                profilePicture:
                    previewPhoto ?
                    previewPhoto.src :
                    ""

             };
             console.log(
                "selected Roles:",
                profile.role
                
             );


            /* =============================================
               SAVE TO LOCAL STORAGE
            ============================================= */

            localStorage.setItem(
                KEYS.profile,
                JSON.stringify(profile)
            );


            /* =============================================
               UPDATE PREVIEW
            ============================================= */

            display();


            /* =============================================
               SUCCESS MESSAGE
            ============================================= */

            alert(
                "Profile updated successfully!"
            );

        }
    );


 /* =====================================================
   RESET PROFILE FORM
===================================================== */

const resetProfileBtn =
    document.getElementById("resetProfileBtn");


if (resetProfileBtn) {

    resetProfileBtn.addEventListener(
        "click",
        function() {

            /* ==============================
               REMOVE SAVED PROFILE DATA
            ============================== */

            localStorage.removeItem(
                KEYS.profile
            );


            /* ==============================
               RESET PROFILE OBJECT
            ============================== */

            profile = {
                profilePicture: ""
            };


            /* ==============================
               RESET FORM
            ============================== */

            if (form) {

                form.reset();

            }


            /* ==============================
               CLEAR TEXT FIELDS
            ============================== */

            if (name) {

                name.value = "";

            }


            if (email) {

                email.value = "";

            }


            if (phone) {

                phone.value = "";

            }


            if (department) {

                department.value = "";

            }


            if (address) {

                address.value = "";

            }


            /* ==============================
               RESET MEMBER ID
            ============================== */

            if (memberId) {

                memberId.value =
                    "M001";

            }


            /* ==============================
               RESET ROLE
            ============================== */

            if (role) {

                role.value =
                    "Administrator";

            }


            /* ==============================
               RESET ACCOUNT STATUS
            ============================== */

            if (accountStatus) {

                accountStatus.value =
                    "Active";

            }


            /* ==============================
               SET CURRENT DATE
            ============================== */

            if (joiningDate) {

                const today =
                    new Date();


                const year =
                    today.getFullYear();


                const month =
                    String(
                        today.getMonth() + 1
                    ).padStart(2, "0");


                const day =
                    String(
                        today.getDate()
                    ).padStart(2, "0");


                joiningDate.value =
                    `${year}-${month}-${day}`;

            }


            /* ==============================
               CLEAR FILE INPUT
            ============================== */

            if (profilePicture) {

                profilePicture.value = "";

            }


            /* ==============================
               HIDE UPLOADED PHOTO
            ============================== */

            if (previewPhoto) {

                previewPhoto.src = "";

                previewPhoto.classList.add(
                    "d-none"
                );

            }


            /* ==============================
               SHOW DEFAULT PROFILE ICON
            ============================== */

            if (previewIcon) {

                previewIcon.classList.remove(
                    "d-none"
                );

            }


            /* ==============================
               CLEAR PROFILE PREVIEW
            ============================== */

            if (previewName) {

                previewName.textContent = "";

            }


            if (previewEmail) {

                previewEmail.textContent = "";

            }


            if (previewRole) {

                if (
                    Array.isArray(profile.role) &&
                        profile.role.length > 0
                ) {

                    previewRole.textContent =
                        profile.role.join(", ");

                } else {

                    previewRole.textContent = "";

    }

}

        }
    );

}
}

/* =========================================================
   SIDEBAR
========================================================= */

function initSidebar() {

    const button =
        document.getElementById(
            "sidebarToggle"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (
        !button ||
        !sidebar
    ) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            sidebar.classList.toggle(
                "collapsed"
            );


            const mainContent =
                document.querySelector(
                    ".main-content"
                );


            if (mainContent) {

                mainContent.classList.toggle(
                    "expanded"
                );
            }

        }
    );
}

// =====================================================
// OVERDUE BOOK NOTIFICATION
// =====================================================

function notifyBookOverdue(
    bookTitle,
    memberName,
    returnDate
) {

    addNotification(
        "Book Overdue",
        `The book "${bookTitle}" issued to ${memberName} is overdue. The return date was ${returnDate}.`,
        "overdue"
    );
}


// =====================================================
// CHECK OVERDUE BOOKS
// =====================================================

function checkOverdueBooks() {

    const issues =
        getData(KEYS.issues);

    const todayDate =
        new Date();

    todayDate.setHours(
        0,
        0,
        0,
        0
    );


    issues.forEach(function(issue) {

        // Don't check returned books
        if (
            issue.status &&
            issue.status.toLowerCase() === "returned"
        ) {
            return;
        }


        // No return date
        if (!issue.returnDate) {
            return;
        }


        const returnDate =
            new Date(issue.returnDate);

        returnDate.setHours(
            0,
            0,
            0,
            0
        );


        // Overdue
        if (returnDate < todayDate) {

            notifyBookOverdue(
                issue.bookName,
                issue.memberName,
                issue.returnDate
            );

        }

    });
}

/* =====================================================
   GLOBAL THEME SETTINGS
===================================================== */

const SETTINGS_KEY =
    "librarySettings";


function getGlobalSettings() {

    const stored =
        localStorage.getItem(
            SETTINGS_KEY
        );


    if (!stored) {

        return {
            theme: "light"
        };

    }


    try {

        return JSON.parse(
            stored
        );

    }
    catch (error) {

        return {
            theme: "light"
        };

    }

}



function applyGlobalTheme() {

    const settings =
        getGlobalSettings();


    if (
        settings.theme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }
    else {

        document.body.classList.remove(
            "dark-mode"
        );

    }

}


/* Apply theme whenever page opens */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        applyGlobalTheme();

    }
);

// =====================================================
// SIDEBAR TOGGLE + OVERDUE CHECK
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const sidebarToggle =
        document.getElementById("sidebarToggle");

    const sidebar =
        document.getElementById("sidebar");


    if (sidebarToggle && sidebar) {

        sidebarToggle.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "active"
                );

            }
        );

    }
    
    checkCalendarAnnouncement();

    // Book due tomorrow notification
    checkBookDueDates();    

});

// =====================================================
// CALENDAR BASED SYSTEM ANNOUNCEMENT
// =====================================================

function checkCalendarAnnouncement() {

    const today = new Date();

    const month =
        today.getMonth() + 1;

    const day =
        today.getDate();


    // Republic Day - January 26
    if (
        month === 1 &&
        day === 26
    ) {

        notifySystemAnnouncement(
            "Republic Day",
            "Happy Republic Day! The library wishes everyone a wonderful Republic Day."
        );

    }


    // Labour Day - May 1
    else if (
        month === 5 &&
        day === 1
    ) {

        notifySystemAnnouncement(
            "Labour Day",
            "Happy Labour Day! The library wishes everyone a happy and meaningful Labour Day."
        );

    }


    // Independence Day - August 15
    else if (
        month === 8 &&
        day === 15
    ) {

        notifySystemAnnouncement(
            "Independence Day",
            "Happy Independence Day! The library wishes everyone a proud and memorable Independence Day."
        );

    }




    // Christmas - December 25
    else if (
        month === 12 &&
        day === 25
    ) {

        notifySystemAnnouncement(
            "Christmas",
            "Merry Christmas! The library wishes everyone a joyful and wonderful Christmas."
        );

    }

}




/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initMembers();

        initBooks();

        initIssueReturn();

        initProfile();

        initSidebar();

        updateDashboard();

    }
);


/* =========================================================
   GLOBAL DATA UPDATE
========================================================= */

window.addEventListener(
    "libraryDataChanged",
    function() {

        updateDashboard();

    }
);


/* =========================================================
   STORAGE UPDATE

   Works when localStorage changes
   from another browser tab.
========================================================= */

window.addEventListener(
    "storage",
    function(e) {

        if (
            e.key === KEYS.books ||
            e.key === KEYS.members ||
            e.key === KEYS.issues
        ) {

            updateDashboard();

        }

    }
);

/* =====================================================
   SIDEBAR TOGGLE
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const mainContent = document.querySelector(".main-content");

    if (!sidebar || !sidebarToggle) {
        console.error("Sidebar or sidebar button not found.");
        return;
    }

    sidebarToggle.addEventListener("click", function () {

        sidebar.classList.toggle("sidebar-open");

        if (mainContent) {
            mainContent.classList.toggle("sidebar-shift");
        }

    });

});

function createPagination(tableId, paginationId) {

    const tableBody = document.getElementById(tableId);
    const pagination = document.getElementById(paginationId);

    if (!tableBody || !pagination) {
        return;
    }

    const allRows = Array.from(
        tableBody.querySelectorAll("tr")
    );

    // Remove empty/no-data row
    const rows = allRows.filter(function (row) {

        const cell = row.querySelector("td");

        return !(
            cell &&
            cell.hasAttribute("colspan")
        );

    });

    const rowsPerPage = 5;

    let currentPage = 1;

    const totalRows = rows.length;

    const totalPages = Math.ceil(
        totalRows / rowsPerPage
    );

    // If there are no rows
    if (totalRows === 0) {

        pagination.innerHTML = "";

        return;
    }

    function showPage(page) {

        currentPage = page;

        const start =
            (currentPage - 1) * rowsPerPage;

        const end =
            start + rowsPerPage;

        rows.forEach(function (row, index) {

            if (
                index >= start &&
                index < end
            ) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });

        createPaginationButtons();
    }


    function createPaginationButtons() {

        pagination.innerHTML = "";

        const container =
            document.createElement("div");

        container.className =
            "pagination-container w-100";


        /* INFORMATION */

        const info =
            document.createElement("span");

        info.className =
            "pagination-info";

        const start =
            (currentPage - 1) * rowsPerPage + 1;

        const end =
            Math.min(
                currentPage * rowsPerPage,
                totalRows
            );

        info.textContent =
            `Showing ${start} to ${end} of ${totalRows} entries`;


        /* PAGINATION */

        const nav =
            document.createElement("nav");

        const ul =
            document.createElement("ul");

        ul.className =
            "pagination mb-0";


        /* PREVIOUS */

        const previous =
            document.createElement("li");

        previous.className =
            "page-item";

        if (currentPage === 1) {
            previous.classList.add("disabled");
        }

        previous.innerHTML =
            `<button class="page-link" type="button">
                Previous
             </button>`;

        previous.querySelector("button")
            .addEventListener("click", function () {

                if (currentPage > 1) {

                    showPage(
                        currentPage - 1
                    );

                }

            });

        ul.appendChild(previous);


        /* PAGE NUMBERS */

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const li =
                document.createElement("li");

            li.className =
                "page-item";

            if (page === currentPage) {
                li.classList.add("active");
            }

            li.innerHTML =
                `<button class="page-link" type="button">
                    ${page}
                 </button>`;

            li.querySelector("button")
                .addEventListener("click", function () {

                    showPage(page);

                });

            ul.appendChild(li);
        }


        /* NEXT */

        const next =
            document.createElement("li");

        next.className =
            "page-item";

        if (currentPage === totalPages) {
            next.classList.add("disabled");
        }

        next.innerHTML =
            `<button class="page-link" type="button">
                Next
             </button>`;

        next.querySelector("button")
            .addEventListener("click", function () {

                if (currentPage < totalPages) {

                    showPage(
                        currentPage + 1
                    );

                }

            });

        ul.appendChild(next);


        nav.appendChild(ul);

        container.appendChild(info);

        container.appendChild(nav);

        pagination.appendChild(container);
    }


    showPage(1);
}

/* =====================================================
   NOTIFICATION MODULE
===================================================== */


// Load notifications from localStorage
let notifications = JSON.parse(
    localStorage.getItem("notifications")
) || [];

/* =====================================================
   NOTIFICATION SOUND
===================================================== */

function playNotificationSound() {

    const sound =
        new Audio("sound/notification.mp3");

    sound.volume = 1.0;

    sound.play().catch(function(error) {

        console.log(
            "Notification sound could not play:",
            error
        );

    });
}

/* =====================================================
   ADD NOTIFICATION
===================================================== */

function addNotification(
    title,
    description,
    type,
    referenceId = null
) {

    /* =================================================
   CHECK MASTER NOTIFICATION SETTING
================================================= */

const savedSettings =
    JSON.parse(
        localStorage.getItem(
            "librarySettings"
        ) || "{}"
    );


if (
    savedSettings.notificationsEnabled === false
) {
    return;
}
    

    // Always get latest notifications
    notifications =
        JSON.parse(
            localStorage.getItem(
                "notifications"
            )
        ) || [];


    /* =================================================
   CHECK DUPLICATE NOTIFICATION
================================================= */

const alreadyExists =
    notifications.some(
        function(notification) {

            /*
                If referenceId is available,
                check using notification type
                and reference ID.
            */

            if (referenceId) {

                return (
                    notification.type === type &&
                    notification.referenceId ===
                        referenceId
                );

            }


            /*
                Normal duplicate check
            */

            return (
                notification.title === title &&
                notification.description ===
                    description &&
                notification.type === type
            );

        }
    );


if (alreadyExists) {

    return;

}

    /* =================================================
       CREATE NOTIFICATION
    ================================================= */

    const newNotification = {

        id: Date.now(),

        type: type,

        title: title,

        description: description,

        referenceId: referenceId,

        date:
            new Date().toLocaleString(),

        read: false

    };


    notifications.unshift(
        newNotification
    );


    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );

    playNotificationSound();


    // Update notification panel
    displayNotifications();


    // Show popup
    showNotificationToast(
        title,
        description
    );

}
/* =====================================================
   NOTIFICATION CLICK
===================================================== */

function handleNotificationClick(notification) {

    switch (notification.type) {

        case "overdue":

        case "due":

        case "issued":

        case "returned":

            window.location.href =
                "issue-return.html";

            break;


        case "availability":

        case "new-book":

            window.location.href =
                "books.html";

            break;


        case "new-member":

            window.location.href =
                "members.html";

            break;


        case "announcement":

            // Stay on current page
            break;


        default:

            break;

    }

}

/* =====================================================
   CLEAR ALL NOTIFICATIONS
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const clearAllButton =
            document.getElementById(
                "clearAllNotifications"
            );


        if (!clearAllButton) {
            return;
        }


        clearAllButton.addEventListener(
            "click",
            function (event) {

                // Prevent notification panel
                // from receiving the click
                event.stopPropagation();


                if (
                    notifications.length === 0
                ) {

                    return;

                }


                const confirmClear =
                    confirm(
                        "Are you sure you want to clear all notifications?"
                    );


                if (!confirmClear) {
                    return;
                }


                // Remove all notifications
                notifications.length = 0;


                // Save empty notifications
                localStorage.setItem(
                    "notifications",
                    JSON.stringify(
                        notifications
                    )
                );


                // Refresh panel
                displayNotifications();


                // Update badge
                updateNotificationBadge();

            }
        );

    }
);





function showNotificationToast(
    title,
    message
) {

    const toastContainer =
        document.getElementById(
            "toastContainer"
        );

    if (!toastContainer) {
        return;
    }

    const toast =
        document.createElement("div");

    toast.className =
        "notification-toast";

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="bi bi-bell-fill"></i>
        </div>

        <div class="toast-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>

        <button
            type="button"
            onclick="this.parentElement.remove()">
            ×
        </button>
    `;

    toastContainer.appendChild(
        toast
    );

    setTimeout(function () {
        toast.remove();
    }, 5000);
}
/* =====================================================
   UPDATE NOTIFICATION BADGE
===================================================== */

function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!badge) {
        return;
    }


    const unreadCount =
        notifications.filter(
            notification =>
                !notification.read
        ).length;


    if (unreadCount > 0) {

        badge.textContent =
            unreadCount;

        badge.style.display =
            "inline-flex";

    } else {

        badge.style.display =
            "none";

    }

}


/* =====================================================
   DISPLAY NOTIFICATIONS
===================================================== */

function displayNotifications() {

    const list =
        document.getElementById(
            "notificationList"
        );

    const empty =
        document.getElementById(
            "notificationEmpty"
        );


    if (!list || !empty) {
        return;
    }


list.innerHTML = "";


list.innerHTML = "";


/* =====================================================
   FILTER NOTIFICATIONS BASED ON SETTINGS
===================================================== */

const settings =
    JSON.parse(
        localStorage.getItem("librarySettings")
    ) || {};


const visibleNotifications =
    notifications.filter(
        function(notification) {

            /* ALL NOTIFICATIONS */

            if (
                settings.notificationsEnabled === false
            ) {
                return false;
            }


            /* DUE DATE */

            if (
                notification.type === "due" &&
                settings.dueDateReminder === false
            ) {
                return false;
            }


            /* OVERDUE */

            if (
                notification.type === "overdue" &&
                settings.overdueAlerts === false
            ) {
                return false;
            }


            /* BOOK ISSUE */

            if (
                notification.type === "issued" &&
                settings.bookIssueNotifications === false
            ) {
                return false;
            }


            /* BOOK RETURN */

            if (
                notification.type === "returned" &&
                settings.bookReturnNotifications === false
            ) {
                return false;
            }


            return true;

        }
    );


/* =====================================================
   NO VISIBLE NOTIFICATIONS
===================================================== */

if (visibleNotifications.length === 0) {

    empty.style.display =
        "block";

    updateNotificationBadge();

    return;
}


empty.style.display =
    "none";


/* =====================================================
   DISPLAY ONLY ENABLED NOTIFICATIONS
===================================================== */

visibleNotifications.forEach(
    function(notification) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            `notification-item ${
                notification.read
                    ? "read"
                    : "unread"
            }`;


        item.style.cursor =
            "pointer";


        /* NOTIFICATION CLICK */

        item.addEventListener(
            "click",
            function(event) {

                /* Ignore button clicks */

                if (
                    event.target.closest("button")
                ) {
                    return;
                }


                /* Mark as read */

                if (!notification.read) {

                    markNotificationAsRead(
                        notification.id
                    );

                }


                /* Navigate to related page */

                handleNotificationClick(
                    notification
                );

            }
        );


        /* NOTIFICATION HTML */

        item.innerHTML = `

            <div class="notification-icon">

                <i class="bi bi-bell"></i>

            </div>


            <div class="notification-content">

                <strong>
                    ${notification.title}
                </strong>

                <p>
                    ${notification.description}
                </p>

                <small>
                    ${notification.date}
                </small>

            </div>


            <div class="notification-actions">

                ${
                    !notification.read
                        ? `
                            <button
                                type="button"
                                class="btn btn-sm btn-link"
                                onclick="markNotificationAsRead(${notification.id})">

                                Mark as read

                            </button>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="btn btn-sm btn-link text-danger"
                    onclick="deleteNotification(${notification.id})">

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        `;


        list.appendChild(
            item
        );

    }
);


updateNotificationBadge();

}

/* =====================================================
   CLEAR ALL NOTIFICATIONS
===================================================== */

function clearAllNotifications() {

    // Remove all notifications
    notifications = [];


    // Save empty array to localStorage
    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );


    // Refresh notification panel
    displayNotifications();


    // Update unread badge
    updateNotificationBadge();

}


/* =====================================================
   CLEAR ALL BUTTON
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const clearAllButton =
            document.getElementById(
                "clearAllNotifications"
            );


        if (clearAllButton) {

            clearAllButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    clearAllNotifications();

                }
            );

        }

    }
);


/* =====================================================
   MARK NOTIFICATION AS READ
===================================================== */

function markNotificationAsRead(id) {

    const notification =
        notifications.find(
            item =>
                item.id === id
        );


    if (!notification) {
        return;
    }


    notification.read = true;


    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );


    displayNotifications();

}


/* =====================================================
   DELETE NOTIFICATION
===================================================== */

function deleteNotification(id) {

    const index =
        notifications.findIndex(
            item =>
                item.id === id
        );


    if (index === -1) {
        return;
    }


    notifications.splice(
        index,
        1
    );


    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );


    displayNotifications();

}


/* =====================================================
   MARK ALL AS READ
===================================================== */

const markAllReadBtn =
    document.getElementById(
        "markAllReadBtn"
    );


if (markAllReadBtn) {

    markAllReadBtn.addEventListener(
        "click",
        function() {

            notifications.forEach(
                function(notification) {

                    notification.read =
                        true;

                }
            );


            localStorage.setItem(
                "notifications",
                JSON.stringify(notifications)
            );


            displayNotifications();

        }
    );

}


/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );


const notificationPanel =
    document.getElementById(
        "notificationPanel"
    );


if (
    notificationBtn &&
    notificationPanel
) {

    notificationBtn.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            notificationPanel.classList.toggle(
                "show"
            );

        }
    );

}


/* =====================================================
   INITIAL LOAD
===================================================== */

displayNotifications();

// =====================================================
// BOOK DUE-DATE NOTIFICATION
// =====================================================

function notifyBookDueReminder(
    bookTitle,
    memberName,
    returnDate,
    daysRemaining
) {

    let message = "";


    // 2 days before
    if (daysRemaining === 2) {

        message =
            `The book "${bookTitle}" issued to ${memberName} is due in 2 days.`;

    }


    // 1 day before
    else if (daysRemaining === 1) {

        message =
            `The book "${bookTitle}" issued to ${memberName} is due tomorrow.`;

    }


    // Due today
    else if (daysRemaining === 0) {

        message =
            `The book "${bookTitle}" issued to ${memberName} is due today.`;

    }


    addNotification(
        "Book Due-Date Reminder",
        message,
        "due"
    );

}


// =====================================================
// BOOK OVERDUE NOTIFICATION
// =====================================================

function notifyBookOverdue(
    bookTitle,
    memberName,
    returnDate
) {

    addNotification(
        "Book Overdue",

        `The book "${bookTitle}" issued to ${memberName} is overdue. Due date was ${returnDate}.`,

        "overdue"
    );

}


// =====================================================
// CHECK BOOK DUE DATES
// =====================================================

function checkBookDueDates() {

    const issues =
        getData(KEYS.issues);


    // Today's date

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    issues.forEach(function(issue) {


        // ==========================================
        // IGNORE RETURNED BOOKS
        // ==========================================

        if (
            issue.status &&
            issue.status.toLowerCase() === "returned"
        ) {

            return;

        }


        // ==========================================
        // NO DUE DATE
        // ==========================================

        if (!issue.returnDate) {

            return;

        }


        // ==========================================
        // GET DUE DATE
        // ==========================================

        const dueDate =
            new Date(issue.returnDate);

        dueDate.setHours(
            0,
            0,
            0,
            0
        );


        // ==========================================
        // CALCULATE DAYS REMAINING
        // ==========================================

        const difference =
            dueDate.getTime() -
            today.getTime();


        const daysRemaining =
            Math.round(
                difference /
                (1000 * 60 * 60 * 24)
            );


        // ==========================================
        // 2 DAYS BEFORE
        // ==========================================

        if (daysRemaining === 2) {

            notifyBookDueReminder(
                issue.bookName,
                issue.memberName,
                issue.returnDate,
                2
            );

        }


        // ==========================================
        // 1 DAY BEFORE
        // ==========================================

        else if (daysRemaining === 1) {

            notifyBookDueReminder(
                issue.bookName,
                issue.memberName,
                issue.returnDate,
                1
            );

        }


        // ==========================================
        // DUE TODAY
        // ==========================================

        else if (daysRemaining === 0) {

            notifyBookDueReminder(
                issue.bookName,
                issue.memberName,
                issue.returnDate,
                0
            );

        }


        // ==========================================
        // OVERDUE
        // ==========================================

        else if (daysRemaining < 0) {

            notifyBookOverdue(
                issue.bookName,
                issue.memberName,
                issue.returnDate
            );

        }

    });

}
// ==========================================
// NEW BOOK ADDED
// ==========================================

function notifyNewBook(bookTitle, author) {

    addNotification(
        "New Book Added",
        `A new book "${bookTitle}" by ${author} has been added to the library.`,
        "new-book"
    );
}


// ==========================================
// NEW MEMBER REGISTERED
// ==========================================

function notifyNewMember(memberName) {

    addNotification(
        "New Member Registered Successfully",
        `New member "${memberName}" has been successfully registered.`,
        "new-member"
    );
}

// =====================================================
// BOOK RETURNED NOTIFICATION
// =====================================================

function notifyBookReturned(
    bookTitle,
    memberName
) {

    addNotification(
        "Book Successfully Returned",
        `The book "${bookTitle}" has been returned by ${memberName}.`,
        "returned"
    );

}


// =====================================================
// BOOK AVAILABILITY NOTIFICATION
// =====================================================

function notifyBookAvailability(bookTitle) {

    addNotification(
        "Book Availability Updated",
        `The book "${bookTitle}" is now available in the library.`,
        "availability"
    );

}

// =====================================================
// SYSTEM ANNOUNCEMENT NOTIFICATION
// =====================================================

function notifySystemAnnouncement(
    title,
    message
) {

    addNotification(
        title,
        message,
        "announcement"
    );

}



// =====================================================
// CALENDAR BASED SYSTEM ANNOUNCEMENT
// =====================================================

function checkCalendarAnnouncement() {

    const today = new Date();

    const month =
        today.getMonth() + 1;

    const day =
        today.getDate();


    // Republic Day - January 26
    if (
        month === 1 &&
        day === 26
    ) {

        notifySystemAnnouncement(
            "Republic Day",
            "Happy Republic Day! The library wishes everyone a wonderful Republic Day."
        );

    }


    // Labour Day - May 1
    else if (
        month === 5 &&
        day === 1
    ) {

        notifySystemAnnouncement(
            "Labour Day",
            "Happy Labour Day! The library wishes everyone a happy and meaningful Labour Day."
        );

    }


    //august 14
    else if(
        month === 8 &&
        day === 14
    )
    {
        notifySystemAnnouncement(
            "good friday",
            "good friday"

        )
    }


    // Independence Day - August 15
    else if (
        month === 8 &&
        day === 15
    ) {

        notifySystemAnnouncement(
            "Independence Day",
            "Happy Independence Day! The library wishes everyone a proud and memorable Independence Day."
        );

    }


    // Christmas - December 25
    else if (
        month === 12 &&
        day === 25
    ) {

        notifySystemAnnouncement(
            "Christmas",
            "Merry Christmas! The library wishes everyone a joyful and wonderful Christmas."
        );

    }

}

