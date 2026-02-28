import {ListView} from "@/components/refine-ui/views/list-view.tsx";
import {Breadcrumb} from "@/components/refine-ui/layout/breadcrumb.tsx";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useMemo, useState, useEffect, useRef} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select.tsx";
import {SelectValue} from "@/components/ui/select.tsx";
import {DEPARTMENT_OPTIONS} from "@/constants";
import {CreateButton} from "@/components/refine-ui/buttons/create.tsx";
import {DataTable} from "@/components/refine-ui/data-table/data-table.tsx";
import {useTable} from "@refinedev/react-table";
import {Subject} from "@/types";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge.tsx";

const SubjectsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selecteddepartment, setSelecteddepartment] = useState('all');
    
    // Debounce search query to reduce API calls
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms debounce

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const departmentFilters = selecteddepartment === 'all' ? [] : [
        { field: 'department', operator: 'eq' as const, value: selecteddepartment }
    ];
    const searchFilters = debouncedSearchQuery ?[
        {field: 'name', operator: 'contains' as const, value: debouncedSearchQuery}
    ]: [];
    const subjectTable= useTable<Subject>({
     columns:useMemo<ColumnDef<Subject>[]>(()=>[
         {
             id: 'code', accessorKey: 'code', size: 100,
             header: ()=> <p className="column-title ml-2">Code</p>,
             cell: ({getValue}) => <Badge>{getValue<string>()}</Badge>
         },
            {
                id: 'name', accessorKey: 'name', size: 200,
                header: ()=> <p className='column-title'>Name</p>,
                cell: ({getValue}) => <span className = "text-foreground">{getValue<string>()} </span>,
                filterFn: 'includesString'
            },
            {
                id: 'department', accessorKey: 'department.name', size: 150,
                header: ()=> <p className="column-title">Department</p>,
                cell: ({getValue}) => <Badge variant="secondary">{getValue<string>()}</Badge>,
            },
            {
                id: 'description', accessorKey: 'description', size: 300,
                header: ()=> <p className="column-title">Description</p>,
                cell: ({getValue}) => <span className="truncate line-clamp-2">{getValue<string>()}</span>
            }



    ],[]),
        refineCoreProps:{
            resource: 'subjects',
            pagination: {pageSize: 10 , mode: 'server'},
            sorters:{
                initial: [
                    {field: 'id' , order:'desc'}
            ]
        },
    }
    });

    const {
        refineCore: { setFilters },
    } = subjectTable;

    useEffect(() => {
        setFilters([
            ...departmentFilters,
            ...searchFilters
        ], 'replace');
    }, [debouncedSearchQuery, selecteddepartment, setFilters]);


    return (
        <ListView>
            <Breadcrumb/>
            <h1 className="page-title">Subjects</h1>

                <div className="intro-row">
                <p> Quick Access to essential Metrics and Management tools.</p>
                    <div className="actions-row">
                    <div className="search-field">
                    <Search className="search-icon" />
                    <Input
                        type="text"
                        placeholder="search by name..."
                        className="pl-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={selecteddepartment} onValueChange={setSelecteddepartment}>
                           <SelectTrigger>
                               <SelectValue placeholder="Filter by department"/>
                           </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Departments
                                </SelectItem>
                                {DEPARTMENT_OPTIONS.map(department =>(
                                    <SelectItem key={department.value} value={department.value}>

                                        {department.label}

                                    </SelectItem>
                                ))}
                            </SelectContent>

                        </Select>
                        <CreateButton/>
                    </div>

                </div>
            </div>
            <DataTable table={subjectTable}/>
        </ListView>
    )
}
export default SubjectsList
