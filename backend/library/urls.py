from django.urls import path

from .views import (
    books,
    book_by_id,
    issues,
    issue_by_id,
    members,
    member_by_id,
    returns,
    return_book,
    extension_requests,
    extension_request_by_id
)


urlpatterns = [

    path("books/", books),
    path("books/<int:id>/", book_by_id),

    path("issues/", issues),
    path("issues/<int:id>/", issue_by_id),

    path("members/", members),
    path("members/<int:id>/", member_by_id),
    
    path("returns/", returns),
    path("returns/<int:id>/", return_book),
    
    path("extensions/", extension_requests),
    path("extensions/<int:id>/", extension_request_by_id),

]