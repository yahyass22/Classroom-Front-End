import {ListView} from "@/components/refine-ui/views/list-view.tsx";
import {Breadcrumb} from "@/components/refine-ui/layout/breadcrumb.tsx";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useMemo, useState} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select.tsx";
import {SelectValue} from "@/components/ui/select.tsx";
import {DEPARTEMENT_OPTIONS} from "@/constants";
import {CreateButton} from "@/components/refine-ui/buttons/create.tsx";
import {DataTable} from "@/components/refine-ui/data-table/data-table.tsx";
import {useTable} from "@refinedev/react-table";
import {Subject} from "@/types";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge.tsx";

const SubjectsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartement, setSelectedDepartement] = useState('all');

    const departementFilters = selectedDepartement ==='all' ? []: [
        {field: 'departement' , operator: 'eq' as const , value: selectedDepartement }
    ];
    const searchFilters = searchQuery ?[
        {field: 'name', operator: 'contains' as const, value: searchQuery}
    ]: [];
    const subjectTable= useTable<Subject>({
     columns:useMemo<ColumnDef<Subject>[]>(()=>[
            {
            id: 'Code', accessorKey: 'Code', size: 100,
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
                id: 'departement', accessorKey: 'departement', size: 150,
                header: ()=> <p className="column-title">Departement</p>,
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
            filters:{
                permanent: [...departementFilters, ...searchFilters]
            },
            sorters:{
                initial: [
                    {field: 'id' , order:'desc'}
            ]
        },
    }
    });


    return (
        <ListView>
            <Breadcrumb/>
            <h1 className="page-titles">Subjects</h1>

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
                        <Select value={selectedDepartement} onValueChange={setSelectedDepartement}>
                           <SelectTrigger>
                               <SelectValue placeholder="Filter by Departement"/>
                           </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Departements
                                </SelectItem>
                                {DEPARTEMENT_OPTIONS.map(departement =>(
                                    <SelectItem key={departement.value} value={departement.value}>

                                        {departement.label}

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
