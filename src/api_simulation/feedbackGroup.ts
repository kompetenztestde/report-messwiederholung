import type { FeedbackGroupResponseType } from "@/types/resultTypes.ts";

export function getFeedbackGroup(testTypeId: number): FeedbackGroupResponseType {
  return {
    "id": 1,
    "name": "Leseflüssigkeit",
    "subtests": [
      {
        "id": 1,
        "name": "Wortverständnis",
        "unitIds": { "2025 März": "Wort_TBA_N1", "2025 Herbst": "Wort_TBA_N2", "2025 April": "Wort_TBA_N4" },
        "aggregationType": null,
        "scoreType": "difference",
        "children": []
      },
      {
        "id": 2,
        "name": "Satzverständnis",
        "unitIds": { "2025 März": "Satz_TBA_N3", "2025 Herbst": "Satz_TBA_N2", "2025 April": "Satz_TBA_N4" },
        "aggregationType": null,
        "scoreType": "difference",
        "children": []
      }
    ],
    "scoring": { "maxScore": 60, "minScore": 0 },
    "referenceValues": {
      "2. Klasse": { "low": 14, "high": 30, "middle": 22 },
      "3. Klasse": { "low": 26, "high": 41, "middle": 32 },
      "4. Klasse": { "low": 33, "high": 47, "middle": 40 }
    },
    "testTypeId": 1,
    "aggregationType": "average"
  }
}
