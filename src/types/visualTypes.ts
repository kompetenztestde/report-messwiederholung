import type {ResultType} from "@/types/resultTypes.ts";


export type BirdContainerStyleObjectType = {
  position: "absolute",
  left: string,
  bottom: string,
};

export type BirdSVGType = {
  viewBox: string,
  type: string,
  outline: string,
  outline_color: string,
  paths: {
    d: string
    style: {
      fill: string,
    },
  }[],
}

export type BirdType = {
  x: number,
  y: number,
  svg: BirdSVGType,
  size: number,
  style: BirdContainerStyleObjectType,
  clip_path: string,
  showText: boolean,
  nameReal: string,
  nameCode: string,
  result: ResultType,
};

export type CoordinateType = {
  x: number,
  y: number,
  interpolate?: boolean,
};

export type PolygonType = {
  coordinates: CoordinateType[];
  class?: string,
  style: {
    'clip-path': string,
    'background-color'?: string,
  }
}

export type FlightPath = {
  polygon: PolygonType,
  studentCode: string,
}

export type HeaderType = {
  text: string,
  tab_pane_name: string,
  style: {
    left: string,
    bottom: string,
  },
};

// originally was a tab pane, includes all displayed elements for single or multi-group view
// all birds, polygons and flight paths are always present and have the same number of coordinates
// so css transitions work when switching views
export type ResultTabPaneType = {
  name: string,
  headers: HeaderType[],
  birds: BirdType[],
  cloud_polygons: PolygonType[],
  flight_paths?: FlightPath[],
}

export type BirdPartColorsType = {
  [key: string]: string
};

export type BirdPartColorsMapType = {
  [key: string]: BirdPartColorsType
};
