from django.db import models
from django.core.validators import MinValueValidator


# Book model
class Book(models.Model):
    id = models.AutoField(primary_key=True)

    book_name = models.CharField(max_length=200)
    author_name = models.CharField(max_length=200)
    isbn = models.CharField(max_length=20)

    category = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    department = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    available_copies = models.IntegerField(
        validators=[MinValueValidator(0)]
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ('Available', 'Available'),
            ('Issued', 'Issued'),
        ],
        default='Available'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.book_name


# Issue Book model
class Issue(models.Model):
    id = models.AutoField(primary_key=True)

    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE
    )

    member_id = models.CharField(max_length=100)

    issue_date = models.DateField()
    return_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=[
            ('Issued', 'Issued'),
            ('Returned', 'Returned'),
        ],
        default='Issued'
    )

    actual_return_date = models.DateField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book.book_name} - {self.member_id}"

#Memeber
# Member model
class Member(models.Model):

    id = models.AutoField(primary_key=True)

    member_id = models.CharField(
        max_length=100,
        unique=True
    )

    name = models.CharField(
        max_length=200
    )

    email = models.EmailField(
        max_length=200
    )

    phone = models.CharField(
        max_length=15
    )

    membership = models.CharField(
        max_length=100
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ('Active', 'Active'),
            ('Inactive', 'Inactive'),
        ],
        default='Active'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.member_id} - {self.name}"

# =====================================================
# EXTENSION REQUEST MODEL
# =====================================================

class ExtensionRequest(models.Model):

    id = models.AutoField(primary_key=True)

    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE
    )

    requested_return_date = models.DateField()

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=[
            ("Pending", "Pending"),
            ("Approved", "Approved"),
            ("Rejected", "Rejected")
        ],
        default="Pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Extension Request {self.id}"

# =====================================================
# USER MODEL
# =====================================================

class User(models.Model):

    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=200)

    email = models.EmailField(
        max_length=200,
        unique=True
    )

    dob = models.DateField()

    password = models.CharField(max_length=200)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.email