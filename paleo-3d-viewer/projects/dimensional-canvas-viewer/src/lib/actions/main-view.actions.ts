import { createAction, props } from '@ngrx/store';
import { Fossil } from '../models/fossil.model';
import { Project } from '../models/project.model';

export const projectDataLoaded = createAction(
    '[Main-View] project-data-loaded',
    props<{project: Project}>()
)

export const fossilSelected = createAction(
    '[Main-View] fossil-selected',
    props<{fossil: Fossil | null}>()
)