import {createDataProvider, CreateDataProviderOptions} from "@refinedev/rest";

import {BACKEND_BASE_URL} from "@/constants";
import {CreateResponse, ListResponse} from "@/types";
import {HttpError} from "@refinedev/core";

const buildHttpError = async ( response: Response):Promise<HttpError> => {
    let message = 'Request failed.';
    try {
        const payload = (await response.json()) as {message?: string}


        if (payload?.message) message = payload.message;

    }catch{
        // ignor errors
    }
    return {
        message,
        statusCode: response.status
    }
}

// Helper function to flatten filter groups
const flattenFilters = (filters: any[]): any[] => {
    const result: any[] = [];
    filters?.forEach((filter) => {
        if (filter && typeof filter === 'object') {
            if ('operator' in filter && 'value' in filter && Array.isArray(filter.value)) {
                // This is a filter group (AND/OR)
                result.push(...flattenFilters(filter.value));
            } else if ('field' in filter) {
                // This is a simple filter
                result.push(filter);
            }
        }
    });
    return result;
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
      buildQueryParams: async({resource , pagination , filters})=>{
        const page = pagination?.currentPage ?? 1 ;
        const pageSize=pagination?.pageSize ?? 10 ;

        const params: Record<string, string|number> ={page,limit : pageSize};

        // Flatten any nested filter groups
        const flatFilters = flattenFilters(filters || []);

        flatFilters.forEach((filter) => {
            const field = filter.field;
            const value = String(filter.value);
            if (resource === 'subjects'){
                if(field === 'department' || field === 'department.name') params.department= value ;
                if ((field === 'name' || field === 'code') && !params.search) {
                    params.search = value;
                }
            }
            if (resource === 'classes'){
                if(field === 'subjectId') params.subjectId = value;
                if(field === 'teacherId') params.teacherId = value;
                if (field === 'name' && !params.search) {
                    params.search = value;
                }
            }
          })
          return params ;
      },
    mapResponse: async (response) => {
        if (!response.ok) throw await buildHttpError(response);
        const payload: ListResponse = await response.clone().json();
        return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },
    create: {
      getEndpoint: ({ resource }) => resource,
      buildQueryParams: async({variables})=> variables,
        mapResponse: async (response) => {
          const json:CreateResponse = await response.json();
          return json.data ?? [] ;
        }
      },

};
const {dataProvider} = createDataProvider(BACKEND_BASE_URL, options);
export {dataProvider};
