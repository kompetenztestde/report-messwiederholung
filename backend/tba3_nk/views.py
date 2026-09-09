from django import views
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import TempResultModel


class TempResultView(views.View):

    def get(self, request):
        code = request.GET.get("code")

        model = get_object_or_404(TempResultModel, code=code)

        return JsonResponse(model.data)
