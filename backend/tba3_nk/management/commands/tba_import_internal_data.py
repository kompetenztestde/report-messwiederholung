import json
import re
import hashlib
import base64
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from tba3_nk.models import TempResultModel


class Command(BaseCommand):
    help = "Import 'the olde' data files"

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers()

        parser = subparsers.add_parser("import")
        parser.set_defaults(command="import")
        parser.add_argument(
            "filename", type=str,
            help="filename of the json file to import"
        )
        parser.add_argument(
            "name", type=str,
            help="Name of the data"
        )

        parser = subparsers.add_parser("list")
        parser.set_defaults(command="list")

        parser = subparsers.add_parser("delete")
        parser.set_defaults(command="delete")
        parser.add_argument(
            "name", type=str,
            help="name or code of the entry to delete"
        )

    def handle(self, *args, **options):
        command = options.get("command")
        if not command:
            print("First argument must be a command")
            return

        globals()[f"handle_{command}"](**options)


def handle_import(filename: str, name: str, **kwargs):
    if TempResultModel.objects.filter(name=name).exists():
        print(f"Name '{name}' already exists.")
        while True:
            i = input("Overwrite [Y/n]? ").strip().lower()
            if not i or i.startswith("y"):
                break
            if i.startswith("n"):
                return
        TempResultModel.objects.filter(name=name).delete()

    data = json.loads(Path(filename).read_text())

    code = hashlib.shake_256(json.dumps(data).encode()).digest(32)
    code = base64.urlsafe_b64encode(code).decode().rstrip("=")

    TempResultModel.objects.create(
        name=name,
        code=code,
        data=data,
    )

    print(f"Imported with code '{code}'")


def handle_list(**kwargs):
    for obj in TempResultModel.objects.all().order_by("name"):
        print(f"{obj.name:32} {obj.code}")


def handle_delete(name: str, **kwargs):
    qset = TempResultModel.objects.filter(name=name) | TempResultModel.objects.filter(code=name)
    if not qset.exists():
        print("Not found")
    else:
        print(f"Deleting {qset.count()} entries")
        qset.delete()
