from django.db import models


class TempResultModel(models.Model):
    """
    Temporary place to store results data
    """

    name = models.CharField(
        max_length=32,
        unique=True,
    )

    code = models.CharField(
        max_length=64,
        unique=True,
    )

    data = models.JSONField(

    )
