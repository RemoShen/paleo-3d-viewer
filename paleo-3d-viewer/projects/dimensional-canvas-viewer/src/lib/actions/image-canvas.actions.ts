import { createAction, props } from '@ngrx/store';
import { Fossil } from '../models/fossil.model';

export const openAnnotationDialog = createAction(
    '[Main-View] open-annotation-dialog'
)

export const openLensDialog = createAction(
    '[Main-View] open-lens-dialog',
    props<{fossils: Fossil[] | null}>()
)

export const openLengthDialog = createAction(
    '[Main-View] open-length-dialog'
)

export const openFullSizeDialog = createAction(
    '[Main-View] open-full-size-dialog'
)

export const toggle3D = createAction(
    '[Main-View] toggle-3d',
    props<{mode: string}>()
)