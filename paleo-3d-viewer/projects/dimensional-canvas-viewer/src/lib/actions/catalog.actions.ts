import { createAction, props } from '@ngrx/store';
import { Fossil } from '../models/fossil.model';

export const openEditFossilDialog = createAction(
    '[Main-View] open-edit-fossil-dialog',
    props<{fossil: Fossil | null}>()
)