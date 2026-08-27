from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Book, Issue, Member
import json


# =====================================================
# BOOKS API
# =====================================================

@csrf_exempt
def books(request):

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

            available_copies = int(available_copies)

            book = Book.objects.create(
                book_name=book_name,
                author_name=author_name,
                isbn=isbn,
                category=category,
                department=department,
                available_copies=available_copies,
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

    elif request.method == "GET":

        book_data = []

        for book in Book.objects.all().order_by("-id"):
            book_data.append({
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
            "books": book_data
        })

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)


@csrf_exempt
def book_by_id(request, id):

    try:
        book = Book.objects.get(id=id)
    except Book.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Book not found"
        }, status=404)

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

    elif request.method == "PUT":
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

            book.book_name = book_name
            book.author_name = author_name
            book.isbn = isbn
            book.category = category
            book.department = department
            book.available_copies = int(available_copies)

            if book.available_copies > 0:
                book.status = "Available"
            else:
                book.status = "Issued"

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
# ISSUE / RETURN API
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

            if book.available_copies == 0:
                book.status = "Issued"
            else:
                book.status = "Available"

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
                member = Member.objects.get(member_id=issue.member_id)
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


@csrf_exempt
def issue_by_id(request, id):

    try:
        issue = Issue.objects.select_related("book").get(id=id)
    except Issue.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Issue record not found"
        }, status=404)

    if request.method == "PUT":
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

    if request.method == "GET":
        members_data = []

        for member in Member.objects.all().order_by("-id"):
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

    elif request.method == "POST":
        try:
            data = json.loads(request.body)

            member_id = data.get("member_id")
            name = data.get("name")
            email = data.get("email")
            phone = data.get("phone")
            membership = data.get("membership")
            status = data.get("status", "Active")

            if not member_id or not name or not email or not phone or not membership:
                return JsonResponse({
                    "success": False,
                    "message": "All member fields are required"
                }, status=400)

            if Member.objects.filter(member_id=member_id).exists():
                return JsonResponse({
                    "success": False,
                    "message": "Member ID already exists"
                }, status=400)

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

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)


@csrf_exempt
def member_by_id(request, id):

    try:
        member = Member.objects.get(id=id)
    except Member.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Member not found"
        }, status=404)

    if request.method == "PUT":
        try:
            data = json.loads(request.body)

            member.name = data.get("name", member.name)
            member.email = data.get("email", member.email)
            member.phone = data.get("phone", member.phone)
            member.membership = data.get("membership", member.membership)
            member.status = data.get("status", member.status)
            member.save()

            return JsonResponse({
                "success": True,
                "message": "Member updated successfully"
            })

        except json.JSONDecodeError:
            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
            }, status=400)

    elif request.method == "DELETE":
        member.delete()

        return JsonResponse({
            "success": True,
            "message": "Member deleted successfully"
        })

    return JsonResponse({
        "success": False,
        "message": "Method not allowed"
    }, status=405)
