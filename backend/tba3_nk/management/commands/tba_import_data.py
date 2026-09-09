import json
import re
import hashlib
import base64
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from tba3_nk.models import TempResultModel
from api.conversion import TBA3Converter


class Command(BaseCommand):
    help = "Import 'TBA3' style data files (https://github.com/indibit-eu/tba3)"

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers()

        parser = subparsers.add_parser("import")
        parser.set_defaults(command="import")
        parser.add_argument(
            "filename", type=str,
            help="filename of the json file to import"
        )

    def handle(self, *args, **options):
        command = options.get("command")
        if not command:
            print("First argument must be a command")
            return

        globals()[f"handle_{command}"](**options)


def handle_import(filename: str, **kwargs):
    converter = TBA3Converter()
    data = json.loads(Path(filename).read_text())

    # add one test
    converter.add_test_results("Test 1", "Wort_TBA_N1", data)
    # theoretically, other tests can be added, e.g.
    # converter.add_test_results("Test 1", "Satz_TBA_N3", data)
    # converter.add_test_results("Test 2", "Wort_TBA_N1", data)
    # ...

    # convert to internal format
    data = converter.convert()

    # just print it for now..
    print(json.dumps(data, indent=2))
