import random
from typing import List, Union


SKIPPED_CODES = {"sex", "nsu", "xxx", "afd", "cdu", "csu", "npd", "spd", "cum", "ass"}


class TBA3Converter:
    """
    Converts the TBA3 students results to internal format used by frontend.

    Full TBA3 specification: https://github.com/indibit-eu/tba3
    Students results demo data: https://apps.indibit.eu/tba3-api/groups/3b-deutsch/items?type=students

    The TBA3 results are usually per task.
    The frontend only uses accumulated test results so the task results are summed during conversion.
    """
    def __init__(self):
        self._student_id_to_internal_code = {}
        self._tests = {}

    def add_test_results(
            self,
            test_name: str,         # e.g. "März 2026"
            result_code: str,       # e.g. "Wort_TBA_N1"
            students: List[dict],   # TBA3 data
    ):
        """
        Add the TBA3 students items.

        :param test_name: str, name of the test, usually a date
        :param result_code: str, result code, for our frontend either `Wort_TBA_N1` or `Satz_TBA_N3`
        :param students: list[dict], the TBA3 students items
        """
        results = self._tests.setdefault(test_name, {})
        results[result_code] = students

    def convert(self) -> dict:
        """
        Receive the internal data structure after all results are added.
        """
        measurements = {}
        max_score = 0
        for test_name, results in self._tests.items():
            measurements.setdefault(test_name, {}).update({
                "measurementName": test_name,
                # unused by frontend but in original spec
                "feedbackConfig": {"classLevel": 2},
                "results": {},  # will be converted to list later
            })
            for result_code, students in results.items():
                for student in students:
                    num_total = 0
                    num_correct = 0
                    for item in student["items"]:
                        num_total += item["descriptiveStatistics"]["total"]
                        num_correct += item["descriptiveStatistics"]["frequency"]

                    internal_result = measurements[test_name]["results"].setdefault(student["id"], {})
                    internal_result.update({
                        "participantId": student["id"],
                        "participantCode": self.student_id_to_internal_code(student["id"]),
                    })
                    internal_result.setdefault("results", {})
                    internal_result["results"][result_code] = {
                        "correct": num_correct,
                        "wrong": num_total - num_correct,
                    }
                    max_score = max(max_score, num_total)

        return {
            "classId": 18,
            "subject": "Deutsch",
            "domain": "Lesen",
            "className": "TBA III",
            "minScore": 0,
            "maxScore": max_score,
            "totalMeasurements": len(measurements),
            "measurements": [
                {**measurement, "results": list(measurement["results"].values())}
                for measurement in measurements.values()
            ],
        }

    def student_id_to_internal_code(self, id: Union[int, str]) -> str:
        if id not in self._student_id_to_internal_code:
            # TODO: code gen can not handle more than 17,576 (26**3) different students
            while True:
                code = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=3))
                if code in SKIPPED_CODES:
                    continue
                if code not in self._student_id_to_internal_code:
                    break
            self._student_id_to_internal_code[id] = code
        return self._student_id_to_internal_code[id]

