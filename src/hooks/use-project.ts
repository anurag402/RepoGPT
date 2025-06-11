import { api } from '@/trpc/react'
import {useLocalStorage} from 'usehooks-ts'
import React from 'react';

const useProject = () => {
    const {data: projects} = api.project.getProjects.useQuery();
    const [projectId, setProjectId] = useLocalStorage('projectid', '');
    const project = projects?.find(project => project.id === projectId);
    return {
        projects,
        project,
        projectId,
        setProjectId
    }
}

export default useProject