import { RequestDataPoint } from './RequestDataPoint.js';

export interface RequestState {
  data?: {
    movement?: {
      datapoints?: RequestDataPoint[];
    };
  };
}
