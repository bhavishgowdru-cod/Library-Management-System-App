from django.urls import path
from .views import books, book_by_id, issues, issue_by_id

urlpatterns = [
    path("api/books/", books),
    path("api/books/<int:id>/", book_by_id),
    path("api/issues/", issues),
    path("api/issues/<int:id>/", issue_by_id),
]