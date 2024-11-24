import { createAction, props } from '@ngrx/store';
import { Project } from '../models/project.model';

export const projectSelected = createAction(
    '[Project-picker-dialog] project-selected',
    props<{project: Project}>()
)