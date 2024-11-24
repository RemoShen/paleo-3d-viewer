import { createAction, props } from '@ngrx/store';

export const openMarkFossilsDialog = createAction(
    '[Main-View] open-mark-fossils-dialog',
    props<{scan_id: string | null}>()
)

export const openEditScansDialog = createAction(
    '[Main-View] open-edit-scans-dialog',
    props<{scan_id: string | null}>()
)