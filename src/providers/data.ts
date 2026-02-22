
import { MOCK_SUBJECTS } from '../constants/mockData';

import {BaseRecord, DataProvider, GetListParams, GetListResponse} from "@refinedev/core";


export const dataProvider: DataProvider = {

  getList: async <TData extends BaseRecord = BaseRecord>({resource}: GetListParams): Promise<GetListResponse<TData>> => {

    if (resource != 'subjects') {
      return {data: [] as TData[], total: 0}

    };

    return {
      data: MOCK_SUBJECTS as unknown as TData[],
      total: MOCK_SUBJECTS.length,
    }
  },
  getOne: async () => {throw new Error('This function is not present in Mock data provider')},
  create: async () => {throw new Error('This function is not present in Mock data provider')},
  update: async () => {throw new Error('This function is not present in Mock data provider')},
  deleteOne: async () => {throw new Error('This function is not present in Mock data provider')},

  getApiUrl: () => ''


}