from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Book
import json


@csrf_exempt
def books(request):
    # Add new book
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            book_name = data.get("book_name")
            author_name = data.get("author_name")
            isbn = data.get("isbn")
            available_copies = data.get("available_copies")

            # validation
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

            # create and save book
            book = Book.objects.create(
                book_name=book_name,
                author_name=author_name,
                isbn=isbn,
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

    # Get all books
    elif request.method == "GET":
        books = Book.objects.all()

        book_data = []

        for book in books:
            book_data.append({
                "id": book.id,
                "book_name": book.book_name,
                "author_name": book.author_name,
                "isbn": book.isbn,
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

    # Get book by ID
    if request.method == "GET":

        return JsonResponse({
            "success": True,
            "book": {
                "id": book.id,
                "book_name": book.book_name,
                "author_name": book.author_name,
                "isbn": book.isbn,
                "available_copies": book.available_copies,
                "status": book.status
            }
        })

    # Update book
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)

            book_name = data.get("book_name")
            author_name = data.get("author_name")
            isbn = data.get("isbn")
            available_copies = data.get("available_copies")

            # validation
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

            # update book
            book.book_name = book_name
            book.author_name = author_name
            book.isbn = isbn
            book.available_copies = available_copies

            book.save()

            return JsonResponse({
                "success": True,
                "message": "Book updated successfully",
                "book_id": book.id
            })

        except json.JSONDecodeError:
            return JsonResponse({
                "success": False,
                "message": "Invalid JSON"
            }, status=400)

    # Delete book
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