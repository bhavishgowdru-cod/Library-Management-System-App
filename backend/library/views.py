from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Book, Issue, Member, ExtensionRequest, User
import json


# =====================================================
# BOOKS API
# =====================================================

@csrf_exempt
def books(request):

    # ADD BOOK
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            book_name = data.get("book_name")
            author_name = data.get("author_name")
            isbn = data.get("isbn")
            category = data.get("category", "")
            department = data.get("department", "")
            available_copies = data.get("available_copies")

            if not book_name or not author_name or not isbn:
                return JsonResponse({
                    "success": False,
                    "message": "Book name, author name and ISBN are required"
                }, status=400)

            if available_copies is None or int(available_copies) < 0:
                return JsonResponse({
                    "success": False,
                    "message": "Available copies cannot be negative"
                }, status=400)

            book = Book.objects.create(
                book_name=book_name,
                author_name=author_name,
                isbn=isbn,
                category=category,
                department=department,
                available_copies=int(available_copies),
                status="Available"
            )

            return JsonResponse({
                "success": True,
                "message": "Book added successfully",
                "book_id": book.id
            }, status=201)

        except (json.JSONDecodeError, ValueError):
            return JsonResponse({
                "success": False,
                "message": "Invalid request data"
            }, status=400)

    # GET ALL BOOKS
    elif request.method == "GET":

        books_data = []

        for book in Book.objects.all().order_by("id"):
            books_data.append({
                "id": book.id,
                "book_name": book.book_name,
                "author_name": book.author_name,
                "isbn": book.isbn,
                "category": book.category,
                "department": book.department,
                "available_copies": book.available_copies,
                "status": book.status
            })

        return JsonResponse({
            "success": True,
            "books": books_data
        })

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)


# =====================================================
# BOOK BY ID API
# =====================================================

@csrf_exempt
def book_by_id(request, id):

    try:
        book = Book.objects.get(id=id)

    except Book.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Book not found"
        }, status=404)

    # GET SINGLE BOOK
    if request.method == "GET":

        return JsonResponse({
            "success": True,
            "book": {
                "id": book.id,
                "book_name": book.book_name,
                "author_name": book.author_name,
                "isbn": book.isbn,
                "category": book.category,
                "department": book.department,
                "available_copies": book.available_copies,
                "status": book.status
            }
        })

    # UPDATE BOOK
    elif request.method == "PUT":

        try:
            data = json.loads(request.body)

            book.book_name = data.get(
                "book_name",
                book.book_name
            )

            book.author_name = data.get(
                "author_name",
                book.author_name
            )

            book.isbn = data.get(
                "isbn",
                book.isbn
            )

            book.category = data.get(
                "category",
                book.category
            )

            book.department = data.get(
                "department",
                book.department
            )

            if "available_copies" in data:
                available_copies = int(
                    data["available_copies"]
                )

                if available_copies < 0:
                    return JsonResponse({
                        "success": False,
                        "message": "Available copies cannot be negative"
                    }, status=400)

                book.available_copies = available_copies

            book.status = (
                "Available"
                if book.available_copies > 0
                else "Issued"
            )

            book.save()

            return JsonResponse({
                "success": True,
                "message": "Book updated successfully",
                "book_id": book.id
            })

        except (json.JSONDecodeError, ValueError):
            return JsonResponse({
                "success": False,
                "message": "Invalid request data"
            }, status=400)

    # DELETE BOOK
    elif request.method == "DELETE":

        book.delete()

        return JsonResponse({
            "success": True,
            "message": "Book deleted successfully"
        })

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)


# =====================================================
# ISSUE API
# =====================================================

@csrf_exempt
def issues(request):

    if request.method == "POST":
        try:
            data = json.loads(request.body)

            book_id = data.get("book_id")
            member_id = data.get("member_id")
            issue_date = data.get("issue_date")
            return_date = data.get("return_date")

            if not book_id or not member_id:
                return JsonResponse({
                    "success": False,
                    "message": "Book ID and Member ID are required"
                }, status=400)

            if not issue_date or not return_date:
                return JsonResponse({
                    "success": False,
                    "message": "Issue date and Return date are required"
                }, status=400)

            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "message": "Book not found"
                }, status=404)

            try:
                member = Member.objects.get(member_id=member_id)
            except Member.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "message": "Member not found"
                }, status=404)

            if member.status != "Active":
                return JsonResponse({
                    "success": False,
                    "message": "Member is inactive"
                }, status=400)

            if book.available_copies <= 0 or book.status != "Available":
                return JsonResponse({
                    "success": False,
                    "message": "No copies available"
                }, status=400)

            active_issue = Issue.objects.filter(
                book=book,
                status="Issued"
            ).exists()

            if active_issue:
                return JsonResponse({
                    "success": False,
                    "message": "This book is already issued"
                }, status=400)

            issue = Issue.objects.create(
                book=book,
                member_id=member.member_id,
                issue_date=issue_date,
                return_date=return_date,
                status="Issued"
            )

            book.available_copies -= 1
            book.status = (
                "Available"
                if book.available_copies > 0
                else "Issued"
            )
            book.save()

            return JsonResponse({
                "success": True,
                "message": "Book issued successfully",
                "issue_id": issue.id,
                "available_copies": book.available_copies
            }, status=201)

        except (json.JSONDecodeError, ValueError):
            return JsonResponse({
                "success": False,
                "message": "Invalid request data"
            }, status=400)

    elif request.method == "GET":

        issues_data = []

        for issue in Issue.objects.select_related("book").all().order_by("-id"):

            member_name = ""

            try:
                member = Member.objects.get(
                    member_id=issue.member_id
                )
                member_name = member.name
            except Member.DoesNotExist:
                pass

            issues_data.append({
                "id": issue.id,
                "bookId": issue.book.id,
                "bookName": issue.book.book_name,
                "memberId": issue.member_id,
                "memberName": member_name,
                "issueDate": str(issue.issue_date),
                "returnDate": str(issue.return_date),
                "actualReturnDate": (
                    str(issue.actual_return_date)
                    if issue.actual_return_date
                    else None
                ),
                "status": issue.status
            })

        return JsonResponse({
            "success": True,
            "issues": issues_data
        })

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)

# =====================================================
# ISSUE BY ID API
# =====================================================

@csrf_exempt
def issue_by_id(request, id):

    try:
        issue = Issue.objects.select_related("book").get(id=id)

    except Issue.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Issue record not found"
        }, status=404)

    # GET SINGLE ISSUE
    if request.method == "GET":

        member_name = ""

        try:
            member = Member.objects.get(
                member_id=issue.member_id
            )
            member_name = member.name

        except Member.DoesNotExist:
            pass

        return JsonResponse({
            "success": True,
            "issue": {
                "id": issue.id,
                "bookId": issue.book.id,
                "bookName": issue.book.book_name,
                "memberId": issue.member_id,
                "memberName": member_name,
                "issueDate": str(issue.issue_date),
                "returnDate": str(issue.return_date),
                "actualReturnDate": (
                    str(issue.actual_return_date)
                    if issue.actual_return_date
                    else None
                ),
                "status": issue.status
            }
        })

    # RETURN / UPDATE ISSUE
    elif request.method == "PUT":

        try:
            data = json.loads(request.body)
            actual_return_date = data.get("actual_return_date")

            if issue.status == "Returned":
                return JsonResponse({
                    "success": False,
                    "message": "Book is already returned"
                }, status=400)

            if not actual_return_date:
                return JsonResponse({
                    "success": False,
                    "message": "Actual return date is required"
                }, status=400)

            issue.status = "Returned"
            issue.actual_return_date = actual_return_date
            issue.save()

            book = issue.book
            book.available_copies += 1
            book.status = "Available"
            book.save()

            return JsonResponse({
                "success": True,
                "message": "Book returned successfully",
                "available_copies": book.available_copies
            })

        except (json.JSONDecodeError, ValueError):
            return JsonResponse({
                "success": False,
                "message": "Invalid request data"
            }, status=400)

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)

# =====================================================
# MEMBERS API
# =====================================================

@csrf_exempt
def members(request):

    # =====================================
    # ADD MEMBER
    # =====================================

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            name = data.get("name", "").strip()
            email = data.get("email", "").strip()
            phone = data.get("phone", "").strip()
            membership = data.get("membership", "").strip()
            status = data.get("status", "Active")


            # =====================================
            # VALIDATION
            # =====================================

            if (
                not name or
                not email or
                not phone or
                not membership
            ):

                return JsonResponse({
                    "success": False,
                    "message": "All fields are required"
                }, status=400)


            # =====================================
            # AUTO GENERATE MEMBER ID
            # M001, M002, M003...
            # =====================================

            highest_number = 0


            for existing_member in Member.objects.all():

                member_id_value = existing_member.member_id


                if (
                    member_id_value and
                    member_id_value.startswith("M")
                ):

                    try:

                        number = int(
                            member_id_value[1:]
                        )


                        if number > highest_number:

                            highest_number = number


                    except ValueError:

                        continue


            # NEXT ID

            next_number = highest_number + 1

            member_id = f"M{next_number:03d}"


            # =====================================
            # DUPLICATE PROTECTION
            # =====================================

            while Member.objects.filter(
                member_id=member_id
            ).exists():

                next_number += 1

                member_id = f"M{next_number:03d}"


            # =====================================
            # CREATE MEMBER
            # =====================================

            member = Member.objects.create(

                member_id=member_id,

                name=name,

                email=email,

                phone=phone,

                membership=membership,

                status=status

            )


            return JsonResponse({

                "success": True,

                "message": "Member added successfully",

                "member": {

                    "id": member.id,

                    "member_id": member.member_id,

                    "name": member.name,

                    "email": member.email,

                    "phone": member.phone,

                    "membership": member.membership,

                    "status": member.status

                }

            }, status=201)


        except json.JSONDecodeError:

            return JsonResponse({

                "success": False,

                "message": "Invalid JSON"

            }, status=400)


        except Exception as e:

            return JsonResponse({

                "success": False,

                "message": str(e)

            }, status=500)


    # =====================================
    # GET ALL MEMBERS
    # =====================================

    elif request.method == "GET":

        members_data = []


        for member in Member.objects.all().order_by("member_id"):

            members_data.append({

                "id": member.id,

                "member_id": member.member_id,

                "name": member.name,

                "email": member.email,

                "phone": member.phone,

                "membership": member.membership,

                "status": member.status

            })


        return JsonResponse({

            "success": True,

            "members": members_data

        })


    # =====================================
    # METHOD NOT ALLOWED
    # =====================================

    return JsonResponse({

        "success": False,

        "message": "Method not allowed"

    }, status=405)

# =====================================================
# MEMBER BY ID API
# EDIT / DELETE MEMBER
# =====================================================

@csrf_exempt
def member_by_id(request, id):

    try:

        member = Member.objects.get(id=id)


    except Member.DoesNotExist:

        return JsonResponse({

            "success": False,

            "message": "Member not found"

        }, status=404)


    # =================================================
    # UPDATE MEMBER
    # =================================================

    if request.method == "PUT":

        try:

            data = json.loads(request.body)


            name = data.get(
                "name",
                member.name
            ).strip()


            email = data.get(
                "email",
                member.email
            ).strip()


            phone = data.get(
                "phone",
                member.phone
            ).strip()


            membership = data.get(
                "membership",
                member.membership
            ).strip()


            status = data.get(
                "status",
                member.status
            ).strip()


            # =========================================
            # VALIDATION
            # =========================================

            if (

                not name or
                not email or
                not phone or
                not membership

            ):

                return JsonResponse({

                    "success": False,

                    "message": "All fields are required"

                }, status=400)


            # =========================================
            # UPDATE
            # =========================================

            member.name = name

            member.email = email

            member.phone = phone

            member.membership = membership

            member.status = status


            member.save()


            return JsonResponse({

                "success": True,

                "message": "Member updated successfully",

                "member": {

                    "id": member.id,

                    "member_id": member.member_id,

                    "name": member.name,

                    "email": member.email,

                    "phone": member.phone,

                    "membership": member.membership,

                    "status": member.status

                }

            }, status=200)


        except json.JSONDecodeError:

            return JsonResponse({

                "success": False,

                "message": "Invalid JSON data"

            }, status=400)


        except Exception as error:

            return JsonResponse({

                "success": False,

                "message": str(error)

            }, status=500)


    # =================================================
    # DELETE MEMBER
    # =================================================

    elif request.method == "DELETE":

        member.delete()


        return JsonResponse({

            "success": True,

            "message": "Member deleted successfully"

        }, status=200)


    # =================================================
    # GET SINGLE MEMBER
    # =================================================

    elif request.method == "GET":

        return JsonResponse({

            "success": True,

            "member": {

                "id": member.id,

                "member_id": member.member_id,

                "name": member.name,

                "email": member.email,

                "phone": member.phone,

                "membership": member.membership,

                "status": member.status

            }

        }, status=200)


    return JsonResponse({

        "success": False,

        "message": "Method not allowed"

    }, status=405)
# =====================================================
# RETURNS API
# =====================================================

@csrf_exempt
def returns(request):

    # GET ALL RETURNED BOOKS
    if request.method == "GET":

        returned_books = Issue.objects.filter(
            status="Returned"
        ).select_related("book").order_by("-id")

        data = []

        for issue in returned_books:

            data.append({
                "id": issue.id,
                "book_id": issue.book.id,
                "book_name": issue.book.book_name,
                "member_id": issue.member_id,
                "issue_date": str(issue.issue_date),
                "return_date": str(issue.return_date),
                "actual_return_date": (
                    str(issue.actual_return_date)
                    if issue.actual_return_date
                    else None
                ),
                "status": issue.status
            })

        return JsonResponse({
            "success": True,
            "returns": data
        })


    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)


# =====================================================
# RETURN BOOK BY ID API
# =====================================================

@csrf_exempt
def return_book(request, id):

    try:
        issue = Issue.objects.select_related("book").get(id=id)

    except Issue.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Issue record not found"
        }, status=404)


    # GET SINGLE RETURN RECORD
    if request.method == "GET":

        if issue.status != "Returned":
            return JsonResponse({
                "success": False,
                "message": "Book is not returned yet"
            }, status=400)

        return JsonResponse({
            "success": True,
            "return": {
                "id": issue.id,
                "book_id": issue.book.id,
                "book_name": issue.book.book_name,
                "member_id": issue.member_id,
                "issue_date": str(issue.issue_date),
                "return_date": str(issue.return_date),
                "actual_return_date": (
                    str(issue.actual_return_date)
                    if issue.actual_return_date
                    else None
                ),
                "status": issue.status
            }
        })


    # RETURN BOOK
    elif request.method == "PUT":

        try:
            data = json.loads(request.body)

            actual_return_date = data.get("actual_return_date")

            if issue.status == "Returned":
                return JsonResponse({
                    "success": False,
                    "message": "Book already returned"
                }, status=400)

            if not actual_return_date:
                return JsonResponse({
                    "success": False,
                    "message": "Return date is required"
                }, status=400)


            # Update issue
            issue.status = "Returned"
            issue.actual_return_date = actual_return_date
            issue.save()


            # Increase available book copies
            book = issue.book
            book.available_copies += 1
            book.status = "Available"
            book.save()


            return JsonResponse({
                "success": True,
                "message": "Book returned successfully",
                "available_copies": book.available_copies
            })

        except (json.JSONDecodeError, ValueError):

            return JsonResponse({
                "success": False,
                "message": "Invalid request data"
            }, status=400)


    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)

# =====================================================
# EXTENSION REQUESTS API
# =====================================================

@csrf_exempt
def extension_requests(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            issue_id = data.get("issue_id")

            requested_return_date = data.get(
                "requested_return_date"
            )

            reason = data.get("reason")


            if (
                not issue_id or
                not requested_return_date or
                not reason
            ):

                return JsonResponse({
                    "success": False,
                    "message": "All fields are required"
                }, status=400)


            try:

                issue = Issue.objects.get(
                    id=issue_id
                )

            except Issue.DoesNotExist:

                return JsonResponse({
                    "success": False,
                    "message": "Issue record not found"
                }, status=404)

            # ADD THIS VALIDATION HERE
            if issue.status == "Returned":
                return JsonResponse({
                    "success": False,
                    "message": "Cannot request extension for a returned book"
                }, status=400)


            extension = ExtensionRequest.objects.create(

                issue=issue,

                requested_return_date=
                    requested_return_date,

                reason=reason,

                status="Pending"

            )


            return JsonResponse({

                "success": True,

                "message":
                    "Extension request created successfully",

                "extension": {

                    "id": extension.id,

                    "issue_id": extension.issue.id,

                    "requested_return_date":
                        str(
                            extension.requested_return_date
                        ),

                    "reason": extension.reason,

                    "status": extension.status

                }

            }, status=201)


        except json.JSONDecodeError:

            return JsonResponse({

                "success": False,

                "message": "Invalid JSON"

            }, status=400)


    elif request.method == "GET":

        extensions_data = []

        extensions = (
            ExtensionRequest.objects
            .all()
            .order_by("-id")
        )


        for extension in extensions:

            extensions_data.append({

                "id": extension.id,

                "issue_id":
                    extension.issue.id,

                "book_id":
                    extension.issue.book.id,

                "book_name":
                    extension.issue.book.book_name,

                "member_id":
                    extension.issue.member_id,

                "issue_date":
                    str(
                        extension.issue.issue_date
                    ),

                "current_return_date":
                    str(
                        extension.issue.return_date
                    ),

                "requested_return_date":
                    str(
                        extension.requested_return_date
                    ),

                "reason":
                    extension.reason,

                "status":
                    extension.status

            })


        return JsonResponse({

            "success": True,

            "extensions": extensions_data

        })


    return JsonResponse({

        "success": False,

        "message": "Method not allowed"

    }, status=405)

# =====================================================
# EXTENSION REQUEST BY ID API
# =====================================================

@csrf_exempt
def extension_request_by_id(request, id):

    try:

        extension = ExtensionRequest.objects.get(
            id=id
        )

    except ExtensionRequest.DoesNotExist:

        return JsonResponse({
            "success": False,
            "message": "Extension request not found"
        }, status=404)


    if request.method == "GET":

        return JsonResponse({

            "success": True,

            "extension": {

                "id": extension.id,

                "issue_id": extension.issue.id,

                "requested_return_date":
                    str(extension.requested_return_date),

                "reason": extension.reason,

                "status": extension.status

            }

        })


    elif request.method == "PUT":

        try:

            data = json.loads(request.body)

            status = data.get("status")


            if status not in [
                "Pending",
                "Approved",
                "Rejected"
            ]:

                return JsonResponse({

                    "success": False,

                    "message":
                        "Status must be Pending, Approved or Rejected"

                }, status=400)


            extension.status = status


            # If approved, update issue return date
            if status == "Approved":

                extension.issue.return_date = (
                    extension.requested_return_date
                )

                extension.issue.save()


            extension.save()


            return JsonResponse({

                "success": True,

                "message":
                    "Extension request updated successfully",

                "status":
                    extension.status

            })


        except json.JSONDecodeError:

            return JsonResponse({

                "success": False,

                "message": "Invalid JSON"

            }, status=400)


    elif request.method == "DELETE":

        extension.delete()


        return JsonResponse({

            "success": True,

            "message":
                "Extension request deleted successfully"

        })


    return JsonResponse({

        "success": False,

        "message": "Method not allowed"

    }, status=405)

# =====================================================
# REGISTER API
# =====================================================

@csrf_exempt
def register(request):

    if request.method == "POST":

        try:
            data = json.loads(request.body)

            name = data.get("name")
            email = data.get("email")
            dob = data.get("dob")
            password = data.get("password")

            if not name or not email or not dob or not password:
                return JsonResponse({
                    "success": False,
                    "message": "All fields are required"
                }, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    "success": False,
                    "message": "Email already registered"
                }, status=400)

            user = User.objects.create(
                name=name,
                email=email,
                dob=dob,
                password=password
            )

            return JsonResponse({
                "success": True,
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "dob": str(user.dob)
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
            }, status=400)

    elif request.method == "GET":

        users_data = []

        for user in User.objects.all().order_by("-id"):
            users_data.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "dob": str(user.dob)
            })

        return JsonResponse({
            "success": True,
            "users": users_data
        })

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)

# =====================================================
# LOGIN API
# =====================================================

@csrf_exempt
def login(request):

    if request.method == "POST":

        try:
            data = json.loads(request.body)

            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({
                    "success": False,
                    "message": "Email and password are required"
                }, status=400)

            try:
                user = User.objects.get(email=email)

            except User.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "message": "User not found"
                }, status=404)

            if user.password != password:
                return JsonResponse({
                    "success": False,
                    "message": "Invalid password"
                }, status=400)

            return JsonResponse({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "dob": str(user.dob)
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
            }, status=400)

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)

# =====================================================
# PROFILE API
# =====================================================

@csrf_exempt
def profile_by_id(request, id):

    try:
        user = User.objects.get(id=id)

    except User.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "User not found"
        }, status=404)

    # =================================================
    # GET PROFILE
    # =================================================

    if request.method == "GET":

        return JsonResponse({
            "success": True,
            "profile": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "dob": str(user.dob),

                "phone": user.phone,
                "memberId": user.member_id,
                "role": user.role,
                "department": user.department,
                "accountStatus": user.account_status,

                "joiningDate": (
                    str(user.joining_date)
                    if user.joining_date
                    else ""
                ),

                "address": user.address,
                "profilePicture": user.profile_picture
            }
        })

    # =================================================
    # UPDATE PROFILE
    # =================================================

    elif request.method == "PUT":

        try:
            data = json.loads(request.body)

            name = data.get("name")
            email = data.get("email")
            phone = data.get("phone")
            member_id = data.get("memberId")
            role = data.get("role")
            department = data.get("department")
            account_status = data.get("accountStatus")
            joining_date = data.get("joiningDate")
            address = data.get("address")
            profile_picture = data.get("profilePicture")

            # REQUIRED FIELDS
            if not name:
                return JsonResponse({
                    "success": False,
                    "message": "Name is required"
                }, status=400)

            if not email:
                return JsonResponse({
                    "success": False,
                    "message": "Email is required"
                }, status=400)

            if not phone:
                return JsonResponse({
                    "success": False,
                    "message": "Phone is required"
                }, status=400)

            if not department:
                return JsonResponse({
                    "success": False,
                    "message": "Department is required"
                }, status=400)

            # CHECK EMAIL
            if User.objects.filter(
                email=email
            ).exclude(
                id=user.id
            ).exists():

                return JsonResponse({
                    "success": False,
                    "message": "Email already registered"
                }, status=400)

            # UPDATE USER
            user.name = name
            user.email = email
            user.phone = phone
            user.member_id = member_id or "M001"
            user.role = role or "Administrator"
            user.department = department
            user.account_status = account_status or "Active"

            if joining_date:
                user.joining_date = joining_date

            user.address = address or ""
            user.profile_picture = profile_picture or ""

            user.save()

            return JsonResponse({
                "success": True,
                "message": "Profile updated successfully",

                "profile": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "dob": str(user.dob),

                    "phone": user.phone,
                    "memberId": user.member_id,
                    "role": user.role,
                    "department": user.department,
                    "accountStatus": user.account_status,

                    "joiningDate": (
                        str(user.joining_date)
                        if user.joining_date
                        else ""
                    ),

                    "address": user.address,
                    "profilePicture": user.profile_picture
                }
            })

        except json.JSONDecodeError:

            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
            }, status=400)

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)