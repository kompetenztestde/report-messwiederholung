import {toRaw} from 'vue';

import type {
  DisplayClassDataType,
  ResultsListType,
  ResultsStatistics,
  ResultsType, ResultType
} from "@/types/resultTypes.ts";

import type {
  BirdType, CoordinateType, FlightPath, ResultTabPaneType,
  BirdPartColorsMapType, BirdSVGType
} from "@/types/visualTypes.ts";
import {calcResultsStatistics} from "@/views/util.ts";


import svg_templates from './birds.json';


export const y_axis_min = 10.;
export const y_axis_max = 85.;

export function scoreToY(score: number) {
  return score / 60 * (y_axis_max - y_axis_min) + y_axis_min;
}


export function get_tab_pane(
  testsResults: ResultsListType,
  bird_base_size: number,
  bird_color_map: BirdPartColorsMapType,
  tab_index?: number,  // if undefined, all tests are rendered (and there **must** be more than 1 test!)
  singleStudentCode?: string, // if defined, renders only one bird for each test with same size,
): ResultTabPaneType {

  const last_test_date_per_student_code: {[key: string]: number} = {};
  const last_test_index_per_student_code: {[key: string]: number} = {};
  const first_test_index_per_student_code: {[key: string]: number} = {};
  for (let i=0; i<testsResults.length; ++i) {
    const test = testsResults[i];
    for (const result of test.results) {
      last_test_date_per_student_code[result.studentCode] = test.date;
      last_test_index_per_student_code[result.studentCode] = i;
      if (typeof first_test_index_per_student_code[result.studentCode] === "undefined") {
        first_test_index_per_student_code[result.studentCode] = i;
      }
    }
  }

  let actualTestsResults = testsResults;
  // limit testsResults to the ones actually taken part by a student
  if (singleStudentCode) {
    actualTestsResults = testsResults.slice(
      first_test_index_per_student_code[singleStudentCode],
      1 + last_test_index_per_student_code[singleStudentCode]
    );
  }

  // range for y-axis in percent

  const get_group_x_and_width = (group_idx: number): number[] => {
    const margin = typeof tab_index === "number" ? .06 : .2;

    let group_x = 0;
    let group_width = 1.;

    if (typeof tab_index === "number") {
      // when showing single group, move the others out of screen
      group_x = (group_idx - tab_index) * 1.2;
      group_x = group_x + margin;
      group_width *= 1. - 2. * margin;
    }
    else {
      // display all groups, most recent is largest
      let big_group_width = .7;
      let small_group_width = (1. - big_group_width) / (actualTestsResults.length - 1);

      // for student-view, make all groups same size
      if (singleStudentCode) {
        big_group_width = 1. / actualTestsResults.length;
        small_group_width = big_group_width;
      }

      // get width of each group
      const group_widths = actualTestsResults.map(() => small_group_width);
      group_widths[group_widths.length - 1] = big_group_width;

      // get start-x of each group, incl. margin
      const group_starts: number[] = [];
      let x = 0.;
      for (const w of group_widths) {
        group_starts.push(x + w * margin);
        x += w;
      }

      group_x = group_starts[group_idx];

      // get optimal width
      const group_x_end = group_idx < group_starts.length - 1
        ? group_starts[group_idx + 1]
        : group_starts[group_idx] + group_widths[group_idx];

      group_width = (group_x_end - group_x) * (1. - 2. * margin);
    }
    if (group_idx === 0 && !singleStudentCode) {
      group_x += 0.02;
    }
    return [group_x * 100, group_width * 100];

  }
  const get_bucket = (y: number) => `${Math.floor(y / 10)}`;

  const get_birds = (
    test: ResultsType,
    group_x: number,
    group_width: number,
    size: number,
    showText: boolean,
  ): BirdType[] => {
    const birds_per_bucket: {[key: string]: BirdType[]} = {};

    for (const result_idx in test.results) {
      const result: ResultType = test.results[result_idx];

      if (singleStudentCode && result.studentCode !== singleStudentCode) {
        continue;
      }

      let bird_type = "glide";
      if (result.changeCount >= 7) { bird_type = "rise"; }
      if (result.changeCount <= -4) { bird_type = "sink"; }

      const bird_templates = svg_templates.templates[bird_type];
      const template_index = parseInt(result_idx) % bird_templates.length;
      const svg_template = bird_templates[template_index];

      const bird_svg: BirdSVGType = {
        viewBox: svg_template.viewBox,
        type: `${bird_type}-${template_index}`,
        outline: svg_template.outline,
        paths: [],
        outline_color: `color-mix(in srgb, ${bird_color_map[result.studentCode]['body'][0]} 50%, #fff)`,
      };
      for (const path of svg_template.paths) {
        const [color1, color2] = bird_color_map[result.studentCode][path.part];
        bird_svg.paths.push({
          d: path.path,
          style: {fill: `color-mix(in srgb, ${color1} ${(1-path.weight)*100}%, ${color2})`},
        });
      }

      const y = scoreToY(result.aggregatedResult);
      const bucket = get_bucket(y);
      const bird: BirdType = {
        x: 0,
        y: y,
        svg: bird_svg,
        size: size,
        style: {
          position: "absolute",
          left: "",
          bottom: "",
        },
        clip_path: `polygon(${svg_template.outline_polygon})`,
        showText: showText || last_test_date_per_student_code[result.studentCode] === test.date,
        nameReal: result.name || "?",
        nameCode: result.studentCode,
        result,
      }
      birds_per_bucket[bucket] = [...(birds_per_bucket[bucket] || []), bird];
    }

    const birds: BirdType[] = [];
    const max_bucket_length = Object.values(birds_per_bucket).reduce((max, b) => Math.max(max, b.length), 0);

    for (const bucket of Object.values(birds_per_bucket)) {
      for (const bucket_idx in bucket) {
        const bird = bucket[bucket_idx];
        const idx = parseInt(bucket_idx);
        const x = .5 + (idx - bucket.length/2 + .5) / max_bucket_length;
        //const x = parseInt(bucket_idx) % 2; // test for group_x & group_width
        //bird.y = (parseInt(bucket_idx) % 2) * (y_axis_max - y_axis_min) + y_axis_min; // test for y range
        bird.x = group_x + group_width * x;
        bird.style.left = `${bird.x}%`;
        bird.style.bottom = `${bird.y}%`;
        birds.push(bird);
      }
    }
    return birds;
  };

  const calc_cloud_coordinates = (statistics: ResultsStatistics[], full: boolean = false) => {
    const get_coord = (group_idx: number, top: boolean): CoordinateType => {
      const stats = statistics[group_idx];
      const [group_x, group_width] = get_group_x_and_width(group_idx);
      return {
        x: group_x + group_width / 2,
        y: full
          ? scoreToY(top ? stats.max : stats.min)
          //: scoreToY(stats.median + (top ? stats.std : -stats.std)),
          : scoreToY(top ? stats.percentiles[25] : stats.percentiles[75]),
      };
    }
    const points: CoordinateType[] = [];
    for (let idx=0; idx<statistics.length; ++idx) {
      const c = get_coord(idx, true);
      if (idx === 0) {
        points.push({x: -50, y: c.y});
      }
      points.push({...c, interpolate: true});
      if (idx === statistics.length - 1) {
        points.push({x: 150, y: c.y});
      }
    }
    for (let idx=statistics.length - 1; idx>=0; --idx) {
      const c = get_coord(idx, false);
      if (idx === statistics.length - 1) {
        points.push({x: 150, y: c.y});
      }
      points.push({...c, interpolate: true});
      if (idx === 0) {
        points.push({x: -50, y: c.y});
      }
    }
    return interpolatePolygonPoints(points);
  };

  const calc_flight_paths = (birds: BirdType[]): FlightPath[] => {
    const thickness = bird_base_size * .06;
    const change_influence = thickness / 30;
    const code_set: Set<string> = new Set();
    for (const bird of birds) {
      code_set.add(bird.nameCode);
    }
    const flight_paths: FlightPath[] = [];
    for (const code of code_set) {
      const birds_of_code = (
        birds
          .filter(b => b.nameCode === code)
          .sort((a, b) => a.x - b.x)
      );
      if (birds_of_code.length > 1) {
        const coords: CoordinateType[] = [];
        for (const bird of birds_of_code) {
          coords.push({
            x: bird.x - change_influence * Math.max(0, bird.result.changeCount),
            y: bird.y + thickness,
            interpolate: true
          });
          coords.push({
            x: bird.x + change_influence * Math.max(0, -bird.result.nextChangeCount),
            y: bird.y + thickness,
            interpolate: true
          });
        }
        for (const bird of birds_of_code.reverse()) {
          coords.push({
            x: bird.x + change_influence * Math.max(0, bird.result.nextChangeCount),
            y: bird.y - thickness,
            interpolate: true
          });
          coords.push({
            x: bird.x - change_influence * Math.max(0, -bird.result.changeCount),
            y: bird.y - thickness,
            interpolate: true
          });
        }
        const coordinates = interpolatePolygonPoints(coords);
        flight_paths.push({
          studentCode: code,
          polygon: {
            coordinates,
            style: {
              'clip-path': `polygon(${coordinates.map(c => `${c.x}% ${100 - c.y}%`).join(', ')})`,
              'background-color': bird_color_map[code].body[1],
              //'border': `1px solid ${bird_color_map[code].wing[1]}`,
            },
          }
        });
      }
    }

    return flight_paths;
  };

  const tab_pane: ResultTabPaneType = {
    name: typeof tab_index === "number" ? testsResults[tab_index].date : "Entwicklung",
    headers: [],
    birds: [],
    cloud_polygons: [],
  };
  const test_statistics: ResultsStatistics[] = [];
  for (const test_idx in actualTestsResults) {
    const test: ResultsType = actualTestsResults[test_idx];

    const [group_x, group_width] = get_group_x_and_width(parseInt(test_idx));

    tab_pane.headers.push({
      text: test.date,
      tab_pane_name: test.date,
      style: {
        left: `${group_x + .5 * group_width}%`,
        bottom: `90%`,
      }
    });

    let bird_size = bird_base_size;
    if (typeof tab_index === "number" || singleStudentCode) {
      if (singleStudentCode) {
        // set birds a bit larger when only 1 or 2 tests made
        if (actualTestsResults.length === 1) {
          bird_size *= 1.6;
        } else if (actualTestsResults.length === 2) {
          bird_size *= 1.3;
        }
      }
    } else {
      // set bird size smaller for each previous test
      bird_size = parseInt(test_idx) == actualTestsResults.length - 1
        ? bird_base_size * .7
        : parseInt(test_idx) == actualTestsResults.length - 2
          ? bird_base_size * .4
          : bird_base_size * .3;
    }
    tab_pane.birds = tab_pane.birds.concat(
      get_birds(
        test,
        group_x,
        group_width,
        bird_size,
        typeof tab_index === "number" || parseInt(test_idx) === (actualTestsResults.length - 1)
      )
    );
    test_statistics.push(calcResultsStatistics(test));
    //console.log("STATS", test_statistics[test_statistics.length - 1]);
  }

  if (!singleStudentCode) {
    const coordinates1 = calc_cloud_coordinates(test_statistics, true);
    const coordinates2 = calc_cloud_coordinates(test_statistics, false);

    tab_pane.cloud_polygons = [
      {
        coordinates: coordinates1,
        class: "cloud-back",
        style: {
          'clip-path': `polygon(${coordinates1.map(c => `${c.x}% ${100 - c.y}%`)})`
        },
      },
      {
        coordinates: coordinates2,
        class: "cloud-front",
        style: {
          'clip-path': `polygon(${coordinates2.map(c => `${c.x}% ${100 - c.y}%`)})`
        },
      },
    ];
  }
  tab_pane.flight_paths = calc_flight_paths(tab_pane.birds);

  //console.log("BIRDS", tab_pane.birds);
  //console.log("BIRDS", tab_pane.name, tab_pane.birds.map(b => b.style.left));

  return tab_pane;
}


/** generates smoothy curves for all coordinates that have `interpolate=true`
 when interpolating, x is linear (t), y is t*t(3-2*t)
 */
export const interpolatePolygonPoints = (points: CoordinateType[], steps: number = 100): CoordinateType[] => {
  const ret_points: CoordinateType[] = [];
  for (let i=0; i<points.length; ++i) {
    const p = points[i];
    if (!p.interpolate || i == points.length - 1) {
      ret_points.push(p);
    } else {
      const next_p = points[i + 1];
      if (p.x === next_p.x && p.y === next_p.y) {
        ret_points.push(p);
      } else {
        for (let j = 0; j < steps; ++j) {
          const t = j / steps;
          const t2 = t * t * (3 - 2 * t);
          ret_points.push({
            x: p.x + t * (next_p.x - p.x),
            y: p.y + t2 * (next_p.y - p.y),
          });
        }
      }
    }
  }
  return ret_points;
};


export const BIRD_COLOR_TYPES = [
  {type: "eye", name: "Auge", count: 1},
  {type: "feet", name: "Füße", count: 1},
  {type: "beak", name: "Schnabel", count: 1},
  {type: "body", name: "Körper", count: 2},
  {type: "wing", name: "Flügel", count: 2},
];


export const BIRD_PART_COLORS = {
  "eye": ["#000000", "#0000a0"],
  "feet": ["#000000", "#503000"],
  "beak": ["#a05040", "#c05040", "#000000", "#c0c000"],
  "body": [
    ["#60a070", "#409040"],
    ["#7060a0", "#505080"],
    ["#a0a050", "#a06030"],
    ["#a06040", "#a03010"],
    ["#706040", "#405090"],
  ],
  "wing": [
    ["#80c090", "#307030"],
    ["#8090d0", "#5060a0"],
    ["#60a0b0", "#104090"],
    ["#c090d0", "#b060a0"],
    ["#c05040", "#802010"],
    ["#c09080", "#906050"],
    ["#b08030", "#905000"],
  ],
}

export function get_bird_color_map_from_results(allTestsResults) {
  const all_codes: Set<string> = new Set();
  for (const results of allTestsResults) {
    for (const result of results.results) {
      all_codes.add(result.studentCode);
    }
  }
  return get_bird_color_map(Array.from(all_codes).sort());
}

export function get_bird_color_map(codes: string[]): BirdPartColorsMapType {
  const bird_color_map: BirdPartColorsMapType = {};
  const index_map: {[key: string]: number} = {};
  for (const code of codes) {
    bird_color_map[code] = {};

    for (const part of Object.keys(BIRD_PART_COLORS)) {
      const possible_colors = BIRD_PART_COLORS[part];
      let index: number = (index_map[part] || 0);
      const colors = possible_colors[index];
      index += 1;
      if (index == possible_colors.length) {
        index = 0;
      }
      index_map[part] = index;

      bird_color_map[code][part] = typeof colors === "string" ? [colors, colors] : colors;
      const ls_color_0 = localStorage.getItem(`color-${code}-${part}-0`);
      const ls_color_1 = localStorage.getItem(`color-${code}-${part}-1`);
      if (ls_color_0) bird_color_map[code][part][0] = ls_color_0;
      if (ls_color_1) bird_color_map[code][part][1] = ls_color_1;
    }
  }
  return bird_color_map;
}


function toRawDeep<T>(observed: T): T {
  const val = toRaw(observed);

  // add any classes, that you want to support:
  if (val instanceof Date) return val;

  if (Array.isArray(val)) {
    return val.map(toRawDeep) as T;
  }

  if (val === null) return null as T;

  if (typeof val === 'object') {
    const entries = Object.entries(val).map(([key, val]) => [key, toRawDeep(val)]);

    return Object.fromEntries(entries);
  }

  return val;
}


export function getOneStudentsDisplayData(displayData: DisplayClassDataType, code: string): DisplayClassDataType {

  let reducedData = structuredClone(toRawDeep(displayData))

  if (reducedData.tab_panes) {
    let newTabPanes = []
    for (let tabPane of reducedData.tab_panes) {
      tabPane.cloud_polygons = []
      const newBirds = []
      for (const bird of tabPane.birds) {
        if (bird.nameCode === code) {
          newBirds.push(bird)
        }
      }
      tabPane.birds = newBirds
      if (tabPane.flight_paths) {
        for (const flight_path of tabPane.flight_paths) {
          if (flight_path.studentCode === code) {
            tabPane.flight_paths = [flight_path]

          }
        }
      }
      newTabPanes.push(tabPane)
    }
    reducedData.tab_panes = newTabPanes
  }

  return reducedData
}


/*

document.querySelectorAll(".bird-container").forEach(e => {console.log(e.getAttribute("style").indexOf("clip-path"), e.querySelector(".bird").classList)})

 */
