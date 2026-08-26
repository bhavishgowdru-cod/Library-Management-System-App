from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Book, Issue
import json


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

            if not book_name:
                return JsonResponse({
                    "success": False,
                    "message": "Book name cannot be empty"
                }, status=400)

            if not author_name:
                return JsonResponse({
                    "success": False,
                    "message": "Author name cannot be empty"
                }, status=400)

            if not isbn:
                return JsonResponse({
                    "success": False,
                    "message": "ISBN cannot be empty"
                }, status=400)

            if available_copies is None or available_copies < 0:
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
                available_copies=available_copies
            )

            return JsonResponse({
                "success": True,
                "message": "Book added successfully",
                "book_id": book.id
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
            }, status=400)

    elif request.method == "GET":

        books = Book.objects.all()

        book_data = []

        for book in books:
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

            if not book_name:
                return JsonResponse({
                    "success": False,
                    "message": "Book name cannot be empty"
                }, status=400)

            if not author_name:
                return JsonResponse({
                    "success": False,
                    "message": "Author name cannot be empty"
                }, status=400)

            if not isbn:
                return JsonResponse({
                    "success": False,
                    "message": "ISBN cannot be empty"
                }, status=400)

            if available_copies is None or available_copies < 0:
                return JsonResponse({
                    "success": False,
                    "message": "Available copies cannot be negative"
                }, status=400)

            book.book_name = book_name
            book.author_name = author_name
            book.isbn = isbn
            book.category = category
            book.department = department
            book.available_copies = available_copies

            if available_copies > 0:
                book.status = "Available"
            else:
                book.status = "Issued"

            book.save()

            return JsonResponse({
                "success": True,
                "message": "Book updated successfully",
                "book_id": book.id,
                "available_copies": book.available_copies,
                "status": book.status
            })

        except json.JSONDecodeError:
            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
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


@csrf_exempt
def issues(request):

    if request.method == "POST":

        try:
            data = json.loads(request.body)

            book_id = data.get("book_id")
            member_id = data.get("member_id")
            issue_date = data.get("issue_date")
            return_date = data.get("return_date")

            if not book_id:
                return JsonResponse({
                    "success": False,
                    "message": "Book ID is required"
                }, status=400)

            if not member_id:
                return JsonResponse({
                    "success": False,
                    "message": "Member ID is required"
                }, status=400)

            if not issue_date:
                return JsonResponse({
                    "success": False,
                    "message": "Issue date is required"
                }, status=400)

            if not return_date:
                return JsonResponse({
                    "success": False,
                    "message": "Return date is required"
                }, status=400)

            try:
                book = Book.objects.get(id=book_id)

            except Book.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "message": "Book not found"
                }, status=404)

            if book.available_copies <= 0:
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
                    "message": "This book already has an active issue record"
                }, status=400)

            issue = Issue.objects.create(
                book=book,
                member_id=member_id,
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
                "available_copies": book.available_copies,
                "status": book.status
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
            }, status=400)

    elif request.method == "GET":

        issues_data = []

        issue_records = Issue.objects.select_related("book").all()

        for issue in issue_records:

            issues_data.append({
                "id": issue.id,
                "bookId": issue.book.id,
                "bookName": issue.book.book_name,
                "memberId": issue.member_id,
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

            actual_return_date = data.get(
                "actual_return_date"
            )

            if issue.status == "Returned":
                return JsonResponse({
                    "success": False,
                    "message": "Book is already returned"
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
                "available_copies": book.available_copies,
                "status": book.status
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