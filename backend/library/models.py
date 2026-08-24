from django.db import models
from django.core.validators import MinValueValidator

class Book(models.Model):
    id = models.AutoField(primary_key = True)
    
    book_name = models.CharField(max_length = 200)
    author_name = models.CharField(max_length = 200)
    isbn = models.CharField(max_length = 20)

    available_copies = models.IntegerField(
        validators = [MinValueValidator(0)]
    )

    status = models.CharField(
        max_length = 10,

        choices = [
            ('ACTIVE', 'ACTIVE'),
            ('INACTIVE', 'INACTIVE'),
        ],

        default = 'ACTIVE'
    )

    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return self.book_name